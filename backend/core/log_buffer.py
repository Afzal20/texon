"""In-memory log ring buffer for the admin panel "Logs" page.

A ``logging.Handler`` subclass that keeps the most recent log records in a
bounded, thread-safe ``deque``. It is wired into ``LOGGING`` in
``config/settings.py`` next to the console handler so every record that is
printed to stdout is also retained in-process, which lets staff inspect recent
application activity from the Unfold admin without access to the platform log
stream (this also works on Vercel/serverless where there are no log files).
"""
import logging
from collections import deque
from datetime import datetime, timezone as dt_timezone
from threading import Lock

from django.utils import timezone

# Level -> tailwind badge classes used by the admin logs template
LEVEL_BADGES = {
    "DEBUG": "bg-gray-500/10 text-gray-500",
    "INFO": "bg-sky-500/10 text-sky-500",
    "WARNING": "bg-amber-500/10 text-amber-500",
    "ERROR": "bg-red-500/10 text-red-500",
    "CRITICAL": "bg-fuchsia-500/10 text-fuchsia-500",
}


class MemoryLogHandler(logging.Handler):
    """Keep the last ``capacity`` log records in memory.

    Implemented as a singleton: ``dictConfig`` instantiates the class itself
    (see the ``memory`` handler in ``config/settings.py``), while admin views
    import the shared instance as ``core.log_buffer.handler``. ``__new__``
    guarantees both refer to the same object; repeat ``__init__`` calls are
    ignored so reconfiguration never wipes the buffer.
    """

    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self, capacity=2000, level=logging.NOTSET):
        if getattr(self, "_initialized", False):
            return
        super().__init__(level=level)
        self.capacity = capacity
        self._lock = Lock()
        self._records = deque(maxlen=capacity)
        self._initialized = True

    def emit(self, record):
        # Format exceptions eagerly: keeping exc_info alive would pin stack
        # frames (and everything they reference) in memory.
        exc_text = None
        if record.exc_info:
            exc_text = "".join(
                logging.Formatter().formatException(record.exc_info)
            ).strip()
        entry = {
            "timestamp": timezone.localtime(
                datetime.fromtimestamp(record.created, tz=dt_timezone.utc)
            ),
            "level": record.levelname,
            "logger": record.name,
            "module": record.module,
            "message": record.getMessage(),
            "exc_text": exc_text,
            "badge": LEVEL_BADGES.get(record.levelname, LEVEL_BADGES["DEBUG"]),
        }
        with self._lock:
            self._records.append(entry)

    def snapshot(self):
        """Return a copy of the buffered entries, newest first."""
        with self._lock:
            return list(reversed(self._records))

    def clear(self):
        with self._lock:
            self._records.clear()

    def counts_by_level(self):
        """Number of buffered records per level name."""
        with self._lock:
            counts = {}
            for entry in self._records:
                counts[entry["level"]] = counts.get(entry["level"], 0) + 1
        return counts


handler = MemoryLogHandler()
