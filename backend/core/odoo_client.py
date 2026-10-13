import json
import logging
from typing import Any, Dict, List, Optional
from uuid import UUID

from django.conf import settings
import requests
from requests.exceptions import ConnectionError, ReadTimeout, Timeout

logger = logging.getLogger(__name__)


class OdooError(Exception):
    """Base error for Odoo communication."""


class OdooTransientError(OdooError):
    """Network connection failure, server unreachable, or gateway error (safe to retry)."""


class OdooTimeoutError(OdooError):
    """Timeout waiting for response after request was dispatched (outcome unknown)."""


class OdooBusinessError(OdooError):
    """Business validation, authorization, or logic error returned by Odoo (permanent)."""


class OdooClient:
    """JSON-RPC client for Texon–Odoo bridge communication."""

    def __init__(
        self,
        url: Optional[str] = None,
        db: Optional[str] = None,
        user: Optional[str] = None,
        password: Optional[str] = None,
        timeout: Optional[int] = None,
    ):
        self.url = (url or getattr(settings, "ODOO_URL", "http://localhost:8069")).rstrip("/")
        self.endpoint = f"{self.url}/jsonrpc"
        self.db = db or getattr(settings, "ODOO_DB", "odoo")
        self.user = user or getattr(settings, "ODOO_USER", "admin")
        self.password = password or getattr(settings, "ODOO_PASSWORD", "admin")
        self.timeout = timeout or getattr(settings, "ODOO_TIMEOUT_SECONDS", 10)
        self.uid: Optional[int] = None
        self._session = requests.Session()

    def _call(self, service: str, method: str, args: list) -> Any:
        payload = {
            "jsonrpc": "2.0",
            "method": "call",
            "params": {
                "service": service,
                "method": method,
                "args": args,
            },
            "id": None,
        }
        try:
            response = self._session.post(
                self.endpoint,
                json=payload,
                timeout=self.timeout,
                headers={"Content-Type": "application/json"},
            )
        except ReadTimeout as e:
            logger.warning("Timeout waiting for response from Odoo: %s", e)
            raise OdooTimeoutError("Timeout waiting for response after dispatch") from e
        except (ConnectionError, Timeout) as e:
            logger.warning("Connection failure communicating with Odoo: %s", e)
            raise OdooTransientError(f"Connection failure: {e}") from e
        except Exception as e:
            logger.error("Unexpected error communicating with Odoo: %s", e)
            raise OdooTransientError(f"Transport failure: {e}") from e

        if response.status_code >= 500:
            raise OdooTransientError(f"Odoo server error HTTP {response.status_code}")

        try:
            data = response.json()
        except ValueError as e:
            raise OdooTransientError("Non-JSON response received from Odoo") from e

        if "error" in data:
            err = data["error"]
            err_data = err.get("data", {})
            err_name = err_data.get("name", "")
            err_msg = err_data.get("message", err.get("message", "Unknown error"))
            logger.warning("Odoo RPC error: %s (%s)", err_name, err_msg)
            raise OdooBusinessError(f"{err_name}: {err_msg}")

        return data.get("result")

    def authenticate(self) -> int:
        if self.uid is not None:
            return self.uid

        result = self._call("common", "authenticate", [self.db, self.user, self.password, {}])
        if not result:
            raise OdooBusinessError("Authentication failed: invalid credentials or database")
        self.uid = int(result)
        return self.uid

    def execute_kw(self, model: str, method: str, args: list, kwargs: Optional[dict] = None) -> Any:
        uid = self.authenticate()
        call_args = [self.db, uid, self.password, model, method, args, kwargs or {}]
        return self._call("object", "execute_kw", call_args)

    def execute_atomic_command(
        self,
        operation_uuid: UUID,
        company_id: int,
        command_name: str,
        payload: Dict[str, Any],
        actor_id: str,
    ) -> Dict[str, Any]:
        """Execute an allowlisted command through texon.bridge.service with idempotency."""
        result = self.execute_kw(
            "texon.bridge.service",
            "execute_atomic_command",
            [str(operation_uuid), company_id, command_name, payload, actor_id],
        )
        if not isinstance(result, dict):
            raise OdooBusinessError("Bridge returned non-dictionary response")
        return result

    def read_workspace(
        self,
        company_id: int,
        section: str = "sales",
        limit: int = 20,
        offset: int = 0,
        record_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Read scoped ERP workspace data directly from authoritative Odoo models."""
        result = self.execute_kw(
            "texon.bridge.service",
            "read_workspace",
            [company_id],
            {"section": section, "limit": limit, "offset": offset, "record_id": record_id},
        )
        if not isinstance(result, dict):
            raise OdooBusinessError("Bridge returned non-dictionary workspace response")
        return result
