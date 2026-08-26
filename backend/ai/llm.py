"""LLM provider integration with token-level streaming.

OpenRouter (and the other configured providers) expose an OpenAI-compatible
chat-completions API, so a single ``AsyncOpenAI`` client covers all of them.
"""

import logging

from django.conf import settings
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

OPENROUTER_DEFAULT_BASE_URL = "https://openrouter.ai/api/v1"
OPENROUTER_DEFAULT_MODEL = "openai/gpt-4o-mini"

SYSTEM_PROMPT = (
    "You are Texon AI, the built-in assistant of the Texon RMG ERP system "
    "(a ready-made garments factory platform). You help staff with orders, "
    "buyers, merchandising, production, inventory, procurement, HR, quality, "
    "accounts and compliance questions. Be concise, accurate and practical. "
    "When asked about specific data you do not have access to, say so and "
    "suggest where in the ERP the user can find it."
)

# Context window sent to the model (in messages) to keep latency/cost sane.
MAX_HISTORY_MESSAGES = 24


def get_provider_config():
    """Return ``(client_config_dict, model_name)`` for the active provider."""
    provider = settings.AI_LLM_PROVIDER
    try:
        cfg = dict(settings.AI_LLM_CONFIG[provider])
    except KeyError as exc:
        raise RuntimeError(f"Unknown AI_LLM_PROVIDER '{provider}'") from exc

    if provider == "openrouter":
        cfg.setdefault("base_url", OPENROUTER_DEFAULT_BASE_URL)
        cfg.setdefault("model", OPENROUTER_DEFAULT_MODEL)
        cfg["default_headers"] = {
            "HTTP-Referer": "https://texon.app",
            "X-Title": "Texon RMG ERP",
        }
    return cfg


def build_client(cfg):
    kwargs = {"base_url": cfg["base_url"], "api_key": cfg["api_key"]}
    if cfg.get("default_headers"):
        kwargs["default_headers"] = cfg["default_headers"]
    return AsyncOpenAI(**kwargs)


async def stream_completion(history):
    """Yield assistant text chunks for ``history``.

    ``history`` is a list of {"role", "content"} dicts (no system entry —
    the system prompt is injected here). Raises on upstream failure so the
    caller can surface an error frame to the client.
    """
    cfg = get_provider_config()
    if not cfg.get("api_key"):
        raise RuntimeError(
            "AI provider API key is not configured "
            f"(provider={settings.AI_LLM_PROVIDER})."
        )

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += history[-MAX_HISTORY_MESSAGES:]

    client = build_client(cfg)
    stream = await client.chat.completions.create(
        model=cfg["model"],
        messages=messages,
        temperature=cfg.get("temperature", 0.2),
        max_tokens=cfg.get("max_tokens", 2048),
        stream=True,
    )
    async for event in stream:
        if event.choices:
            delta = event.choices[0].delta
            content = getattr(delta, "content", None)
            if content:
                yield content


def title_from_message(text):
    """Derive a short conversation title from the first user message."""
    text = " ".join((text or "").split())
    return (text[:60] + "…") if len(text) > 60 else (text or "New chat")
