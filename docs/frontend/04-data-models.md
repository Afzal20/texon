# 04 — Data Models

Accurate reference generated from the **actual** Django models
(`backend/*/models.py`, verified against `db.sqlite3` and the live GraphQL
schema). **All 108 models are exposed through GraphQL** (type + list query +
by-id query + create/update/delete mutations).

Legend: `FK → Model` = foreign key; `?` = nullable; `[]` = blank allowed;
`auto` = auto-set timestamp; `UNIQUE` = unique constraint; `=x` = default value.
Dates are stored as `YYYY-MM-DD`, decimals are strings in GraphQL.

---

## accounts (also exposed via REST `/api/v1/accounts/*`)

| Model | Fields |
|---|---|
| **AccountsPayable** | supplier (FK→Supplier), invoice_number, invoice_date, due_date, amount, paid_amount=0, balance, status=`pending`, notes [], created_at auto, updated_at auto |
| **AccountsReceivable** | buyer (FK→Buyer), invoice_number, invoice_date, due_date, amount, received_amount=0, balance, status=`pending`, notes [], created_at auto, updated_at auto |
| **ChartOfAccount** | account_code, account_name, account_type, parent (FK→ChartOfAccount?), is_active=True, created_at auto, updated_at auto. Reverse: children, journal_entries |
| **CostCenter** | name, code, department [], budget=0, is_active=True, created_at auto, updated_at auto. Reverse: expenses |
| **Expense** | cost_center (FK→CostCenter?), expense_date, category, description, amount, currency (FK→Currency?), approved_by [], status=`draft`, notes [], created_by, created_at auto, updated_at auto |
| **JournalEntry** | entry_number, entry_date, description [], account (FK→ChartOfAccount), debit=0, credit=0, currency (FK→Currency?), reference [], created_by, created_at auto |

## authentication

| Model | Fields |
|---|---|
| **User** | password (hashed; **not returned** by GraphQL types), last_login?, is_superuser=False, first_name [], last_name [], is_staff=False, is_active=True, date_joined auto, email (UNIQUE), phone [], is_verified=False, employee (OneToOne FK→Employee? UNIQUE). Reverse: outstandingtoken, otps, user_roles, emailaddress, socialaccount, logentry |
| **OTP** | one-time passwords (model fields per `authentication/models.py`) |
| **SocialAuthCallbackUrl** | social-auth callback URLs (model fields per `authentication/models.py`) |

## buyers

| Model | Fields |
|---|---|
| **Buyer** | name, code, country, address [], contact_person [], email [], phone [], is_active=True, sequence=0, created_at auto, updated_at auto. Reverse: rating, portfolio, styles, enquiries, purchase_orders, sample_orders, budget_demand_assessments, receivables, commercial_shipments, lcs, commercial_invoices, bills_of_exchange, realizations, communications, profitability_records, pre_costings, orders, compliance_records |
| **BuyerPortfolio** | buyer (OneToOne FK→Buyer UNIQUE), active_orders=0, total_units=0, total_value=0.0, updated_at auto |
| **BuyerRating** | buyer (OneToOne FK→Buyer UNIQUE), rating=0.0, reviews_count=0, updated_at auto |

## commercial

