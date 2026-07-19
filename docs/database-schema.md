# Texon ERP — Database Structure Overview

~129 entities across 17 domains. PurchaseOrder is the central transactional entity.

---

## Core Master Data (referenced everywhere)

| Entity | PK Pattern | Key Fields |
|---|---|---|
| **Buyer** | `buyer_id` | name, contact_person, country, status |
| **Supplier** | `supplier_id` | name, location, product_category |
| **Style** | `STY-####` | number, name, buyer_id (FK), category, season |
| **PurchaseOrder** | `PO-#####` | buyer_id (FK), style_id (FK), quantity, ship_date, value, status |
| **ProductionLine** | `line_id` | name, type, machine_count, operator_count, capacity |
| **Employee** | `EMP-###` | name, department_id (FK), designation, join_date |
| **Department** | `dept_id` | name, head_employee_id (FK), budget |
| **Warehouse** | `wh_id` | code (WH-A/B/C), name, location |
| **Company** | `company_id` | name, type (Parent/Sub), location |

---

## Domain Groups

### CRM & Sales

| Entity | Key Fields |
|---|---|
| Buyer | buyer_id, name, contact_person, country, status |
| BuyerCommunication | communication_date, buyer_id (FK), type (Email/Call/Meeting), subject, owner, status |
| BuyerEnquiry | enquiry_id (ENQ-####), buyer_id (FK), description, received_date, estimated_value, status |
| BuyerProfitability | buyer_id (FK), revenue, cost, margin_pct, order_count, trend |

### Merchandising

| Entity | Key Fields |
|---|---|
| CostSheet | cost_sheet_id (CS-####), style_id (FK), buyer_id (FK), fob_estimate, fabric_cost, status |
| SampleOrder | sample_id (SMP-####), style_id (FK), buyer_id (FK), sample_type, ship_date, status |
| SampleApproval | style_id (FK), buyer_id (FK), fit_round, fit_status, pp_round, pp_status |
| BudgetDemandForecast | buyer_id (FK), forecast_pcs, booked_pcs, gap_pcs, revenue_estimate, confidence |
| MaterialSourcing | material_name, material_type, supplier_id (FK), po_qty, required_by_date, status |
| SupplierDevelopment | style_id (FK), supplier_id (FK), development_stage, deadline, status |

### Purchase Order

| Entity | Key Fields |
|---|---|
| PurchaseOrder | po_id (PO-#####), buyer_id (FK), style_id (FK), quantity_pcs, ship_date, order_value, status |

### Supplier & Procurement

| Entity | Key Fields |
|---|---|
| Supplier | supplier_id, name, location, product_category |
| SupplierEvaluation | supplier_id (FK), price_score, quality_score, delivery_score, grade |
| MaterialBooking | booking_id (BK-####), material_name, supplier_id (FK), quantity, delivery_date, status |
| KnittingDyeingProgram | program_id (KD-####), fabric_name, program_type, start_date, end_date, status |
| ProcurementPO | po_id (PO-####), supplier_id (FK), material_name, amount, delivery_date, status |
| StockLoan | loan_id (LN-####), supplier_id (FK), material_name, quantity, loan_date, status |
| PriceVariance | material_name, supplier_id (FK), quoted_price, actual_price, variance_pct, status |
| LocalPurchaseOrder | lpo_id (LPO-####), supplier_id (FK), material_name, quantity, value, status |
| RMSupplierReceipt | ref_id (REC-####), receipt_type, supplier_id (FK), material_name, quantity, status |

### Inventory & Store (15 entities)

| Entity | Key Fields |
|---|---|
| FabricInventory | fabric_name, color, rolls, meters, warehouse_id (FK), status |
| AccessoriesInventory | item_name, category, in_stock, unit, reorder_point, status |
| TrimsInventory | trim_name, trim_type, in_stock, unit, reorder_point, status |
| PhysicalInventoryCount | pi_id (PI-####), location, count_date, variance_pct, value, status |
| ShadeApproval | shade_id (SH-####), fabric_name, order_id (FK), buyer_id (FK), result, status |
| FabricInspection | lot_id (LOT-####), fabric_name, supplier_id (FK), rolls, grade, status |
| RMIssue | issue_id (IS-####), requisition_id (FK), material_name, quantity, line_id (FK), status |
| GatePass | gp_id (GP-####), pass_type, material_name, quantity, destination, status |
| LeftoverDeclaration | decl_id (LD-####), style_id (FK), material_name, quantity, value, status |
| ReBooking | rb_id (RB-####), original_po_id (FK), material_name, quantity, value, status |
| RMTransfer | transfer_id (TR-####), material_name, from_location, to_location, quantity, status |
| DamagedGoods | ref_id (DG-####), source, material_name, quantity, value, status |
| LowStockAlert | alert_id (LS-####), item_name, category, current_qty, reorder_point, severity |
| StockBalance | category, opening_value, received_value, issued_value, closing_value, variance_pct |
| WastageEntry | entry_id (W-####), process_name, material_name, quantity, wastage_type, status |

### Production (17 entities)

| Entity | Key Fields |
|---|---|
| WorkOrder | work_order_id (WO-####), po_id (FK), buyer_id (FK), style_name, quantity, status |
| LineAllocation | line_id (FK), order_id (FK), buyer_id (FK), style_name, allocation_period, status |
| FloorLayout | line_id (FK), process_name, machine_count, operator_count, capacity_per_day, status |
| FloorRequisition | req_id (FR-####), line_id (FK), material_name, quantity, request_time, status |
| RMRequisition | req_id (RM-####), line_id (FK), material_name, quantity, requested_by, status |
| CuttingDispatch | order_id (FK), style_name, cut_qty, sent_qty, pending_qty, status |
| PrintEmbroideryOperation | order_id (FK), style_name, operation_type, total_qty, completed_qty, status |
| LineInput | line_id (FK), order_id (FK), input_qty, time, operator_name, status |
| HourlyProduction | line_id (FK), hour, target, actual, efficiency_pct, status |
| WashingDispatch | dispatch_id (WD-####), order_id (FK), quantity, sent_time, washing_unit, status |
| WashingReceipt | receipt_id (WR-####), order_id (FK), quantity, received_time, qc_result, status |
| ThreadCutting | line_id (FK), order_id (FK), qty_cut, pending_qty, qc_result, status |
| CartonPacking | carton_id (CTN-####), order_id (FK), quantity, weight, packed_time, status |
| PackingList | pl_id (PL-####), order_id (FK), buyer_id (FK), carton_count, prepared_date, status |
| FreightBooking | booking_id (BK-####), order_id (FK), forwarder_name, etd, amount, status |
| InspectionSchedule | inspection_id (INSP-####), order_id (FK), stage, scheduled_date, inspector_name, status |
| ExFactory | order_id (FK), buyer_id (FK), quantity, ex_factory_date, value, status |

### Quality Control (8 entities)

| Entity | Key Fields |
|---|---|
| InlineQC | inspection_id (IQ-####), line_id (FK), checkpoint, sample_size, defects, status |
| EndLineQC | order_id (FK), line_id (FK), inspected_qty, pass_qty, fail_qty, status |
| FinishingQC | order_id (FK), inspector_name, inspected_qty, pass_qty, fail_qty, status |
| FinalInspection | order_id (FK), buyer_id (FK), sample_size, defect_count, aql_level, status |
| DefectCategory | category_name, line_id (FK), count, severity, order_id (FK), trend |
| RejectionRecord | order_id (FK), stage, rejected_qty, cause, reworked_qty, status |
| AlterationRequest | alt_id (ALT-####), order_id (FK), defect_name, quantity, assigned_to, status |
| CorrectiveAction | car_id (CAR-####), issue_description, root_cause, owner, due_date, status |

### Industrial Engineering

| Entity | Key Fields |
|---|---|
| SMV | style_id (FK), operation_name, smv_minutes, calculation_method, machine_type, category |
| IESuggestion | suggestion_id (IE-####), line_style_ref, operation_name, current_pph, target_pph, status |
| ProcessTarget | process_name, target_pcs, achieved_pcs, achievement_pct, variance, status |
| LineEfficiency | line_id (FK), style_name, supervisor_name, efficiency_pct, output_pcs, status |
| DowntimeEvent | event_id (DT-####), line_id (FK), start_time, duration, cause, status |

### IE & Planning

| Entity | Key Fields |
|---|---|
| ProductionPlan | plan_id (PP-####), process_name, order_id (FK), target_pcs, achieved_pcs, status |
| RiskAssessment | risk_id (RSK-####), order_id (FK), risk_category, severity, impact_value, status |
| POTnaMilestone | po_id (FK), buyer_id (FK), milestone_name, planned_date, actual_date, status |
| StyleAnalysis | style_id (FK), style_name, smv_minutes, target_pph, actual_pph, accuracy_pct |
| ProductionLadder | line_id (FK), style_id (FK), day_target, day_actual, cumulative_target, cumulative_actual |
| LineLoadingPlan | line_id (FK), loading_in_style, current_style, loading_out_style, next_style, status |

### HR, Attendance & Payroll (11 entities)

| Entity | Key Fields |
|---|---|
| Employee | employee_id (EMP-###), name, department_id (FK), designation, join_date, status |
| Department | department_id, name, head_employee_id (FK), headcount, budget, vacancies, status |
| WorkerID | worker_id_code (WID-####), employee_name, department, issued_date, expiry_date, status |
| ShiftSchedule | shift_name, shift_time, line_count, worker_count, supervisor_name, status |
| Attendance | department_id (FK), total_workers, present, absent, late, attendance_rate |
| OvertimeRequest | ot_id (OT-####), worker_name, line_id (FK), hours, reason, status |
| LeaveRequest | leave_id (LV-####), employee_id (FK), leave_type, days, period, status |
| SalarySheet | department_id (FK), worker_count, basic_pay, allowances, deductions, net_pay |
| Bonus | period, bonus_type, eligible_count, pool_amount, avg_per_worker, status |
| PayrollApproval | period, gross_amount, deductions, net_amount, submitted_date, status |
| ComplianceReport | report_name, report_type, period, generated_date, auditor, status |

### Accounts & Finance (11 entities)

| Entity | Key Fields |
|---|---|
| AccountsPayable | invoice_id (AP-INV-####), supplier_id (FK), due_date, amount, approval_status, status |
| AccountsReceivable | invoice_id (AR-####-####), buyer_id (FK), shipment_id (FK), due_date, amount, status |
| SupplierBill | bill_no (BILL-####), supplier_id (FK), po_grn_ref, received_date, amount, match_status |
| BuyerPayment | receipt_id (RCPT-########), buyer_id (FK), bank_reference, received_date, amount, allocation_status |
| CostCenter | cost_center_id (CC-###), center_name, owner_name, budget, actual, variance, status |
| OrderPnL | order_id (FK), buyer_id (FK), revenue, actual_cost, gross_profit, margin_pct, health |
| BankAccount | account_name, bank_name, book_balance, bank_balance, last_reconciled, status |
| ExpenseReport | report_id (EXP-####), employee_center, category, submitted_date, amount, status |
| FinancialReport | report_name, period, prepared_by, last_run, format, status |
| JournalEntry | journal_id (JV-#####), source_module, posting_date, description, amount, status |

### Commercial Management (14 entities)

| Entity | Key Fields |
|---|---|
| ImportShipment | import_id (IMP-####), supplier_id (FK), lc_number, etd, eta, status |
| ExportOrder | export_id (EXP-####), buyer_id (FK), po_id (FK), shipment_date, value, status |
| ExportLC | lc_number (LC-####), buyer_id (FK), value, issue_date, expiry_date, status |
| BTBLC | btb_id (BTB-####), supplier_id (FK), export_lc_id (FK), value, validity_date, status |
| ShipmentTracking | shipment_id (SHP-####), shipment_type, origin_destination, carrier_name, eta, status |
| SupplierDocument | doc_id (DOC-####), supplier_id (FK), po_id (FK), document_type, received_date, status |
| AcceptanceClearance | clearance_id (CLR-####), shipment_id (FK), supplier_id (FK), documents, submitted_date, status |
| CommercialInvoice | invoice_id (INV-####), buyer_supplier, po_id (FK), amount, prepared_date, status |
| BankDocument | doc_id (BDE-####), lc_id (FK), bank_name, amount, submitted_date, status |
| Realization | realization_id (RLZ-####), buyer_id (FK), invoice_id (FK), amount, due_date, status |
| ShortRealization | shortfall_id (SRT-####), buyer_id (FK), invoice_id (FK), short_amount, cause, status |
| SODFCTransfer | transfer_id (TRF-####), transfer_type, bank_name, amount, transfer_date, status |
| Disbursement | disbursement_id (DIS-####), category, po_invoice_ref, amount, date, status |

### Subcontract

| Entity | Key Fields |
|---|---|
| SubcontractOrder | sc_id (SC-####), vendor_name, order_id (FK), process_type, quantity, status |

### TnA (Time & Action) — 8 entities

| Entity | Key Fields |
|---|---|
| Task | task_id (TK-####), order_id (FK), task_name, owner_name, due_date, status |
| OrderSchedule | order_id (FK), start_date, end_date, lead_time_days, progress_pct, status |
| Notification | ref_id (NT-####), notification_type, recipient_name, subject, sent_date, status |
| DataImportExport | ref_id (IE-####), operation_type, format, record_count, user_name, status |
| OrderStatusOverview | order_id (FK), total_tasks, completed, in_progress, at_risk, health |
| CriticalPath | task_name, order_id (FK), duration_days, float_days, owner_name, status |
| TaskSplit | parent_task, sub_task_name, level, owner_name, progress_pct, status |
| TaskDependency | from_task, to_task, dependency_type, lag_days, order_id (FK), status |

### Multi-Company

| Entity | Key Fields |
|---|---|
| Company | company_id, name, type (Parent/Sub), location, revenue, employee_count, status |
| Currency | currency_name, code, rate_vs_usd, last_updated, transaction_count, trend |
| FactoryLocation | location_name, worker_count, line_count, output_pcs, utilization_pct, status |
| ModuleIntegration | from_module, to_module, integration_type, last_sync, api_calls, status |

### Reporting

| Entity | Key Fields |
|---|---|
| MisReport | report_name, report_type, period, generated_date, owner, status |
| Dashboard | dashboard_name, owner, kpi_count, last_viewed, user_count, status |
| ReportExport | report_name, format, user_name, file_size, export_date, status |
| StyleProfitability | style_id (FK), order_count, revenue, cost, margin_pct, trend |
| ProductionEfficiencyReport | line_id (FK), supervisor_name, efficiency_pct, output_pcs, dhu_rate, status |

---

## Key Relationships

```
Buyer ──< PurchaseOrder >── Style
PurchaseOrder ──< WorkOrder ──< ProductionLine
PurchaseOrder ──< [Production: Cutting, Sewing, Washing, Packing]
PurchaseOrder ──< [QC: Inline, End-line, Final inspection]
PurchaseOrder ──< [Commercial: Export, LC, Invoice, Realization]
PurchaseOrder ──< [Finance: AP, AR, Journal]
Supplier ──< [Procurement, Materials, Bills]
Employee ──< Department
Employee ──< [HR: Attendance, Leave, Overtime, Salary]
```

## Status Pattern

Every entity uses a consistent `status` field with domain-specific enums:

- **Active/Inactive** — Master data
- **Pass/Fail** — QC inspections
- **Approved/Pending/Rejected** — Workflows
- **Complete/In progress/Overdue/At risk** — Operations
- **Healthy/Watch/At risk** — Financial health

## Entity Count by Domain

| Domain | Entities |
|---|---|
| CRM | 4 |
| Merchandising | 6 |
| Purchase Order | 1 |
| Supplier & Procurement | 9 |
| Inventory & Store | 15 |
| Production | 17 |
| Quality Control | 8 |
| Industrial Engineering | 5 |
| IE & Planning | 6 |
| HR & Payroll | 11 |
| Accounts & Finance | 10 |
| Commercial Management | 13 |
| Subcontract | 1 |
| TnA | 8 |
| Multi-Company | 4 |
| Reporting | 5 |
| **Total** | **~124** |
