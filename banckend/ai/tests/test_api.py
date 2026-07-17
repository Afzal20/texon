#!/usr/bin/env python3
"""
AI Chat API Test Script
=======================

A simple test script using the ``requests`` module to hit the AI chat
endpoint and verify that inputs are validated, authentication is enforced,
and the assistant responds correctly.

Usage
-----
1. Start the Django dev server:
       cd /home/dev-dir/texon/banckend
       .venv/bin/python manage.py runserver 0.0.0.0:8000

2. Run this script (from anywhere):
       .venv/bin/python ai/tests/test_api.py

   Or override the base URL:
       BASE_URL=http://127.0.0.1:9000 .venv/bin/python ai/tests/test_api.py

Environment
-----------
- The script obtains a JWT token by logging in with test credentials.
- Adjust ``TEST_EMAIL`` and ``TEST_PASSWORD`` below to match a real user
  in your local database.
"""

from __future__ import annotations

import json
import os
import sys
import time

import requests

# ── Configuration ─────────────────────────────────────────────────
BASE_URL = os.environ.get('BASE_URL', 'http://127.0.0.1:8000')
LOGIN_URL = f'{BASE_URL}/api/users/api/token/'

AI_CHAT_URL = f'{BASE_URL}/api/ai/chat/'

# Change these to match a valid user in your local database.
TEST_EMAIL =  "afzalhossen2019@gmail.com" #os.environ.get('TEST_EMAIL', 'admin@texon.com')
TEST_PASSWORD = "1234" # os.environ.get('TEST_PASSWORD', '1234')

# ── Colours ───────────────────────────────────────────────────────
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
CYAN = '\033[96m'
RESET = '\033[0m'
BOLD = '\033[1m'

passed = 0
failed = 0
skipped = 0


def header(title: str) -> None:
    print(f'\n{BOLD}{CYAN}{"─" * 60}')
    print(f'  {title}')
    print(f'{"─" * 60}{RESET}')


def result(name: str, ok: bool, detail: str = '') -> None:
    global passed, failed
    icon = f'{GREEN}✔ PASS{RESET}' if ok else f'{RED}✘ FAIL{RESET}'
    print(f'  {icon}  {name}')
    if detail:
        print(f'         {detail}')
    if ok:
        passed += 1
    else:
        failed += 1


def skip(name: str, reason: str) -> None:
    global skipped
    print(f'  {YELLOW}⊘ SKIP{RESET}  {name}  ({reason})')
    skipped += 1


# ── 1. Obtain JWT Token ──────────────────────────────────────────
header('1 · Authenticate')

