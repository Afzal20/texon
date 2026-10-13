from pathlib import Path

from django.core.exceptions import ImproperlyConfigured
from django.test import SimpleTestCase

from config.database import database_config


class DatabaseConfigurationTests(SimpleTestCase):
    def config(self, url="", debug=True):
        return database_config(url=url, base_dir=Path("/tmp/texon-config-test"), debug=debug)

    def test_sqlite_fallback_is_development_only(self):
        self.assertEqual(self.config()["ENGINE"], "django.db.backends.sqlite3")
        with self.assertRaisesMessage(ImproperlyConfigured, "DATABASE_URL is required"):
            self.config(debug=False)

    def test_postgres_credentials_and_ssl_options_are_preserved(self):
        result = self.config("postgresql://texon:p%40ss@db.example:5433/erp?sslmode=require", debug=False)
        self.assertEqual(result["ENGINE"], "django.db.backends.postgresql")
        self.assertEqual(result["PASSWORD"], "p@ss")
        self.assertEqual(result["NAME"], "erp")
        self.assertEqual(result["HOST"], "db.example")
        self.assertEqual(str(result["PORT"]), "5433")
        self.assertEqual(result["OPTIONS"]["sslmode"], "require")
        self.assertEqual(result["OPTIONS"]["connect_timeout"], 5)
        self.assertEqual(result["CONN_MAX_AGE"], 0)

    def test_postgres_alias_and_explicit_connection_timeout(self):
        result = self.config("postgres://texon@localhost/erp?connect_timeout=9")
        self.assertEqual(result["OPTIONS"]["connect_timeout"], 9)

    def test_unsupported_or_malformed_urls_fail_without_credentials_in_message(self):
        for url in (
            "mysql://texon:private-value@localhost/erp",
            "sqlite:///tmp/test.db",
            "postgres://texon:private-value@localhost:not-a-port/erp",
            "postgres://texon:private-value@localhost/",
            "not-a-url",
        ):
            with self.subTest(url=url):
                with self.assertRaises(ImproperlyConfigured) as caught:
                    self.config(url)
                self.assertNotIn("private-value", str(caught.exception))
                self.assertNotIn(url, str(caught.exception))

    def test_url_cannot_enable_persistent_connections_under_asgi(self):
        result = self.config("postgres://texon@localhost/erp?conn_max_age=600")
        self.assertEqual(result["CONN_MAX_AGE"], 0)