| Model | Fields |
|---|---|
| **BillOfExchange** | bill_number, lc (FK→LetterOfCredit?), buyer (FK→Buyer?), bank_name [], bank_reference [], amount, currency (FK→Currency?), issue_date?, maturity_date?, status=`draft`, documents_required [], notes [], created_at auto, updated_at auto |
| **Disbursement** | disbursement_number, category, purchase_order (FK→Order?), invoice (FK→Invoice?), shipment (FK→Shipment?), amount, currency (FK→Currency?), disbursement_date?, approved_by [], approval_date?, status=`draft`, notes [], created_at auto, updated_at auto |
| **Invoice** | invoice_number, buyer (FK→Buyer?), supplier (FK→Supplier?), purchase_order (FK→Order?), lc (FK→LetterOfCredit?), invoice_date?, due_date, amount, currency (FK→Currency?), invoice_type=`commercial`, status=`draft`, paid_amount=0, payment_terms [], notes [], created_at auto, updated_at auto. Reverse: realizations, disbursements |
| **LetterOfCredit** | lc_number, lc_type=`import`, buyer (FK→Buyer?), supplier (FK→Supplier?), parent_lc (FK→LetterOfCredit?), amount, currency (FK→Currency?), issue_date?, expiry_date?, bank_name [], bank_reference [], status=`draft`, amendment_count=0, notes [], created_at auto, updated_at auto. Reverse: child_lcs, invoices, bills_of_exchange |
| **Realization** | realization_number, buyer (FK→Buyer), invoice (FK→Invoice), expected_amount, realized_amount=0, currency (FK→Currency?), realization_date?, due_date?, status=`expected`, short_reason [], short_amount=0, notes [], created_at auto, updated_at auto |
| **SODFCTransfer** | transfer_number, transfer_type=`fc`, bank_name [], bank_reference [], amount, currency (FK→Currency?), transfer_date?, acknowledged_by [], acknowledgment_date?, status=`pending`, notes [], created_at auto, updated_at auto |
| **Shipment** | shipment_number, buyer (FK→Buyer?), supplier (FK→Supplier?), direction=`import`, shipment_type=`sea`, port_of_loading [], port_of_discharge [], container_number [], container_size=`40ft`, forwarder [], vessel_name [], carrier [], booking_number [], purchase_order (FK→Order?), shipment_date?, etd?, eta?, actual_arrival?, gross_weight (Decimal?), net_weight?, volume_cbm?, status=`draft`, clearance_status=`pending`, notes [], created_at auto, updated_at auto. Reverse: supplier_documents, disbursements |
| **SupplierDocument** | document_number, supplier (FK→Supplier), shipment (FK→Shipment?), purchase_order (FK→Order?), document_type, received_date?, reviewed_by [], review_date?, status=`pending`, rejection_reason [], notes [], created_at auto, updated_at auto |

## compliance

| Model | Fields |
|---|---|
| **ComplianceRecord** | buyer (FK→Buyer?), compliance_type, title, description, audit_date, audit_by [], score (Decimal?), status=`planned`, findings [], corrective_actions [], follow_up_date?, created_at auto, updated_at auto |

## core

| Model | Fields |
|---|---|
| **Currency** | code (UNIQUE), name, symbol [], exchange_rate=1.0, is_base=False, is_active=True |
| **Location** | name, code (UNIQUE), address [], city [], country [], is_active=True, created_at auto, updated_at auto. Reverse: employees, fixed_assets, multi_company_operations |

## costing

| Model | Fields |
|---|---|
| **CostSheet** | style (FK→Style), cost_date, fabric_cost=0, accessory_cost=0, trim_cost=0, labor_cost=0, overhead_cost=0, commercial_cost=0, total_cost, selling_price, margin, status=`draft`, notes [], created_at auto, updated_at auto |
| **PreCosting** | buyer (FK→Buyer), style (FK→Style), cost_date, estimated_fabric_cost=0, estimated_accessory_cost=0, estimated_trim_cost=0, estimated_labor_cost=0, estimated_overhead=0, total_estimated_cost, target_price, expected_margin, status=`draft`, notes [], created_at auto, updated_at auto |

## crm

| Model | Fields |
|---|---|
| **BuyerCommunication** | buyer (FK→Buyer), communication_type, subject, content, contact_person [], communication_date, follow_up_date?, status=`completed`, created_by, created_at auto, updated_at auto |
| **BuyerProfitability** | buyer (FK→Buyer), period_start, period_end, total_revenue, total_cost, profit, profit_margin, created_at auto |
| **OrderAmendmentHistory** | purchase_order (FK→PurchaseOrder), amendment_date, previous_value, new_value, reason, amended_by, created_at auto |

## fixed_assets

| Model | Fields |
|---|---|
| **AssetCategory** | name, code, description [], depreciation_method=`straight_line`, useful_life_years=5, is_active=True. Reverse: assets |
| **DepreciationSchedule** | fixed_asset (FK→FixedAsset), year, period, opening_value, depreciation, closing_value, created_at auto |
| **FixedAsset** | category (FK→AssetCategory), location (FK→Location?), asset_code, name, description [], purchase_date, purchase_cost, current_value, salvage_value=0, depreciation_amount=0, status=`active`, assigned_to [], notes [], created_at auto, updated_at auto. Reverse: depreciation_schedules |

