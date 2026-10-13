# Texon AI Assistant: Odoo Business Workflow Copilot

> Updated: 2026-10-13
> Status: Revised AI plan; supersedes the WebSocket/JWT and COMMIT-226–240 backlog.
> Scope: Business assistance over verified ERP records, without factory hardware or specialist cutting tools.

## Purpose

Help users answer “Will this order ship on time?”, identify material shortages, understand manufacturing progress, find unpaid invoices, and draft follow-up work. The assistant complements Odoo workflows; it does not replace business validation or maintain its own balances.

Start with read-only questions after order, inventory, manufacturing, accounting, and permissions are reliable. Enable actions separately. Odoo remains the authority; Django projections are explicitly dated caches. Unavailable modules have no registered tools or suggestion pills.

The existing frontend has AI components and a token-based WebSocket hook. Treat them as migration inputs, not proof of a working backend or a static mock. Inspect current code before changing it. Restore only the needed HTTP AI services; remove stale ASGI routing imports instead of reviving the old WebSocket design.

## Transport and session

Browser → Next.js session-authenticated BFF POST → Django AI HTTP service → tool executor/provider. Stream SSE-formatted events in the POST response using a browser fetch reader. Forward server credentials only on the server. Apply CSRF/origin checks and conversation/user/company authorization before beginning the stream.

Use `message_start`, `tool_status`, `source`, `chunk`, `action_proposal`, `message_end`, and `error` events with request/message IDs. Persist completed/interrupted status, support abort/cancellation, set proxy/provider timeouts, and bound concurrent requests. Retrying a failed stream must not dispatch a business action.

Do not expose access/refresh JWTs or Odoo keys to browser JavaScript, WebSocket query strings, prompts, or logs. WebSockets are outside this delivery scope. Switching to a local provider does not guarantee offline operation; validate network, hardware capacity, and model/tool compatibility before making that claim.

## Permission-aware tool catalog

Calculate metrics with deterministic business tools and decimal-safe arithmetic. The LLM formats/explains their results. Queries must enforce tenant, active company, user action, record ownership, and field permissions independently of prompt instructions or whether a tool was shown to the model.

| Tool group | Example read tools | Availability gate |
|---|---|---|
| Sales/delivery | `get_order_status`, `list_orders_at_risk`, `get_delivery_status` | M3–M4 |
| Purchasing/inventory | `get_material_availability`, `get_purchase_eta`, `get_lot_status` | M3; distinguish on-hand, reserved, available, held, and pending |
| Manufacturing | `get_mo_progress`, `get_material_shortages` | M4; standard manually recorded work-order progress, no telemetry/SMV/OEE inference |
| Accounting | `get_outstanding_invoices`, `get_order_financial_summary` | M4 and finance field permissions; separate draft/posted/paid and currencies |
| Collaboration | `list_overdue_tasks`, `get_ticket_status` | Relevant M5 module |
| HR | `get_my_leave_balance`, `get_my_attendance_summary` | M6; self-service or explicitly authorized staff scope |
| Documents | `search_authorized_sops` | Verified M5 document provider and access-filtered retrieval |

Each result includes permitted source record references/links, company, currency/UOM/timezone where relevant, queried-at/source-updated timestamps, synchronization health, and explicit missing-data indicators. Do not call an order “on time” solely from an MO status. Define risk rules from due dates, outstanding approvals, procurement dates, shortages, and recorded progress; label these as rule-based indicators, not proven predictions.

## Confirmed actions

Initial action allowlist: create a follow-up task or draft an order-linked ticket after M5. Add sales confirmation or quality release only after their business command and authorization tests pass. Financial posting, payroll, signature execution, and autonomous stock movements are outside the initial AI action scope.

1. The model requests a typed draft action; server tools validate references/permissions and create a persisted proposal. The model cannot supply a dispatch URL or unrestricted command name.
2. Bind the proposal to user, tenant/company, allowlisted action, exact parameters/hash, source record revisions, creation/expiry time, and status. Generate the operation UUID server-side.
3. Render the exact proposed changes, target records, relevant amounts/units, and consequences. Only an explicit authenticated confirmation dispatches it.
4. On confirmation, recheck ownership, current permissions, expiry, company, prerequisites, and expected revisions. Changed state requires a new review; a previously valid card is not sufficient.
5. Atomically mark/dispatch the confirmed proposal with the stable command UUID. Repeated clicks return the same operation. Odoo revalidates the business action and records its receipt.
6. Show queued versus completed/rejected/unknown status. Cancel/expire an unconfirmed proposal; do not imply cancel reverses an already committed business operation.