token: str | None = None
try:
    resp = requests.post(LOGIN_URL, json={'email': TEST_EMAIL, 'password': TEST_PASSWORD}, timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        token = data.get('access') or data.get('token') or data.get('tokens', {}).get('access')
        result('Login succeeds', bool(token), f'Token prefix: {token[:20]}…' if token else 'No token in response')
    else:
        result('Login succeeds', False, f'HTTP {resp.status_code}: {resp.text[:200]}')
except requests.ConnectionError:
    result('Login succeeds', False, f'Cannot connect to {LOGIN_URL} — is the server running?')
    print(f'\n{RED}Server unreachable. Start it with: .venv/bin/python manage.py runserver{RESET}\n')
    sys.exit(1)

auth = {'Authorization': f'Bearer {token}'} if token else {}

# ── 2. Unauthenticated Request ────────────────────────────────────
header('2 · Authentication Required')

resp = requests.post(AI_CHAT_URL, json={'message': 'hello'}, timeout=10)
result(
    'Reject unauthenticated request',
    resp.status_code == 401,
    f'HTTP {resp.status_code}',
)

# ── 3. Empty Message ──────────────────────────────────────────────
header('3 · Input Validation — Empty Message')

if token:
    resp = requests.post(AI_CHAT_URL, json={'message': ''}, headers=auth, timeout=10)
    result(
        'Reject empty message',
        resp.status_code == 400,
        f'HTTP {resp.status_code}: {resp.text[:200]}',
    )
else:
    skip('Reject empty message', 'no token')

# ── 4. Oversized Message ─────────────────────────────────────────
header('4 · Input Validation — Oversized Message')

if token:
    huge_message = 'A' * 5000  # exceeds MAX_MESSAGE_LENGTH of 4000
    resp = requests.post(AI_CHAT_URL, json={'message': huge_message}, headers=auth, timeout=10)
    result(
        'Reject oversized message (5000 chars)',
        resp.status_code == 400,
        f'HTTP {resp.status_code}: {resp.text[:200]}',
    )
else:
    skip('Reject oversized message', 'no token')

# ── 5. Invalid History ────────────────────────────────────────────
header('5 · Input Validation — Invalid History')

if token:
    bad_history = [{'role': '', 'content': 'missing role'}]
    resp = requests.post(
        AI_CHAT_URL,
        json={'message': 'Hello', 'history': bad_history},
        headers=auth,
        timeout=10,
    )
    result(
        'Reject history with empty role',
        resp.status_code == 400,
        f'HTTP {resp.status_code}: {resp.text[:200]}',
    )
else:
    skip('Reject invalid history', 'no token')

# ── 6. Invalid History Role ───────────────────────────────────────
header('6 · Input Validation — Disallowed Role')

if token:
    bad_role_history = [{'role': 'hacker', 'content': 'inject me'}]
    resp = requests.post(
        AI_CHAT_URL,
        json={'message': 'Hello', 'history': bad_role_history},
        headers=auth,
        timeout=10,
    )
    result(
        'Reject history with disallowed role "hacker"',
        resp.status_code == 400,
        f'HTTP {resp.status_code}: {resp.text[:200]}',
    )
else:
    skip('Reject disallowed role', 'no token')

# ── 7. Valid Chat Request ─────────────────────────────────────────
header('7 · Valid Chat Request')

if token:
    resp = requests.post(
        AI_CHAT_URL,
        json={'message': 'Hello, what can you help me with?', 'title': 'Test conversation'},
        headers=auth,
        timeout=180,  # LM Studio may be slow
    )
    if resp.status_code == 200:
        data = resp.json()
        has_conversation_id = 'conversation_id' in data
        has_content = 'content' in data and isinstance(data['content'], str)
        has_tool_calls = 'tool_calls' in data and isinstance(data['tool_calls'], list)
        has_metadata = 'metadata' in data and isinstance(data['metadata'], dict)

        result('Response has conversation_id', has_conversation_id, str(data.get('conversation_id')))
        result('Response has content', has_content, f'{data.get("content", "")[:80]}…')
        result('Response has tool_calls list', has_tool_calls)
        result('Response has metadata dict', has_metadata, str(data.get('metadata')))

        # Save conversation_id for test 8.
        conversation_id = data.get('conversation_id')
    elif resp.status_code == 503:
        skip('Valid chat request', f'AI service unavailable (HTTP 503) — is LM Studio running?')
        conversation_id = None
    else:
        result('Valid chat request succeeds', False, f'HTTP {resp.status_code}: {resp.text[:200]}')
        conversation_id = None
else:
    skip('Valid chat request', 'no token')
    conversation_id = None

# ── 8. Continue Existing Conversation ─────────────────────────────
header('8 · Continue Existing Conversation')

if token and conversation_id:
    resp = requests.post(
        AI_CHAT_URL,
        json={
            'message': 'What tools do you have?',
            'conversation_id': conversation_id,
        },
        headers=auth,
        timeout=180,
    )
    if resp.status_code == 200:
        data = resp.json()
        same_conversation = data.get('conversation_id') == conversation_id
        result(
            'Continues same conversation',
            same_conversation,
            f'Expected {conversation_id}, got {data.get("conversation_id")}',
        )
    elif resp.status_code == 503:
        skip('Continue conversation', 'AI service unavailable')
    else:
        result('Continue conversation', False, f'HTTP {resp.status_code}: {resp.text[:200]}')
else:
    skip('Continue conversation', 'no conversation_id from previous test')

# ── 9. Access Another User's Conversation ─────────────────────────
header('9 · Cross-User Conversation Access')

if token:
    # Try an unlikely conversation_id — should 403 or create a new one.
    resp = requests.post(
        AI_CHAT_URL,
        json={'message': 'test', 'conversation_id': 999999},
        headers=auth,
        timeout=30,
    )
    # If conversation doesn't exist, it creates a new one (not 403).
    # A 403 only happens if the conversation exists but belongs to someone else.
    result(
        'Handles non-existent conversation_id gracefully',
        resp.status_code in (200, 503),
        f'HTTP {resp.status_code}',
    )
else:
    skip('Cross-user access', 'no token')

# ── Summary ───────────────────────────────────────────────────────
header('Summary')
total = passed + failed + skipped
print(f'  {GREEN}{passed} passed{RESET}, {RED}{failed} failed{RESET}, {YELLOW}{skipped} skipped{RESET} ({total} total)')
print()

sys.exit(1 if failed > 0 else 0)
