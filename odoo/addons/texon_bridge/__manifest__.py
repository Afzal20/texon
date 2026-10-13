{
    "name": "Texon Odoo Integration Bridge",
    "version": "20.0.1.0.0",
    "category": "Manufacturing/Apparel",
    "summary": "Atomic JSON-2 RPC bridge and idempotent command receipts for Texon Apparel ERP",
    "author": "Texon Technologies",
    "website": "https://github.com/Afzal20/texon",
    "license": "LGPL-3",
    "depends": ["base", "sale", "mrp", "stock", "purchase"],
    "data": [
        "security/ir.model.access.csv",
    ],
    "installable": True,
    "application": False,
    "auto_install": False,
}
