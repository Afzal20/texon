import hashlib
import json
from odoo import models, api, exceptions


class TexonBridgeService(models.AbstractModel):
    _name = "texon.bridge.service"
    _description = "Atomic Facade for Texon Integration"

    def _hash_payload(self, payload):
        serialized = json.dumps(payload, sort_keys=True)
        return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

    @api.model
    def execute_atomic_command(self, operation_uuid, company_id, command_name, payload=None):
        if payload is None:
            payload = {}

        Receipt = self.env["texon.command.receipt"]
        existing = Receipt.search([("operation_uuid", "=", operation_uuid)], limit=1)
        if existing:
            if existing.payload_hash != self._hash_payload(payload):
                raise exceptions.UserError("Operation UUID reused with altered payload.")
            return json.loads(existing.response_data or "{}")

        company = self.env["res.company"].browse(company_id) if company_id else self.env.company
        if not company.exists():
            raise exceptions.UserError(f"Target company {company_id} does not exist.")

        env = self.env(context=dict(self.env.context, allowed_company_ids=[company.id]))
        with env.cr.savepoint():
            handler = getattr(self, f"_handle_{command_name}", None)
            if not handler:
                if command_name == "ping":
                    result = {
                        "status": "pong",
                        "server_version": self.sudo().env["ir.module.module"].search([("name", "=", "base")], limit=1).latest_version or "20.0",
                        "company": company.name,
                    }
                else:
                    raise exceptions.UserError(f"Unsupported command: {command_name}")
            else:
                result = handler(env, company, payload)

            Receipt.create({
                "operation_uuid": operation_uuid,
                "company_id": company.id,
                "command_name": command_name,
                "payload_hash": self._hash_payload(payload),
                "response_data": json.dumps(result),
                "status": "success",
                "executed_by": payload.get("actor_id", "system"),
            })
            return result
