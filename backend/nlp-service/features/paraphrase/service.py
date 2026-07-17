"""
Template-based paraphrase generator.

Generates a safe, anonymised report text that does not reveal the
original tweet content. Uses label and extracted address to fill
a template.
"""

# ponytail: simplest possible — template-based, always works
TEMPLATES = {
    "fallen_tree": "Pengguna melaporkan adanya pohon tumbang di {lokasi}.",
    "garbage": "Laporan mengenai tumpukan sampah di area {lokasi}.",
    "vandalism": "Terjadi aksi vandalisme di sekitar {lokasi}.",
}

DEFAULT_TEMPLATE = "Laporan baru dari pengguna di area {lokasi}."


def paraphrase(text: str, label: str, address: str) -> str:
    """Generate paraphrased text for the given label and address.

    Args:
        text: Original tweet text (NOT included in output).
        label: One of fallen_tree, garbage, vandalism.
        address: Extracted address (may be empty).

    Returns:
        A safe report string that does not reveal original content.
    """
    lokasi = address if address else "lokasi yang tidak disebutkan"
    template = TEMPLATES.get(label, DEFAULT_TEMPLATE)
    return template.format(lokasi=lokasi)
