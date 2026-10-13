import time
from uuid import uuid4

from django.core.management.base import BaseCommand

from core.dispatcher import process_outbox_batch
from core.odoo_client import OdooClient


class Command(BaseCommand):
    help = "Process and dispatch queued transactional outbox commands to Odoo."

    def add_arguments(self, parser):
        parser.add_argument("--batch-size", type=int, default=10, help="Number of commands to claim per batch")
        parser.add_argument("--once", action="store_true", help="Process one batch and exit")
        parser.add_argument("--sleep-interval", type=float, default=2.0, help="Seconds to sleep when queue is empty")

    def handle(self, *args, **options):
        batch_size = options["batch_size"]
        run_once = options["once"]
        sleep_interval = options["sleep_interval"]

        worker_id = uuid4()
        client = OdooClient()
        self.stdout.write(self.style.SUCCESS(f"Starting outbox dispatcher worker: {worker_id}"))

        while True:
            try:
                processed = process_outbox_batch(worker_id=worker_id, batch_size=batch_size, client=client)
                if processed > 0:
                    self.stdout.write(f"Processed {processed} outbox command(s)")
                elif run_once:
                    self.stdout.write("Queue is empty, exiting --once mode.")
                    break
                else:
                    time.sleep(sleep_interval)
            except KeyboardInterrupt:
                self.stdout.write(self.style.WARNING("Dispatcher stopped by user."))
                break
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error in dispatcher loop: {e}"))
                if run_once:
                    break
                time.sleep(sleep_interval)