## hr

| Model | Fields |
|---|---|
| **Attendance** | employee (FK→Employee), date, check_in (Time?), check_out (Time?), status=`present`, notes [], created_at auto, updated_at auto |
| **Bonus** | employee (FK→Employee), bonus_type, amount, bonus_date, description [], status=`approved`, created_at auto |
| **Department** | name, code, description [], is_active=True, created_at auto, updated_at auto. Reverse: designations, employees |
| **Designation** | department (FK→Department), name, code, description [], is_active=True, created_at auto, updated_at auto. Reverse: employees |
| **Employee** | department (FK→Department?), designation (FK→Designation?), location (FK→Location?), employee_id, first_name, last_name, email (UNIQUE), phone [], date_of_birth?, date_of_joining, employment_type=`permanent`, gender [], status=`active`, is_active=True, created_at auto, updated_at auto. Reverse: user_account, skill_inventories, attendance_records, leaves, overtime_records, salary_sheets, bonuses |
| **Leave** | employee (FK→Employee), leave_type, start_date, end_date, total_days, reason, status=`pending`, approved_by [], created_at auto, updated_at auto |
| **Overtime** | employee (FK→Employee), date, hours, rate, total_amount, status=`pending`, approved_by [], notes [], created_at auto, updated_at auto |
| **SalarySheet** | employee (FK→Employee), month, basic_salary, allowances=0, deductions=0, overtime_amount=0, bonus_amount=0, net_salary, status=`draft`, payment_date?, notes [], created_at auto, updated_at auto |

## ie_planning

| Model | Fields |
|---|---|
| **CapacityBooking** | style (FK→Style), line, capacity_per_day, booking_date, allocated_days, status=`allocated`, notes [], created_at auto, updated_at auto |
| **LinePlan** | style (FK→Style), line, plan_date, target_quantity, status=`planned`, notes [], created_at auto, updated_at auto |
| **ProductionPlan** | purchase_order (FK→PurchaseOrder), style (FK→Style), planned_start_date, planned_end_date, daily_target, total_quantity, status=`draft`, notes [], created_at auto, updated_at auto |
| **RiskAssessment** | style (FK→Style), risk_type, severity, likelihood, mitigation_plan [], status=`open`, created_at auto, updated_at auto |
| **StyleAnalysis** | style (FK→Style), analysis_type, findings, recommendation [], analyzed_by, analysis_date, created_at auto |

## inventory

| Model | Fields |
|---|---|
| **Accessory** | warehouse (FK→Warehouse?), name, code, category [], quantity=0, unit=`pcs`, threshold_quantity=0, unit_price (Decimal?), is_active=True, created_at auto, updated_at auto |
| **Fabric** | warehouse (FK→Warehouse?), name, code, color [], composition [], width (Decimal?), quantity=0, unit=`meters`, threshold_quantity=0, unit_price?, is_active=True, created_at auto, updated_at auto. Reverse: shade_approvals |
| **PhysicalInventory** | warehouse (FK→Warehouse), inventory_date, status=`draft`, notes [], created_by, created_at auto, updated_at auto |
| **ShadeApproval** | fabric (FK→Fabric), shade_name, shade_code, approved_by, approval_date, status=`pending`, notes [], created_at auto |
| **StockMovement** | item_type, item_id, from_warehouse (FK→Warehouse?), to_warehouse (FK→Warehouse?), movement_type, quantity, reference_number [], notes [], created_by, created_at auto |
| **Trim** | warehouse (FK→Warehouse?), name, code, quantity=0, unit=`pcs`, threshold_quantity=0, unit_price?, is_active=True, created_at auto, updated_at auto |
| **Warehouse** | name, code, location [], is_active=True, created_at auto, updated_at auto. Reverse: fabrics, accessories, trims, outgoing_movements, incoming_movements, physical_inventories |

## merchandising

