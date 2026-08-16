// GENERATED from live GraphQL introspection of the backend schema — do not edit by hand.
// Regenerate: introspect http://localhost:8000/graphql/ and rebuild (see docs/frontend/05).

export interface ModelEntry {
  app: string
  model: string
  query: string
  fields: string[]
}

// app label -> { ModelName -> { query: all<X> field name, fields: queryable scalar/enum fields } }
// (app/model come from the keys)
export const MODEL_REGISTRY: Record<string, Record<string, Omit<ModelEntry, "app" | "model">>> = {
  "accounts": {
    "AccountsPayable": {
      "fields": [
        "id",
        "invoiceNumber",
        "invoiceDate",
        "dueDate",
        "amount",
        "paidAmount",
        "balance",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allAccountsPayables"
    },
    "AccountsReceivable": {
      "fields": [
        "id",
        "invoiceNumber",
        "invoiceDate",
        "dueDate",
        "amount",
        "receivedAmount",
        "balance",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allAccountsReceivables"
    },
    "ChartOfAccount": {
      "fields": [
        "id",
        "accountCode",
        "accountName",
        "accountType",
        "isActive",
        "createdAt",
        "updatedAt"
      ],
      "query": "allChartOfAccounts"
    },
    "CostCenter": {
      "fields": [
        "id",
        "name",
        "code",
        "department",
        "budget",
        "isActive",
        "createdAt",
        "updatedAt"
      ],
      "query": "allCostCenters"
    },
    "Expense": {
      "fields": [
        "id",
        "expenseDate",
        "category",
        "description",
        "amount",
        "approvedBy",
        "status",
        "notes",
        "createdBy",
        "createdAt",
        "updatedAt"
      ],
      "query": "allExpenses"
    },
    "JournalEntry": {
      "fields": [
        "id",
        "entryNumber",
        "entryDate",
        "description",
        "debit",
        "credit",
        "reference",
        "createdBy",
        "createdAt"
      ],
      "query": "allJournalEntries"
    }
  },
  "authentication": {
    "OTP": {
      "fields": [
        "id",
        "code",
        "purpose",
        "isUsed",
        "expiresAt",
        "createdAt"
      ],
      "query": "allOtPs"
    },
    "SocialAuthCallbackUrl": {
      "fields": [
        "id",
        "provider",
        "callbackUrl"
      ],
      "query": "allSocialAuthCallbackUrls"
    },
    "User": {
      "fields": [
        "id",
        "lastLogin",
        "isSuperuser",
        "firstName",
        "lastName",
        "isStaff",
        "isActive",
        "dateJoined",
        "email",
        "phone",
        "isVerified"
      ],
      "query": "allUsers"
    }
  },
  "buyers": {
    "Buyer": {
      "fields": [
        "id",
        "name",
        "code",
        "country",
        "address",
        "contactPerson",
        "email",
        "phone",
        "isActive",
        "sequence",
        "createdAt",
        "updatedAt"
      ],
      "query": "allBuyers"
    },
    "BuyerPortfolio": {
      "fields": [
        "id",
        "activeOrders",
        "totalUnits",
        "totalValue",
        "updatedAt"
      ],
      "query": "allBuyerPortfolios"
    },
    "BuyerRating": {
      "fields": [
        "id",
        "rating",
        "reviewsCount",
        "updatedAt"
      ],
      "query": "allBuyerRatings"
    }
  },
  "commercial": {
    "BillOfExchange": {
      "fields": [
        "id",
        "billNumber",
        "bankName",
        "bankReference",
        "amount",
        "issueDate",
        "maturityDate",
        "status",
        "documentsRequired",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allBillOfExchanges"
    },
    "Disbursement": {
      "fields": [
        "id",
        "disbursementNumber",
        "category",
        "amount",
        "disbursementDate",
        "approvedBy",
        "approvalDate",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allDisbursements"
    },
    "Invoice": {
      "fields": [
        "id",
        "invoiceNumber",
        "invoiceDate",
        "dueDate",
        "amount",
        "invoiceType",
        "status",
        "paidAmount",
        "paymentTerms",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allInvoices"
    },
    "LetterOfCredit": {
      "fields": [
        "id",
        "lcNumber",
        "lcType",
        "amount",
        "issueDate",
        "expiryDate",
        "bankName",
        "bankReference",
        "status",
        "amendmentCount",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allLetterOfCredits"
    },
    "Realization": {
      "fields": [
        "id",
        "realizationNumber",
        "expectedAmount",
        "realizedAmount",
        "realizationDate",
        "dueDate",
        "status",
        "shortReason",
        "shortAmount",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allRealizations"
    },
    "SODFCTransfer": {
      "fields": [
        "id",
        "transferNumber",
        "transferType",
        "bankName",
        "bankReference",
        "amount",
        "transferDate",
        "acknowledgedBy",
        "acknowledgmentDate",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allSodfcTransfers"
    },
    "Shipment": {
      "fields": [
        "id",
        "shipmentNumber",
        "direction",
        "shipmentType",
        "portOfLoading",
        "portOfDischarge",
        "containerNumber",
        "containerSize",
        "forwarder",
        "vesselName",
        "carrier",
        "bookingNumber",
        "shipmentDate",
        "etd",
        "eta",
        "actualArrival",
        "grossWeight",
        "netWeight",
        "volumeCbm",
        "status",
        "clearanceStatus",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allShipments"
    },
    "SupplierDocument": {
      "fields": [
        "id",
        "documentNumber",
        "documentType",
        "receivedDate",
        "reviewedBy",
        "reviewDate",
        "status",
        "rejectionReason",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allSupplierDocuments"
    }
  },
  "compliance": {
    "ComplianceRecord": {
      "fields": [
        "id",
        "complianceType",
        "title",
        "description",
        "auditDate",
        "auditBy",
        "score",
        "status",
        "findings",
        "correctiveActions",
        "followUpDate",
        "createdAt",
        "updatedAt"
      ],
      "query": "allComplianceRecords"
    }
  },
  "core": {
    "Currency": {
      "fields": [
        "id",
        "code",
        "name",
        "symbol",
        "exchangeRate",
        "isBase",
        "isActive"
      ],
      "query": "allCurrencies"
    },
    "Location": {
      "fields": [
        "id",
        "name",
        "code",
        "address",
        "city",
        "country",
        "isActive",
        "createdAt",
        "updatedAt"
      ],
      "query": "allLocations"
    }
  },
  "costing": {
    "CostSheet": {
      "fields": [
        "id",
        "costDate",
        "fabricCost",
        "accessoryCost",
        "trimCost",
        "laborCost",
        "overheadCost",
        "commercialCost",
        "totalCost",
        "sellingPrice",
        "margin",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allCostSheets"
    },
    "PreCosting": {
      "fields": [
        "id",
        "costDate",
        "estimatedFabricCost",
        "estimatedAccessoryCost",
        "estimatedTrimCost",
        "estimatedLaborCost",
        "estimatedOverhead",
        "totalEstimatedCost",
        "targetPrice",
        "expectedMargin",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allPreCostings"
    }
  },
  "crm": {
    "BuyerCommunication": {
      "fields": [
        "id",
        "communicationType",
        "subject",
        "content",
        "contactPerson",
        "communicationDate",
        "followUpDate",
        "status",
        "createdBy",
        "createdAt",
        "updatedAt"
      ],
      "query": "allBuyerCommunications"
    },
    "BuyerProfitability": {
      "fields": [
        "id",
        "periodStart",
        "periodEnd",
        "totalRevenue",
        "totalCost",
        "profit",
        "profitMargin",
        "createdAt"
      ],
      "query": "allBuyerProfitabilities"
    },
    "OrderAmendmentHistory": {
      "fields": [
        "id",
        "amendmentDate",
        "previousValue",
        "newValue",
        "reason",
        "amendedBy",
        "createdAt"
      ],
      "query": "allOrderAmendmentHistories"
    }
  },
  "fixed_assets": {
    "AssetCategory": {
      "fields": [
        "id",
        "name",
        "code",
        "description",
        "depreciationMethod",
        "usefulLifeYears",
        "isActive"
      ],
      "query": "allAssetCategories"
    },
    "DepreciationSchedule": {
      "fields": [
        "id",
        "year",
        "period",
        "openingValue",
        "depreciation",
        "closingValue",
        "createdAt"
      ],
      "query": "allDepreciationSchedules"
    },
    "FixedAsset": {
      "fields": [
        "id",
        "assetCode",
        "name",
        "description",
        "purchaseDate",
        "purchaseCost",
        "currentValue",
        "salvageValue",
        "depreciationAmount",
        "status",
        "assignedTo",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allFixedAssets"
    }
  },
  "hr": {
    "Attendance": {
      "fields": [
        "id",
        "date",
        "checkIn",
        "checkOut",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allAttendances"
    },
    "Bonus": {
      "fields": [
        "id",
        "bonusType",
        "amount",
        "bonusDate",
        "description",
        "status",
        "createdAt"
      ],
      "query": "allBonuses"
    },
    "Department": {
      "fields": [
        "id",
        "name",
        "code",
        "description",
        "isActive",
        "createdAt",
        "updatedAt"
      ],
      "query": "allDepartments"
    },
    "Designation": {
      "fields": [
        "id",
        "name",
        "code",
        "description",
        "isActive",
        "createdAt",
        "updatedAt"
      ],
      "query": "allDesignations"
    },
    "Employee": {
      "fields": [
        "id",
        "employeeId",
        "firstName",
        "lastName",
        "email",
        "phone",
        "dateOfBirth",
        "dateOfJoining",
        "employmentType",
        "gender",
        "status",
        "isActive",
        "createdAt",
        "updatedAt"
      ],
      "query": "allEmployees"
    },
    "Leave": {
      "fields": [
        "id",
        "leaveType",
        "startDate",
        "endDate",
        "totalDays",
        "reason",
        "status",
        "approvedBy",
        "createdAt",
        "updatedAt"
      ],
      "query": "allLeaves"
    },
    "Overtime": {
      "fields": [
        "id",
        "date",
        "hours",
        "rate",
        "totalAmount",
        "status",
        "approvedBy",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allOvertimes"
    },
    "SalarySheet": {
      "fields": [
        "id",
        "month",
        "basicSalary",
        "allowances",
        "deductions",
        "overtimeAmount",
        "bonusAmount",
        "netSalary",
        "status",
        "paymentDate",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allSalarySheets"
    }
  },
  "ie_planning": {
    "CapacityBooking": {
      "fields": [
        "id",
        "line",
        "capacityPerDay",
        "bookingDate",
        "allocatedDays",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allCapacityBookings"
    },
    "LinePlan": {
      "fields": [
        "id",
        "line",
        "planDate",
        "targetQuantity",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allLinePlans"
    },
    "ProductionPlan": {
      "fields": [
        "id",
        "plannedStartDate",
        "plannedEndDate",
        "dailyTarget",
        "totalQuantity",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allProductionPlans"
    },
    "RiskAssessment": {
      "fields": [
        "id",
        "riskType",
        "severity",
        "likelihood",
        "mitigationPlan",
        "status",
        "createdAt",
        "updatedAt"
      ],
      "query": "allRiskAssessments"
    },
    "StyleAnalysis": {
      "fields": [
        "id",
        "analysisType",
        "findings",
        "recommendation",
        "analyzedBy",
        "analysisDate",
        "createdAt"
      ],
      "query": "allStyleAnalyses"
    }
  },
  "inventory": {
    "Accessory": {
      "fields": [
        "id",
        "name",
        "code",
        "category",
        "quantity",
        "unit",
        "thresholdQuantity",
        "unitPrice",
        "isActive",
        "createdAt",
        "updatedAt"
      ],
      "query": "allAccessories"
    },
    "Fabric": {
      "fields": [
        "id",
        "name",
        "code",
        "color",
        "composition",
        "width",
        "quantity",
        "unit",
        "thresholdQuantity",
        "unitPrice",
        "isActive",
        "createdAt",
        "updatedAt"
      ],
      "query": "allFabrics"
    },
    "PhysicalInventory": {
      "fields": [
        "id",
        "inventoryDate",
        "status",
        "notes",
        "createdBy",
        "createdAt",
        "updatedAt"
      ],
      "query": "allPhysicalInventories"
    },
    "ShadeApproval": {
      "fields": [
        "id",
        "shadeName",
        "shadeCode",
        "approvedBy",
        "approvalDate",
        "status",
        "notes",
        "createdAt"
      ],
      "query": "allShadeApprovals"
    },
    "StockMovement": {
      "fields": [
        "id",
        "itemType",
        "itemId",
        "movementType",
        "quantity",
        "referenceNumber",
        "notes",
        "createdBy",
        "createdAt"
      ],
      "query": "allStockMovements"
    },
    "Trim": {
      "fields": [
        "id",
        "name",
        "code",
        "quantity",
        "unit",
        "thresholdQuantity",
        "unitPrice",
        "isActive",
        "createdAt",
        "updatedAt"
      ],
      "query": "allTrims"
    },
    "Warehouse": {
      "fields": [
        "id",
        "name",
        "code",
        "location",
        "isActive",
        "createdAt",
        "updatedAt"
      ],
      "query": "allWarehouses"
    }
  },
  "merchandising": {
    "BudgetDemandAssessment": {
      "fields": [
        "id",
        "assessmentDate",
        "forecastQuantity",
        "bookedQuantity",
        "gapQuantity",
        "revenueEstimate",
        "confidence",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allBudgetDemandAssessments"
    },
    "BuyerEnquiry": {
      "fields": [
        "id",
        "enquiryDate",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allBuyerEnquiries"
    },
    "DevelopmentMonitoring": {
      "fields": [
        "id",
        "supplier",
        "stage",
        "startDate",
        "completionDate",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allDevelopmentMonitorings"
    },
    "IeSuggestion": {
      "fields": [
        "id",
        "operation",
        "currentPph",
        "targetPph",
        "description",
        "status",
        "createdAt",
        "updatedAt"
      ],
      "query": "allIeSuggestions"
    },
    "OrderItem": {
      "fields": [
        "id",
        "color",
        "size",
        "qty"
      ],
      "query": "allOrderItems"
    },
    "OrderStageLog": {
      "fields": [
        "id",
        "stage",
        "changedAt",
        "notes"
      ],
      "query": "allOrderStageLogs"
    },
    "ProcessWiseTarget": {
      "fields": [
        "id",
        "processName",
        "targetQuantity",
        "achievedQuantity",
        "variance",
        "targetDate",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allProcessWiseTargets"
    },
    "ProductionDowntime": {
      "fields": [
        "id",
        "startDatetime",
        "durationHours",
        "cause",
        "description",
        "status",
        "createdAt",
        "updatedAt"
      ],
      "query": "allProductionDowntimes"
    },
    "PurchaseOrder": {
      "fields": [
        "id",
        "poNumber",
        "orderDate",
        "deliveryDate",
        "quantity",
        "unitPrice",
        "totalValue",
        "status",
        "notes",
        "createdAt",
        "updatedAt",
        "qty",
        "shipDate",
        "currentStage",
        "riskScore",
        "riskLevel"
      ],
      "query": "allPurchaseOrders"
    },
    "SMVRecord": {
      "fields": [
        "id",
        "smv",
        "calculatedBy",
        "calculationDate",
        "notes",
        "createdAt"
      ],
      "query": "allSmvRecords"
    },
    "SampleOrder": {
      "fields": [
        "id",
        "sampleType",
        "quantity",
        "requestDate",
        "deadline",
        "status",
        "notes",
        "createdAt",
        "updatedAt",
        "submissionDate",
        "comments"
      ],
      "query": "allSampleOrders"
    },
    "Season": {
      "fields": [
        "id",
        "name",
        "year",
        "createdAt"
      ],
      "query": "allSeasons"
    },
    "SkillInventory": {
      "fields": [
        "id",
        "operatorName",
        "skillName",
        "skillLevel",
        "multiSkill",
        "lastAssessed",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allSkillInventories"
    },
    "Style": {
      "fields": [
        "id",
        "name",
        "description",
        "category",
        "isActive",
        "createdAt",
        "updatedAt",
        "code"
      ],
      "query": "allStyles"
    }
  },
  "multi_company": {
    "GroupCompany": {
      "fields": [
        "id",
        "name",
        "code",
        "registrationNumber",
        "taxId",
        "address",
        "country",
        "isActive",
        "createdAt",
        "updatedAt"
      ],
      "query": "allGroupCompanies"
    },
    "LocationBasedOperation": {
      "fields": [
        "id",
        "operationType",
        "isActive",
        "createdAt"
      ],
      "query": "allLocationBasedOperations"
    },
    "MultiCompany": {
      "fields": [
        "id",
        "name",
        "code",
        "address",
        "country",
        "isActive",
        "createdAt",
        "updatedAt"
      ],
      "query": "allMultiCompanies"
    }
  },
  "orders": {
    "Order": {
      "fields": [
        "id",
        "orderNumber",
        "orderDate",
        "deliveryDate",
        "quantity",
        "unitPrice",
        "totalValue",
        "status",
        "priority",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allSalesOrders"
    }
  },
  "performance": {
    "PerformanceRecord": {
      "fields": [
        "id",
        "recordDate",
        "metric",
        "value",
        "target",
        "unit",
        "notes",
        "createdAt"
      ],
      "query": "allPerformanceRecords"
    }
  },
  "planning": {
    "Plan": {
      "fields": [
        "id",
        "planType",
        "title",
        "startDate",
        "endDate",
        "details",
        "status",
        "notes",
        "createdBy",
        "createdAt",
        "updatedAt"
      ],
      "query": "allPlans"
    }
  },
  "procurement": {
    "QuotationAnalysis": {
      "fields": [
        "id",
        "itemType",
        "quantity",
        "quotedPrice",
        "deliveryTerms",
        "paymentTerms",
        "validityDate",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allQuotationAnalyses"
    },
    "RawMaterialBooking": {
      "fields": [
        "id",
        "bookingNumber",
        "bookingDate",
        "expectedDeliveryDate",
        "itemType",
        "itemId",
        "quantity",
        "unitPrice",
        "totalValue",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allRawMaterialBookings"
    },
    "RawMaterialRequisition": {
      "fields": [
        "id",
        "requisitionNumber",
        "itemType",
        "itemId",
        "quantity",
        "requiredDate",
        "purpose",
        "status",
        "requestedBy",
        "approvedBy",
        "createdAt",
        "updatedAt"
      ],
      "query": "allRawMaterialRequisitions"
    },
    "Supplier": {
      "fields": [
        "id",
        "name",
        "code",
        "contactPerson",
        "email",
        "phone",
        "address",
        "supplierType",
        "rating",
        "isActive",
        "createdAt",
        "updatedAt"
      ],
      "query": "allSuppliers"
    }
  },
  "production": {
    "BottleneckAlert": {
      "fields": [
        "id",
        "alertMessage",
        "isResolved",
        "resolvedAt",
        "createdAt"
      ],
      "query": "allBottleneckAlerts"
    },
    "CuttingRecord": {
      "fields": [
        "id",
        "date",
        "quantityCut",
        "fabricUsed",
        "wasteQuantity",
        "notes",
        "createdAt"
      ],
      "query": "allCuttingRecords"
    },
    "DefectLog": {
      "fields": [
        "id",
        "date",
        "defectType",
        "checkedQuantity",
        "defectQuantity",
        "defectRate",
        "createdAt"
      ],
      "query": "allDefectLogs"
    },
    "FloorRequisition": {
      "fields": [
        "id",
        "itemType",
        "quantityRequested",
        "quantityApproved",
        "requestDate",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allFloorRequisitions"
    },
    "HeatmapData": {
      "fields": [
        "id",
        "metric",
        "value",
        "timestamp",
        "createdAt"
      ],
      "query": "allHeatmapData"
    },
    "InspectionPacking": {
      "fields": [
        "id",
        "date",
        "inspectedQuantity",
        "passedQuantity",
        "failedQuantity",
        "packedQuantity",
        "notes",
        "createdAt"
      ],
      "query": "allInspectionPackings"
    },
    "LineCapacity": {
      "fields": [
        "id",
        "date",
        "dailyCapacityPcs",
        "updatedAt"
      ],
      "query": "allLineCapacities"
    },
    "OEELog": {
      "fields": [
        "id",
        "timestamp",
        "availabilityRate",
        "performanceRate",
        "qualityRate",
        "oeeScore"
      ],
      "query": "allOeeLogs"
    },
    "ProductionLine": {
      "fields": [
        "id",
        "name",
        "code",
        "location",
        "isActive",
        "createdAt",
        "updatedAt",
        "capacityPcs"
      ],
      "query": "allProductionLines"
    },
    "ProductionOrder": {
      "fields": [
        "id",
        "orderNumber",
        "quantity",
        "startDate",
        "endDate",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allProductionOrders"
    },
    "ProductionRecord": {
      "fields": [
        "id",
        "date",
        "outputQuantity",
        "notes",
        "createdAt"
      ],
      "query": "allProductionRecords"
    },
    "ProductionShift": {
      "fields": [
        "id",
        "name",
        "startTime",
        "endTime",
        "isActive",
        "createdAt"
      ],
      "query": "allProductionShifts"
    },
    "ProductionUnit": {
      "fields": [
        "id",
        "name",
        "location",
        "isActive",
        "createdAt",
        "updatedAt"
      ],
      "query": "allProductionUnits"
    },
    "SewingRecord": {
      "fields": [
        "id",
        "date",
        "inputQuantity",
        "outputQuantity",
        "defectQuantity",
        "efficiency",
        "notes",
        "createdAt"
      ],
      "query": "allSewingRecords"
    }
  },
  "quality": {
    "DefectCategory": {
      "fields": [
        "id",
        "name",
        "code",
        "description",
        "isActive"
      ],
      "query": "allDefectCategories"
    },
    "EndLineQC": {
      "fields": [
        "id",
        "checkDate",
        "checkedQuantity",
        "passedQuantity",
        "failedQuantity",
        "remarks",
        "status",
        "checkedBy",
        "createdAt"
      ],
      "query": "allEndLineQCs"
    },
    "FabricInspection": {
      "fields": [
        "id",
        "fabricReceivedFrom",
        "supplier",
        "inspectionDate",
        "totalQuantity",
        "inspectedQuantity",
        "passedQuantity",
        "rejectedQuantity",
        "status",
        "notes",
        "inspectedBy",
        "createdAt"
      ],
      "query": "allFabricInspections"
    },
    "FinalInspection": {
      "fields": [
        "id",
        "inspectionDate",
        "inspectedQuantity",
        "passedQuantity",
        "failedQuantity",
        "aqlLevel",
        "criticalDefects",
        "majorDefects",
        "minorDefects",
        "status",
        "notes",
        "inspectedBy",
        "createdAt"
      ],
      "query": "allFinalInspections"
    },
    "InlineQC": {
      "fields": [
        "id",
        "productionLine",
        "checkDate",
        "checkedQuantity",
        "defectQuantity",
        "defectDescription",
        "actionTaken",
        "status",
        "checkedBy",
        "createdAt"
      ],
      "query": "allInlineQCs"
    },
    "RejectionReport": {
      "fields": [
        "id",
        "reportDate",
        "stage",
        "rejectedQuantity",
        "defectDetails",
        "correctiveAction",
        "reportedBy",
        "createdAt"
      ],
      "query": "allRejectionReports"
    }
  },
  "rbac": {
    "Permission": {
      "fields": [
        "id",
        "codename",
        "label",
        "group"
      ],
      "query": "allPermissions"
    },
    "Role": {
      "fields": [
        "id",
        "name",
        "description",
        "isSystem"
      ],
      "query": "allRoles"
    }
  },
  "reporting": {
    "Dashboard": {
      "fields": [
        "id",
        "name",
        "dashboardType",
        "config",
        "isDefault",
        "createdBy",
        "createdAt",
        "updatedAt"
      ],
      "query": "allDashboards"
    },
    "Report": {
      "fields": [
        "id",
        "title",
        "reportType",
        "parameters",
        "generatedBy",
        "generatedAt",
        "file",
        "status",
        "notes"
      ],
      "query": "allReports"
    }
  },
  "scheduling": {
    "Schedule": {
      "fields": [
        "id",
        "scheduledDate",
        "startTime",
        "endTime",
        "targetQuantity",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allSchedules"
    }
  },
  "subcontract": {
    "SubcontractOrder": {
      "fields": [
        "id",
        "orderNumber",
        "subcontractorName",
        "process",
        "quantity",
        "rate",
        "totalValue",
        "startDate",
        "expectedCompletion",
        "actualCompletion",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allSubcontractOrders"
    },
    "SubcontractTracking": {
      "fields": [
        "id",
        "trackingDate",
        "quantityReceived",
        "quantityPassed",
        "quantityRejected",
        "status",
        "remarks",
        "createdAt"
      ],
      "query": "allSubcontractTrackings"
    }
  },
  "tna": {
    "AlarmNotification": {
      "fields": [
        "id",
        "alarmType",
        "recipient",
        "message",
        "scheduledAt",
        "sentAt",
        "status",
        "createdAt"
      ],
      "query": "allAlarmNotifications"
    },
    "JobOrder": {
      "fields": [
        "id",
        "jobOrderNumber",
        "description",
        "assignedDepartment",
        "assignedPerson",
        "startDate",
        "endDate",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allJobOrders"
    },
    "Task": {
      "fields": [
        "id",
        "title",
        "description",
        "assignedTo",
        "startDate",
        "endDate",
        "durationDays",
        "priority",
        "status",
        "progress",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allTasks"
    },
    "Timeline": {
      "fields": [
        "id",
        "milestone",
        "plannedDate",
        "actualDate",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      ],
      "query": "allTimelines"
    }
  }
}

export const ALL_MODELS: ModelEntry[] = Object.entries(MODEL_REGISTRY)
  .flatMap(([app, models]) =>
    Object.entries(models).map(([model, entry]) => ({ app, model, ...entry } as ModelEntry)))

export function modelCount(): number {
  return ALL_MODELS.length
}