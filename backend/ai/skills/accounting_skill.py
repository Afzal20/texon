from __future__ import annotations

from django.db.models import Q, Sum
from accounts.models import AccountsPayable, AccountsReceivable, ChartOfAccount, CostCenter, Expense, JournalEntry

from ..domain.entities import SkillResult
from .base import BaseToolSkill


class AccountingSkill(BaseToolSkill):
    @property
    def name(self) -> str:
        return "accounting"

    @property
    def description(self) -> str:
        return "Financial management — chart of accounts, journal entries, payables, receivables, expenses, and cost centers."

    @property
    def tool_definitions(self) -> list:
        return [
            self._make_tool(
                "get_accounts_payable",
                "Get accounts payable (money owed to suppliers).",
                {},
            ),
            self._make_tool(
                "get_accounts_receivable",
                "Get accounts receivable (money owed by buyers).",
                {},
            ),
            self._make_tool(
                "get_expenses",
                "Get expense records, optionally filtered by category.",
                {"category": {"type": "string", "description": "Filter by expense category"}, "limit": {"type": "integer", "description": "Max records"}},
                [],
            ),
            self._make_tool(
                "get_cost_centers",
                "List all cost centers and their budgets.",
                {},
            ),
            self._make_tool(
                "get_chart_of_accounts",
                "Get the chart of accounts, optionally filtered by type.",
                {
                    "account_type": {
                        "type": "string",
                        "enum": ["asset", "liability", "equity", "revenue", "expense", ""],
                        "description": "Filter by account type",
                    }
                },
                [],
            ),
            self._make_tool(
                "accounts_summary",
                "Quick financial summary — total payables, receivables, expenses.",
                {},
            ),
        ]

    def execute(self, tool_name: str, params: dict, user_id: int | None = None) -> SkillResult:
        handlers = {
            "get_accounts_payable": self._get_accounts_payable,
            "get_accounts_receivable": self._get_accounts_receivable,
            "get_expenses": self._get_expenses,
            "get_cost_centers": self._get_cost_centers,
            "get_chart_of_accounts": self._get_chart_of_accounts,
            "accounts_summary": self._accounts_summary,
        }
        handler = handlers.get(tool_name)
        if not handler:
            return self._error(f"Unknown tool: {tool_name}")
        return handler(**params)

    def _get_accounts_payable(self) -> SkillResult:
        qs = AccountsPayable.objects.select_related("supplier").filter(status__in=["pending", "partial", "overdue"])
        data = list(qs.values("supplier__name", "invoice_number", "amount", "paid_amount", "balance", "due_date", "status")[:30])
        return self._success(data, tool_name="get_accounts_payable")

    def _get_accounts_receivable(self) -> SkillResult:
        qs = AccountsReceivable.objects.select_related("buyer").filter(status__in=["pending", "partial", "overdue"])
        data = list(qs.values("buyer__name", "invoice_number", "amount", "received_amount", "balance", "due_date", "status")[:30])
        return self._success(data, tool_name="get_accounts_receivable")

    def _get_expenses(self, category: str = "", limit: int = 20) -> SkillResult:
        qs = Expense.objects.all().order_by("-expense_date")
        if category:
            qs = qs.filter(category__icontains=category)
        data = list(qs.values("category", "description", "amount", "expense_date", "cost_center__name", "status")[:limit])
        return self._success(data, tool_name="get_expenses")

    def _get_cost_centers(self) -> SkillResult:
        qs = CostCenter.objects.filter(is_active=True).values("name", "code", "department", "budget")
        return self._success(list(qs), tool_name="get_cost_centers")

    def _get_chart_of_accounts(self, account_type: str = "") -> SkillResult:
        qs = ChartOfAccount.objects.filter(is_active=True)
        if account_type:
            qs = qs.filter(account_type=account_type)
        data = list(qs.values("account_code", "account_name", "account_type")[:50])
        return self._success(data, tool_name="get_chart_of_accounts")

    def _accounts_summary(self) -> SkillResult:
        total_ap = AccountsPayable.objects.aggregate(total=Sum("balance"))["total"] or 0
        total_ar = AccountsReceivable.objects.aggregate(total=Sum("balance"))["total"] or 0
        total_expenses = Expense.objects.aggregate(total=Sum("amount"))["total"] or 0
        return self._success({
            "total_payables": float(total_ap),
            "total_receivables": float(total_ar),
            "total_expenses": float(total_expenses),
        }, tool_name="accounts_summary")
