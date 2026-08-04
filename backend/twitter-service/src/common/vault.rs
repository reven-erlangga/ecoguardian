// Vault client — read/write secret from HashiCorp Vault kv-v2.
// Chain: env var → Vault → default.

use std::env;

/// Read a single key from Vault kv-v2 at `secret/{path}`.
pub fn read_secret(path: &str, key: &str) -> Option<String> {
    let token = env::var("VAULT_TOKEN").ok()?;
    let addr = env::var("VAULT_ADDR").unwrap_or_else(|_| "http://vault:8200".to_string());
    let url = format!("{}/v1/secret/data/{}", addr, path);

    let client = reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(3))
        .build()
        .ok()?;

    let resp = client
        .get(&url)
        .header("X-Vault-Token", token)
        .send()
        .ok()?;

    let body: serde_json::Value = resp.json().ok()?;
    body["data"]["data"][key].as_str().map(|s| s.to_string())
}

/// Write a key-value pair to Vault kv-v2 at `secret/{path}`.
/// Returns true if successful.
pub fn write_secret(path: &str, key: &str, value: &str) -> bool {
    let token = match env::var("VAULT_TOKEN").ok() {
        Some(t) => t,
        None => return false,
    };
    let addr = env::var("VAULT_ADDR").unwrap_or_else(|_| "http://vault:8200".to_string());
    let url = format!("{}/v1/secret/data/{}", addr, path);

    let body = serde_json::json!({
        "data": { key: value }
    });

    let client = reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(3))
        .build()
        .ok()
        .expect("Failed to build HTTP client");

    let resp = client
        .post(&url)
        .header("X-Vault-Token", token)
        .json(&body)
        .send();

    match resp {
        Ok(r) => r.status().is_success(),
        Err(_) => false,
    }
}