The proposal card contains a server proposal ID and display data. Frontend submits that ID to a fixed authorized confirmation endpoint; it never executes an LLM-selected endpoint.

## Conversation, data, and provider controls

- Store conversation owner, tenant/company, messages, tool/source references, model/provider version, token usage, and completion status. Scope list/read/export/delete/stream endpoints; knowledge of a conversation ID grants no access.
- Revalidate source access when continuing a conversation after role/company changes; redact or exclude previously accessible private data. Isolate retrieval indexes and enforce access before ranking/results reach the model.
- Treat user text, documents, emails, and tool outputs as untrusted content. Instructions embedded in a buyer attachment cannot alter tool permissions or authorize an action.
- Minimize provider data, redact secrets/private fields, choose tenant-approved providers, and define conversation retention/deletion and audit retention separately.
- Configure model/provider IDs rather than hardcoding old model names. Verify streaming and structured-tool support per provider; do not assume compatibility from an OpenAI-shaped API.
- Set per-user/company token budgets, maximum context/tool rounds, result-size caps, timeouts, cancellation, rate limits, and concurrent-stream limits. Record operational metrics without logging raw private prompts by default.
- Ground answers in source records, explain missing/conflicting/stale information, and keep provider failure distinct from “no records found.” Local-model deployment is optional, not a prerequisite for the ERP demo.

## Implementation work packages

| Package | Deliverable | Acceptance evidence |
|---|---|---|
| AI-1 | HTTP app/provider configuration; remove obsolete routing dependency | Backend boots; missing provider configuration yields explicit unavailable state |
| AI-2 | Conversation/message ownership and retention; scoped APIs | Another user/company cannot list, stream, export, or delete history |
| AI-3 | BFF POST streaming, event contract, cancellation/reconnect behavior | Browser session streams without readable credentials; interrupted request is recorded |
| AI-4 | Bounded provider adapter and permission-aware typed tool registry | Malformed parameters, forbidden fields, arbitrary SQL/RPC, and excessive tool loops are rejected |
| AI-5 | Sales, inventory, manufacturing, and finance tools | Fixture answers match exact records/totals, sources, timestamps, and scope |
| AI-6 | Gated collaboration/HR/document tools | Suggestions match installed modules; private HR/documents remain inaccessible |
| AI-7 | Server proposal lifecycle, confirmation UI, command dispatch | Expired/stale/foreign proposals rejected; double confirm has one effect |
| AI-8 | Security/evidence evaluation, cost controls, operational runbook | Real-runtime workflow tests plus controlled provider-failure/adversarial tests pass |

## Required acceptance suite

1. Answer order status and shortage questions from known fixtures; show authorized record links and freshness.
2. Explain intermediate manufacturing progress without claiming finished inventory exists.
3. Produce correct posted/draft invoice and currency distinctions; refuse unauthorized financial fields.
4. Deny cross-user/company history, retrieval, tool execution, proposals, and operation receipts.
5. Revoke a role during a conversation; subsequent tools/history reuse cannot expose the revoked data.
6. Place malicious action instructions in a retrieved document; no extra tool authority or command is gained.
7. Mark projections stale or stop Odoo; report uncertainty/unavailability rather than fabricated current figures.
8. Confirm a task proposal twice; one business effect. Reject changed/expired parameters and proposals from another user/company.
9. Cancel a stream, trigger rate/token/time limits, and simulate provider failure; terminate cleanly with truthful state and bounded cost.
10. Exercise session/CSRF/origin handling and verify no long-lived credentials in URLs, browser storage, model inputs, or logs.

Use deterministic fixtures and mocked provider streams for repeatable evaluations, alongside real Odoo integration tests for business tools and actions. Record model/version and evaluation results before enabling a provider in the pilot.
