import hashlib
import json
import math
from uuid import UUID

from odoo import api, exceptions, fields, models


class TexonBridgeService(models.AbstractModel):
    _name = "texon.bridge.service"
    _description = "Authorized, atomic Texon business workflows"

    def _company_service(self, company_id):
        if not self.env.user.has_group("texon_bridge.group_integration"):
            raise exceptions.AccessError("Texon integration access is required.")
        if type(company_id) is not int or company_id not in self.env.user.company_ids.ids:
            raise exceptions.AccessError("Company is not allowed.")
        return self.with_company(company_id).with_context(allowed_company_ids=[company_id])

    def _order_result(self, order):
        return {
            "id": order.id, "name": order.name, "state": order.state,
            "partner_id": order.partner_id.id, "partner_name": order.partner_id.name,
            "amount_total": str(order.amount_total), "currency": order.currency_id.name,
            "revision": order.write_date.isoformat(timespec="microseconds"),
            "client_order_ref": order.client_order_ref or "",
        }

    @api.model
    def read_workspace(self, company_id, section="sales", limit=20, offset=0, record_id=None):
        service = self._company_service(company_id)
        if type(limit) is not int or not 1 <= limit <= 100 or type(offset) is not int or not 0 <= offset <= 100000:
            raise exceptions.ValidationError("Invalid pagination.")
        models_by_section = {
            "sales": ("sale.order", ["name", "state", "partner_id", "amount_total", "currency_id", "write_date"]),
            "partners": ("res.partner", ["name"]),
            "products": ("product.product", ["name", "default_code", "uom_id", "list_price"]),
            "inventory": ("stock.quant", ["product_id", "location_id", "lot_id", "quantity", "reserved_quantity"]),
            "production": ("mrp.production", ["name", "state", "product_id", "product_qty", "uom_id"]),
        }
        if section not in models_by_section:
            raise exceptions.ValidationError("Unsupported workspace section.")
        model_name, columns = models_by_section[section]
        Model = service.env[model_name]
        domain = [("company_id", "=", company_id)]
        if section in ("partners", "products"):
            domain = [("company_id", "in", [False, company_id]), ("active", "=", True)]
        if section == "inventory":
            domain.append(("location_id.usage", "=", "internal"))
        if record_id is not None:
            if type(record_id) is not int or record_id < 1:
                raise exceptions.ValidationError("Invalid record reference.")
            domain.append(("id", "=", record_id))
        records = Model.search(domain, limit=limit, offset=offset, order="id desc")
        rows = [service._order_result(order) for order in records] if section == "sales" else records.read(columns)
        return {"results": rows, "count": Model.search_count(domain), "as_of": fields.Datetime.now().isoformat(), "company_id": company_id}

    @api.model
    def execute_atomic_command(self, operation_uuid, company_id, command_name, payload=None, actor_id=None):
        service = self._company_service(company_id)
        try:
            operation_uuid = str(UUID(operation_uuid))
        except (ValueError, TypeError, AttributeError):
            raise exceptions.ValidationError("Invalid operation identity.") from None
        if not isinstance(actor_id, str) or not actor_id or len(actor_id) > 128:
            raise exceptions.ValidationError("An authenticated actor reference is required.")
        handlers = {"sales.create": service._create_sale, "sales.confirm": service._confirm_sale}
        if command_name not in handlers or not isinstance(payload, dict):
            raise exceptions.ValidationError("Unsupported command or parameters.")
        try:
            body = json.dumps([company_id, actor_id, command_name, payload], sort_keys=True, separators=(",", ":"), allow_nan=False)
        except (ValueError, TypeError):
            raise exceptions.ValidationError("Invalid command parameters.") from None
        fingerprint = hashlib.sha256(body.encode()).hexdigest()
        # Serialize the same idempotency key BEFORE business effects. Odoo's
        # request retry handles concurrent repeatable-read serialization races.
        lock = int.from_bytes(hashlib.sha256(operation_uuid.encode()).digest()[:8], "big", signed=True)
        service.env.cr.execute("SELECT pg_advisory_xact_lock(%s)", [lock])
        Receipt = service.env["texon.command.receipt"]
        existing = Receipt.search([("operation_uuid", "=", operation_uuid)], limit=1)
        if existing:
            if existing.company_id.id != company_id or existing.payload_hash != fingerprint:
                raise exceptions.ValidationError("Operation identity was reused with different parameters.")
            return json.loads(existing.response_data)
        result = handlers[command_name](payload)
        # Narrow elevated write: users cannot create or alter receipts directly.
        Receipt.sudo().create({
            "operation_uuid": operation_uuid, "company_id": company_id,
            "command_name": command_name, "payload_hash": fingerprint,
            "response_data": json.dumps(result), "status": "success", "executed_by": actor_id,
        })
        return result

    def _create_sale(self, payload):
        if set(payload) != {"partner_id", "client_order_ref", "lines"}:
            raise exceptions.ValidationError("Invalid quotation fields.")
        partner_id = payload["partner_id"]
        if type(partner_id) is not int:
            raise exceptions.ValidationError("Invalid buyer.")
        partner = self.env["res.partner"].search([("id", "=", partner_id), ("company_id", "in", [False, self.env.company.id])], limit=1)
        if not partner:
            raise exceptions.ValidationError("Buyer is not available in this company.")
        lines = payload["lines"]
        if not isinstance(lines, list) or not 1 <= len(lines) <= 100:
            raise exceptions.ValidationError("Provide 1–100 quotation lines.")
        commands = []
        for line in lines:
            if not isinstance(line, dict) or set(line) != {"product_id", "quantity", "unit_price"} or type(line["product_id"]) is not int:
                raise exceptions.ValidationError("Invalid quotation line.")
            product = self.env["product.product"].search([("id", "=", line["product_id"]), ("company_id", "in", [False, self.env.company.id]), ("sale_ok", "=", True)], limit=1)
            try:
                qty, price = float(line["quantity"]), float(line["unit_price"])
            except (ValueError, TypeError):
                raise exceptions.ValidationError("Invalid quantity or price.") from None
            if not product or not math.isfinite(qty) or not math.isfinite(price) or qty <= 0 or price < 0:
                raise exceptions.ValidationError("Invalid product, quantity or price.")
            commands.append(fields.Command.create({"product_id": product.id, "product_uom_qty": qty, "price_unit": price}))
        reference = payload["client_order_ref"]
        if not isinstance(reference, str) or len(reference) > 128:
            raise exceptions.ValidationError("Invalid buyer reference.")
        order = self.env["sale.order"].create({"company_id": self.env.company.id, "partner_id": partner.id, "client_order_ref": reference, "order_line": commands})
        return self._order_result(order)

    def _confirm_sale(self, payload):
        if set(payload) != {"order_id", "expected_revision"} or type(payload["order_id"]) is not int:
            raise exceptions.ValidationError("Invalid confirmation parameters.")
        order = self.env["sale.order"].search([("id", "=", payload["order_id"]), ("company_id", "=", self.env.company.id)], limit=1)
        if not order:
            raise exceptions.AccessError("Order is not available in this company.")
        order.check_access("write")
        self.env.cr.execute("SELECT id FROM sale_order WHERE id = %s FOR UPDATE", [order.id])
        order.invalidate_recordset()
        if order.write_date.isoformat(timespec="microseconds") != payload["expected_revision"]:
            raise exceptions.ValidationError("Order changed. Refresh and review it again.")
        if order.state not in ("draft", "sent") or not order.order_line:
            raise exceptions.ValidationError("Only a nonempty quotation can be confirmed.")
        order.action_confirm()
        return self._order_result(order)
