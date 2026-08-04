"""
Vault client helper — membaca secret dari HashiCorp Vault (kv-v2).

Chain priority (highest → lowest):
  1. Environment variable (K8s Vault Agent inject)
  2. Vault API (dev/staging)
  3. Default fallback (local dev tanpa Vault)
"""

import os

VAULT_ADDR = os.getenv("VAULT_ADDR", "http://vault:8200")
VAULT_TOKEN = os.getenv("VAULT_TOKEN", "")


def read_secret(path: str, key: str) -> str | None:
    """Read a single key from Vault kv-v2 engine at `secret/data/{path}`.

    Returns None if Vault is unreachable, unconfigured, or the key doesn't exist.
    """
    if not VAULT_TOKEN:
        return None

    try:
        from hvac import Client

        client = Client(url=VAULT_ADDR, token=VAULT_TOKEN)
        secret = client.secrets.kv.v2.read_secret_version(
            path=path, mount_point="secret"
        )
        return secret["data"]["data"].get(key)
    except Exception:
        return None
