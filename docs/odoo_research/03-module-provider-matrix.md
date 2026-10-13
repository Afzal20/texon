# Odoo module provider evidence and remaining gates

> Observed: 2026-10-13, local `texon-odoo-web` container.
> Runtime: `Odoo Server 20.0-20260926`.
> Image ID: `sha256:cdd83e8359b3e8c357895d476396c05021fed9975bf420f353bab25fcaed1533`.
> Verification level: source availability only; no database installation, business workflow, localization, or permission completion is claimed.

## Reproducible inspection

[Inspector](../../scripts/inspect_odoo_modules.py) parses addon manifests as data, without importing their code or accessing a database. It records source hashes, explicit manifest versions/licenses/dependencies, missing direct dependency sources, and disabled modules. Raw manifest versions may be absent or relative; they are not a complete installed Odoo module version.

```bash
docker exec -i texon-odoo-web python3 - \
  --addons-path /usr/lib/python3/dist-packages/odoo/addons \
  --addons-path /mnt/extra-addons \
  < scripts/inspect_odoo_modules.py
```

Run from the repository root. Supply all configured addon roots in Odoo's precedence order. The command only reads source; it does not install or upgrade modules. The [captured JSON report](module-source-inventory.json) is dated evidence and must be regenerated for another image/addon set. Presence of direct dependencies does not establish recursive compatibility or successful installation.

## Provider matrix for the 13 areas

| Area | Candidate source observed locally | Remaining gate before delivery |
|---|---|---|
| Sales | `sale`, `crm`; LGPL-3 manifests present | Install/configure in isolated test DB; quotation, confirmation, amendment, and access tests |
| Website | `website`, `portal`; LGPL-3 manifests present | Buyer ownership, document privacy, session integration, and portal workflows |
| Helpdesk | Neither `helpdesk` nor `helpdesk_mgmt` present | Select compatible provider and verify license/dependencies, SLA/email capability, and workflow |
| Services | `project`, `hr_timesheet`; LGPL-3 manifests present | Sample-service task, time, cost, and authorization workflows |
| Appraisals | `hr_appraisal` absent | Verify compatible addon or licensed Enterprise provider and review privacy |
| Accounting | `account`; LGPL-3 manifest present | Select localization/reporting capabilities; validate posting, payments, reconciliation, valuation, and closing |
| Sign | `sign` absent | Verify signing addon/provider, license, identity/document evidence, and integration |
| Supply Chain | `purchase`, `stock`; LGPL-3 manifests present | Partial receipt, holds, reservations, returns, units, and reconciliation |
| Productivity | `project`, `calendar`; LGPL-3 manifests present; `knowledge` absent | Task/activity workflows; separately select document/SOP provider |
| Marketing | `crm`, `mass_mailing`; LGPL-3 manifests present | Consent/opt-out, authorized audience, controlled email delivery, and result reporting |
| Human Resources | `hr`, `hr_holidays`, `hr_attendance`; LGPL-3 manifests present; standalone `hr_contract` absent | Verify selected release's contract model/provider and private-field boundaries; optional localized payroll remains disabled |
| Administration | Selected core module security still requires configuration | Restricted integration user, company/record rules, revocation, audit, and recovery tests |
| Manufacturing | `mrp`, `mrp_subcontracting`; LGPL-3 manifests present | Approved variant BOM, intermediate progress/final stock separation, consumption/scrap, partial production, and quality gates |

## Decision and installation record still required

Community remains the provisional baseline. Source inspection confirms that several requested suite providers are absent from this image. Do not expose those areas as working features or assume installing an older OCA branch resolves the gap.

For each chosen provider, fill in: exact source commit/package, complete dependency set, license, maintenance owner, infrastructure/subscription cost, installation result in an isolated database, supported API/actions, permission tests, and workflow acceptance. Obtain the client's financial/localization requirements before claiming production accounting/payroll support.

Backlog T002 and T009 remain incomplete until their provider and installation/workflow gates pass. The inspection tooling is one completed reviewable increment within that discovery work, not proof that all 13 modules are delivered.
