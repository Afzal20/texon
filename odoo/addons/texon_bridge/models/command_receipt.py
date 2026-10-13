from odoo import models, fields


class TexonCommandReceipt(models.Model):
    _name = "texon.command.receipt"
    _description = "Idempotent Execution Receipt for Texon Commands"
    _order = "create_date desc"

    operation_uuid = fields.Char("Operation UUID", required=True, index=True, readonly=True)
    company_id = fields.Many2one("res.company", "Company", required=True, index=True, readonly=True)
    command_name = fields.Char("Command Name", required=True, readonly=True)
    payload_hash = fields.Char("Payload Hash", required=True, readonly=True)
    response_data = fields.Text("Serialized Response JSON", readonly=True)
    status = fields.Selection([("success", "Success"), ("failed", "Business Failure")], required=True, default="success")
    executed_by = fields.Char("External Actor Ref", readonly=True)

    _sql_constraints = [
        ("unique_operation_uuid", "unique(operation_uuid)", "Operation UUID must be globally unique!")
    ]