| Model | Fields |
|---|---|
| **BudgetDemandAssessment** | buyer (FK→Buyer), assessment_date, forecast_quantity, booked_quantity=0, gap_quantity=0, revenue_estimate=0, confidence=`medium`, notes [], created_at auto, updated_at auto |
| **BuyerEnquiry** | buyer (FK→Buyer), style (FK→Style?), enquiry_date, status=`received`, notes [], created_at auto, updated_at auto |
| **DevelopmentMonitoring** | style (FK→Style), supplier, stage, start_date, completion_date?, status=`pending`, notes [], created_at auto, updated_at auto |
| **IeSuggestion** | production_line (FK→ProductionLine?), style (FK→Style?), operation, current_pph, target_pph, description [], status=`pending`, created_at auto, updated_at auto |
| **OrderItem** | purchase_order (FK→PurchaseOrder), color, size, qty |
| **OrderStageLog** | purchase_order (FK→PurchaseOrder), stage, changed_at auto, notes [] |
| **ProcessWiseTarget** | process_name, target_quantity, achieved_quantity=0, variance=0, target_date, status=`on_track`, notes [], created_at auto, updated_at auto |
| **ProductionDowntime** | production_line (FK→ProductionLine?), style (FK→Style?), start_datetime, duration_hours, cause, description [], status=`ongoing`, created_at auto, updated_at auto |
| **PurchaseOrder** | buyer (FK→Buyer), style (FK→Style), po_number, order_date, delivery_date, quantity, unit_price, total_value, status=`draft`, notes [], created_at auto, updated_at auto. Reverse: items, stage_logs, production_plans, production_orders, subcontract_orders, amendments, tasks, timelines, plans |
| **SMVRecord** | style (FK→Style), smv, calculated_by, calculation_date, notes [], created_at auto |
| **SampleOrder** | buyer (FK→Buyer), style (FK→Style), sample_type, quantity, request_date, deadline, status=`requested`, notes [], created_at auto, updated_at auto |
| **Season** | name, year, created_at auto. Reverse: styles |
| **SkillInventory** | employee (FK→Employee?), operator_name [], production_line (FK→ProductionLine?), skill_name, skill_level=`beginner`, multi_skill=False, last_assessed?, notes [], created_at auto, updated_at auto |
| **Style** | buyer (FK→Buyer), season (FK→Season?), name, style_number, description [], category [], is_active=True, created_at auto, updated_at auto. Reverse: enquiries, purchase_orders, sample_orders, smv_records, development_monitoring, ie_suggestions, downtimes, capacity_bookings, line_plans, production_plans, risk_assessments, analyses, production_orders, subcontract_orders, tasks, timelines, pre_costings, cost_sheets, orders, performance_records, plans |

## multi_company

| Model | Fields |
|---|---|
| **GroupCompany** | name, code, registration_number [], tax_id [], address [], country [], base_currency (FK→Currency?), is_active=True, created_at auto, updated_at auto. Reverse: subsidiaries |
| **LocationBasedOperation** | multi_company (FK→MultiCompany), location (FK→Location), operation_type, is_active=True, created_at auto |
| **MultiCompany** | parent_company (FK→GroupCompany), name, code, address [], country [], currency (FK→Currency?), is_active=True, created_at auto, updated_at auto. Reverse: locations |

## orders

| Model | Fields |
|---|---|
| **Order** | buyer (FK→Buyer), style (FK→Style), order_number, order_date, delivery_date, quantity, unit_price, total_value, status=`pending`, priority=`medium`, notes [], created_at auto, updated_at auto. Reverse: shipments, commercial_invoices, supplier_documents, disbursements |
| *GraphQL access:* | `allSalesOrders`, `salesOrderById` (hand-written SalesOrder type) + generic `createOrder` / `updateOrder` / `deleteOrder`. (`allOrders` / `orderByPoNumber` are the **PurchaseOrder** contract) |

## performance

| Model | Fields |
|---|---|
| **PerformanceRecord** | style (FK→Style?), production_line (FK→ProductionLine?), record_date, metric, value, target (Decimal?), unit [], notes [], created_at auto |

## planning

