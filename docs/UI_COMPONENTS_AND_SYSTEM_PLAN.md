# Texon UI Components and System Plan

> Status: UI design discussion and proposed delivery plan.
> Scope: Odoo-powered garments ERP workspace, buyer portal, and AI assistant.
> Align implementation with the [product scope](GARMENT_ERP_13_MODULES_MASTER_PLAN.md). This document does not establish which features are already implemented.

## Design direction

Texon's UI should feel like one connected business workspace. Users should be able to find an order, understand its status, and act on it without navigating through unrelated modules.

Odoo remains the business engine. Texon provides the screens, navigation, dashboards, buyer portal, and AI assistant.

## 1. Application structure

Use a consistent layout across the system.

| Component | Purpose |
|---|---|
| Sidebar | Role-based navigation, grouped by business function |
| Header | Company selector, global search, notifications, profile |
| Page header | Title, breadcrumb, record status, primary action |
| Workspace | Filters, useful summaries, records, and pending work |
| Detail panel | Quick record inspection while keeping the current list visible |
| AI panel | Contextual questions, source records, and action proposals |

Group the 13 business areas into a manageable sidebar:

- **Commercial:** Sales, Marketing.
- **Operations:** Supply Chain, Manufacturing.
- **Finance:** Accounting.
- **People:** Human Resources, Appraisals.
- **Collaboration:** Services, Helpdesk, Productivity, Sign.
- **Customer experience:** Website and buyer portal.
- **Administration:** Users, companies, permissions, integrations.

Show each user the areas relevant to their responsibilities. Expose business actions only when their installed providers and permissions support them. Backend authorization remains mandatory regardless of navigation visibility.

## 2. Three reusable screen patterns

### Workspace screen

Provide a searchable, filterable list with saved views and a few relevant summaries. Sales might show quotations awaiting approval, confirmed orders, and approaching delivery dates.

### Record screen

Provide a full view of an order, purchase, employee, or ticket. Use a clear header followed by tabs such as Overview, Lines, Related Records, Documents, and Activity.

### Action flow

Provide a focused form or confirmation dialog for a business transition. For example, confirming an order should display the buyer, quantities, amount, and consequences before submission.

Use drawers for quick inspection and small edits. Use full pages for complex records such as quotations and BOMs.

## 3. Shared components

Build these once and reuse them consistently.

| Component | Important behavior |
|---|---|
| Data table | Server pagination, sorting, filters, row selection, saved views |
| Reference picker | Search permitted buyers, products, employees, and warehouses |
| Status badge | Consistent labels backed by real business states |
| Money and quantity fields | Display currency, unit, precision, and validation |
| Order-line editor | Product variants, quantities, prices, and calculated totals |
| Activity timeline | Actor, action, timestamp, approvals, and document changes |
| Related-record links | Connect orders to purchases, production, deliveries, and invoices |
| Document panel | Preview, download, version, and access controls |
| Approval panel | Required reviewers, decisions, comments, and outstanding steps |
| Operation feedback | Queued, processing, completed, rejected, or outcome unknown |

Every data view needs distinct **loading, empty, forbidden, unavailable, and stale** states. A failed stock request must visibly differ from zero stock.

## 4. Make the order the central journey

The strongest first UI journey is:

**Buyer → Quotation → Sales order → Material availability → Purchasing → Manufacturing → Delivery → Invoice → Payment**

An order detail page should connect these stages. Its overview should answer:

- What did the buyer request?
- What is approved?
- What material is missing?
- How much production is complete?
- What is blocking shipment?
- What has been delivered, invoiced, and paid?

This connected view gives Texon a clear purpose beyond a collection of separate screens. Manufacturing views use standard ERP progress and completion records; dedicated cutting/CAD, machine telemetry, and biometric integrations remain outside the product scope.

## 5. Dashboard system

Provide a useful default dashboard for each role.

| Role | Primary focus |
|---|---|
| Merchandiser | Buyer orders, approvals, delivery deadlines |
| Purchasing team | Shortages, supplier orders, expected receipts |
| Storekeeper | Receipts, quality holds, available stock, deliveries |
| Production coordinator | Manufacturing orders, shortages, progress |
| Finance team | Outstanding invoices, payments, reconciliation |
| Business owner | Order value, delivery performance, outstanding issues |

Every summary should link to the records behind it and show its reporting period and freshness. Display the relevant company, currency, and units wherever needed to interpret a metric.

## 6. AI experience

Use a persistent AI side panel that understands the current page.

On an order, offer questions such as:

- “Explain this order's status.”
- “What is blocking delivery?”
- “Show the related purchases.”
- “Prepare a confirmation proposal.”

Answers should contain clickable source records and relevant timestamps. Proposed changes should appear as structured cards with **Review, Confirm, and Cancel** actions. After confirmation, show the actual operation status.

Keep a full conversation page for longer investigations and saved history. Offer suggestions only for tools the user is authorized to use and that the system actually supports. Follow the [AI integration plan](integration_design/05-ai-copilot-integration-plan.md) for server-owned proposals, current-state checks, and conversation isolation.

## 7. Buyer portal

Give buyers a separate, simpler experience focused on their orders, deliveries, documents, invoices, and support tickets. Its navigation and terminology should suit customers, while internal staff retain the broader ERP workspace.

Enforce buyer record ownership on the server, including document downloads and AI retrieval where available. Keep internal notes and private commercial, financial, and employee fields restricted.

## 8. Design and delivery order

Use restrained colors, readable tables, consistent spacing, and clear status indicators. Support keyboard navigation, accessible forms, and responsive layouts.

Build the UI in this order:

1. Application shell and shared components.
2. Sales workspace and connected order detail.
3. Purchasing, inventory, manufacturing, and finance screens.
4. Contextual AI and confirmed action cards.
5. Buyer portal and collaboration tools.
6. Remaining people and administration workflows.

The first UI milestone should demonstrate one complete order journey, with real data, clear failures, and useful AI assistance.
