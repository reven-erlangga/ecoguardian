import os

VAULT_ADDR = os.getenv("VAULT_ADDR", "http://vault:8200")
VAULT_TOKEN = os.getenv("VAULT_TOKEN", "")

def read_secret(path: str, key: str) -> str | None:
    if not VAULT_TOKEN:
        return None
    try:
        from hvac import Client
        client = Client(url=VAULT_ADDR, token=VAULT_TOKEN)
        secret = client.secrets.kv.v2.read_secret_version(path=path, mount_point="secret")
        return secret["data"]["data"].get(key)
    except Exception:
        return None