| Model | Fields |
|---|---|
| **Plan** | style (FK→Style?), purchase_order (FK→PurchaseOrder?), plan_type, title, start_date, end_date, details (JSON []), status=`draft`, notes [], created_by, created_at auto, updated_at auto |

## procurement

| Model | Fields |
|---|---|
| **QuotationAnalysis** | supplier (FK→Supplier), item_type, quantity, quoted_price, delivery_terms [], payment_terms [], validity_date, status=`pending`, notes [], created_at auto, updated_at auto |
| **RawMaterialBooking** | supplier (FK→Supplier), booking_number, booking_date, expected_delivery_date, item_type, item_id, quantity, unit_price, total_value, status=`draft`, notes [], created_at auto, updated_at auto |
| **RawMaterialRequisition** | requisition_number, item_type, item_id, quantity, required_date, purpose [], status=`draft`, requested_by, approved_by [], created_at auto, updated_at auto |
| **Supplier** | name, code, contact_person [], email [], phone [], address [], supplier_type=`general`, rating (Decimal?), is_active=True, created_at auto, updated_at auto. Reverse: bookings, quotations, payables, commercial_shipments, lcs, commercial_invoices, documents |

## production

| Model | Fields |
|---|---|
| **BottleneckAlert** | production_line (FK→ProductionLine), alert_message, is_resolved=False, resolved_at (DateTime?), created_at auto |
| **CuttingRecord** | production_order (FK→ProductionOrder), date, quantity_cut, fabric_used, waste_quantity=0, notes [], created_at auto |
| **DefectLog** | production_line (FK→ProductionLine), date, defect_type [], checked_quantity, defect_quantity, defect_rate?, created_at auto |
| **FloorRequisition** | production_order (FK→ProductionOrder), item_type, quantity_requested, quantity_approved?, request_date, status=`pending`, notes [], created_at auto, updated_at auto |
| **HeatmapData** | production_line (FK→ProductionLine), metric, value, timestamp, created_at auto |
| **InspectionPacking** | production_order (FK→ProductionOrder), date, inspected_quantity, passed_quantity, failed_quantity=0, packed_quantity=0, notes [], created_at auto |
| **LineCapacity** | production_line (FK→ProductionLine), date, daily_capacity_pcs, updated_at auto |
| **OEELog** | production_line (FK→ProductionLine), timestamp, availability_rate, performance_rate, quality_rate, oee_score |
| **ProductionLine** | name, code, location [], production_unit (FK→ProductionUnit?), capacity, is_active=True, created_at auto, updated_at auto. Reverse: ie_suggestions, skill_inventories, downtimes, production_orders, sewing_records, capacities, shifts, production_records, oee_logs, defect_logs, heatmap_data, bottleneck_alerts, performance_records, schedules |
| **ProductionOrder** | purchase_order (FK→PurchaseOrder), style (FK→Style), production_line (FK→ProductionLine?), order_number, quantity, start_date, end_date?, status=`pending`, notes [], created_at auto, updated_at auto. Reverse: cutting_records, sewing_records, inspection_packing, floor_requisitions, inline_qc_records, endline_qc_records, rejection_reports, final_inspections, schedules |
| **ProductionRecord** | production_line (FK→ProductionLine), date, output_quantity, notes [], created_at auto |
| **ProductionShift** | production_line (FK→ProductionLine?), name, start_time, end_time, is_active=True, created_at auto |
| **ProductionUnit** | name, location [], is_active=True, created_at auto, updated_at auto. Reverse: lines |
| **SewingRecord** | production_order (FK→ProductionOrder), production_line (FK→ProductionLine?), date, input_quantity, output_quantity, defect_quantity=0, efficiency?, notes [], created_at auto |

## quality

