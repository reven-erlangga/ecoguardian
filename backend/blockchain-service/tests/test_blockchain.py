"""
Unit tests for Blockchain — block creation, hashing, chain validation.
"""

import sys
from pathlib import Path

import pytest

_HERE = Path(__file__).resolve().parent
_PKG = _HERE.parent
if str(_PKG) not in sys.path:
    sys.path.insert(0, str(_PKG))

from chain.blockchain import Blockchain


@pytest.fixture
def chain():
    return Blockchain(difficulty=2)


def test_create_genesis_block(chain):
    genesis = chain.create_genesis()
    assert genesis["index"] == 0
    assert genesis["previous_hash"] == "0" * 64
    assert genesis["data"]["type"] == "genesis"
    assert "hash" in genesis
    assert "nonce" in genesis
    assert genesis["timestamp"] > 0


def test_create_block_has_correct_index(chain):
    genesis = chain.create_genesis()
    block = chain.create_block({"type": "classification", "label": "garbage"}, genesis)
    assert block["index"] == 1
    assert block["previous_hash"] == genesis["hash"]


def test_block_hash_is_hex(chain):
    genesis = chain.create_genesis()
    block = chain.create_block({"type": "test"}, genesis)
    assert isinstance(block["hash"], str)
    assert len(block["hash"]) == 64
    assert all(c in "0123456789abcdef" for c in block["hash"])


def test_different_data_different_hash(chain):
    genesis = chain.create_genesis()
    b1 = chain.create_block({"type": "a"}, genesis)
    b2 = chain.create_block({"type": "b"}, genesis)
    assert b1["hash"] != b2["hash"]


def test_valid_chain_returns_true(chain):
    genesis = chain.create_genesis()
    b1 = chain.create_block({"type": "classification"}, genesis)
    b2 = chain.create_block({"type": "resolution"}, b1)
    valid, err = chain.is_valid_chain([genesis, b1, b2])
    assert valid is True
    assert err == ""


def test_tampered_block_fails_validation(chain):
    genesis = chain.create_genesis()
    b1 = chain.create_block({"type": "classification"}, genesis)
    b2 = chain.create_block({"type": "resolution"}, b1)
    b2["data"]["label"] = "hacked"
    valid, err = chain.is_valid_chain([genesis, b1, b2])
    assert valid is False


def test_broken_link_fails_validation(chain):
    genesis = chain.create_genesis()
    b1 = chain.create_block({"type": "classification"}, genesis)
    b2 = chain.create_block({"type": "resolution"}, genesis)  # wrong parent
    valid, err = chain.is_valid_chain([genesis, b1, b2])
    assert valid is False


def test_genesis_hash_validation(chain):
    """Tampered genesis data fails chain validation (with >=2 blocks)."""
    genesis = chain.create_genesis()
    b1 = chain.create_block({"type": "test"}, genesis)

    # Shallow copy — modify b1 to point back to a tampered genesis
    tampered_genesis = genesis.copy()
    tampered_genesis["data"]["label"] = "Tampered"
    # Re-mine to make it "valid" on its own — but now parent link is broken
    # Actually: shallow copy shares data dict, so genesis is also modified!
    # Create a proper tampered block with deep copy
    import copy
    tampered = copy.deepcopy(genesis)
    tampered["data"]["label"] = "Tampered"
    # We need to re-mine it for the new data
    tampered["hash"] = chain._mine(tampered)
    tampered["previous_hash"] = "0" * 64  # keep genesis previous_hash

    # Chain: tampered (replaces genesis) → b1 (points to original genesis hash)
    # b1's previous_hash points to original genesis hash, not tampered hash
    valid, err = chain.is_valid_chain([tampered, b1])
    assert valid is False, f"Expected invalid but got: {err}"


def test_empty_chain_fails(chain):
    valid, err = chain.is_valid_chain([])
    assert valid is False
    assert "Empty" in err


def test_invalid_genesis_previous_hash_fails(chain):
    genesis = chain.create_genesis()
    genesis["previous_hash"] = "x" * 64
    valid, err = chain.is_valid_chain([genesis])
    assert valid is False


def test_hash_starts_with_zeros(chain):
    genesis = chain.create_genesis()
    assert genesis["hash"].startswith("00")


def test_is_valid_block_accepts_good_block(chain):
    genesis = chain.create_genesis()
    b1 = chain.create_block({"type": "test"}, genesis)
    assert chain.is_valid_block(b1, genesis) is True


def test_is_valid_block_rejects_wrong_index(chain):
    genesis = chain.create_genesis()
    b1 = chain.create_block({"type": "test"}, genesis)
    b1["index"] = 99
    assert chain.is_valid_block(b1, genesis) is False


def test_increasing_difficulty_affects_nonce(chain):
    easy = Blockchain(difficulty=1)
    hard = Blockchain(difficulty=3)
    g_easy = easy.create_genesis()
    g_hard = hard.create_genesis()
    assert g_hard["nonce"] >= g_easy["nonce"]