| Model | Fields |
|---|---|
| **DefectCategory** | name, code, description [], is_active=True. Reverse: fabricinspection, inlineqc, endlineqc, rejectionreport |
| **EndLineQC** | production_order (FK→ProductionOrder), check_date, checked_quantity, passed_quantity, failed_quantity=0, defect_category (FK→DefectCategory?), remarks [], status=`pass`, checked_by, created_at auto |
| **FabricInspection** | fabric_received_from, supplier [], inspection_date, total_quantity, inspected_quantity, passed_quantity, rejected_quantity=0, defect_category (FK→DefectCategory?), status=`pending`, notes [], inspected_by, created_at auto |
| **FinalInspection** | production_order (FK→ProductionOrder), inspection_date, inspected_quantity, passed_quantity, failed_quantity=0, aql_level [], critical_defects=0, major_defects=0, minor_defects=0, status=`pass`, notes [], inspected_by, created_at auto |
| **InlineQC** | production_order (FK→ProductionOrder), production_line, check_date, checked_quantity, defect_quantity=0, defect_category (FK→DefectCategory?), defect_description [], action_taken [], status=`pass`, checked_by, created_at auto |
| **RejectionReport** | production_order (FK→ProductionOrder), report_date, stage, rejected_quantity, defect_category (FK→DefectCategory?), defect_details, corrective_action [], reported_by, created_at auto |

## rbac

| Model | Fields |
|---|---|
| **Permission** | codename (UNIQUE), label, group [] |
| **Role** | name (UNIQUE), description [], is_system=False. Reverse: role_permissions, user_roles |
| **RolePermission** | role (FK→Role), permission (FK→Permission) |
| **UserRole** | user (FK→User), role (FK→Role) |

## reporting

| Model | Fields |
|---|---|
| **Dashboard** | name, dashboard_type, config (JSON={}), is_default=False, created_by, created_at auto, updated_at auto |
| **Report** | title, report_type, parameters (JSON []), generated_by, generated_at auto, file (File?), status=`generating`, notes [] |

## scheduling

| Model | Fields |
|---|---|
| **Schedule** | production_order (FK→ProductionOrder), production_line (FK→ProductionLine), scheduled_date, start_time (Time?), end_time (Time?), target_quantity, status=`scheduled`, notes [], created_at auto, updated_at auto |

## subcontract

| Model | Fields |
|---|---|
| **SubcontractOrder** | style (FK→Style), purchase_order (FK→PurchaseOrder?), order_number, subcontractor_name, process, quantity, rate, total_value, start_date, expected_completion, actual_completion?, status=`pending`, notes [], created_at auto, updated_at auto. Reverse: tracking_entries |
| **SubcontractTracking** | subcontract_order (FK→SubcontractOrder), tracking_date, quantity_received=0, quantity_passed=0, quantity_rejected=0, status, remarks [], created_at auto |

## tna

| Model | Fields |
|---|---|
| **AlarmNotification** | task (FK→Task?), alarm_type, recipient, message, scheduled_at, sent_at?, status=`scheduled`, created_at auto |
| **JobOrder** | task (FK→Task), job_order_number, description [], assigned_department, assigned_person [], start_date, end_date, status=`pending`, notes [], created_at auto, updated_at auto |
| **Task** | parent_task (FK→Task?), purchase_order (FK→PurchaseOrder?), style (FK→Style?), title, description [], assigned_to [], start_date, end_date, duration_days, priority=`medium`, status=`not_started`, progress=0, notes [], created_at auto, updated_at auto. Reverse: sub_tasks, job_orders, alarms |
| **Timeline** | purchase_order (FK→PurchaseOrder), style (FK→Style), milestone, planned_date, actual_date?, status=`pending`, notes [], created_at auto |

## Coverage notes

- **108 models, all exposed** via GraphQL: type + `all<Plural>` + `<model>ById` + `create/update/delete<Model>`.
- `orders.Order` uses the hand-written SalesOrder surface (`allSalesOrders`,
  `salesOrderById`) plus generic CRUD; `allOrders`/`orderByPoNumber` are the
  PurchaseOrder contract (see `frontend_graphql_guide.md`).
- `authentication.User`: `allUsers`/`userById` available; `password` is never
  returned; user CRUD via GraphQL hashes the password automatically.
- M2M auto-created through tables (`User_groups`, `User_user_permissions`) are
  not exposed as models.
- `commercial.Invoice` etc. reference `orders.Order` (not PurchaseOrder) via
  `purchase_order` FK — for PurchaseOrder-linked documents use
  `merchandising.PurchaseOrder`.