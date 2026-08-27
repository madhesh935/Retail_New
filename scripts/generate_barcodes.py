#!/usr/bin/env python3
"""Generate printable demo barcodes into ./barcodes from catalog.json."""

from __future__ import annotations

import json
import shutil
from pathlib import Path

import barcode
from barcode.writer import ImageWriter
import qrcode

ROOT = Path(__file__).resolve().parents[1]
BARCODE_DIR = ROOT / "barcodes"
PUBLIC_DIR = ROOT / "public" / "barcodes"
CATALOG_PATH = BARCODE_DIR / "catalog.json"


def write_ean13(code: str, filename: str) -> None:
    ean = barcode.get("ean13", code, writer=ImageWriter())
    target = BARCODE_DIR / filename.replace(".png", "")
    ean.save(str(target), options={"write_text": True, "font_size": 10, "text_distance": 4})
    generated = BARCODE_DIR / f"{filename}"
    # python-barcode saves as .png when extension omitted in some versions
    if not generated.exists():
        alt = BARCODE_DIR / f"{filename.replace('.png', '')}.png"
        if alt.exists():
            alt.rename(generated)


def write_code128(code: str, filename: str) -> None:
    code128 = barcode.get("code128", code, writer=ImageWriter())
    target = BARCODE_DIR / filename.replace(".png", "")
    code128.save(str(target), options={"write_text": True, "font_size": 10, "text_distance": 4})
    generated = BARCODE_DIR / filename
    if not generated.exists():
        alt = BARCODE_DIR / f"{filename.replace('.png', '')}.png"
        if alt.exists():
            alt.rename(generated)


def write_qr(code: str, filename: str) -> None:
    img = qrcode.make(code)
    img.save(BARCODE_DIR / filename)


def main() -> None:
    BARCODE_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))

    for product in catalog["products"]:
        write_ean13(product["barcode"], product["filename"])
        print(f"EAN-13  {product['barcode']} -> {product['filename']} ({product['name']})")

    for batch in catalog["batches"]:
        write_code128(batch["barcode"], batch["filename"])
        print(f"Code128 {batch['barcode']} -> {batch['filename']} ({batch['name']})")

    for shelf in catalog["shelves"]:
        write_qr(shelf["barcode"], shelf["filename"])
        print(f"QR      {shelf['barcode']} -> {shelf['filename']} ({shelf['shelfCode']})")

    (ROOT / "src" / "staff-pwa" / "data").mkdir(parents=True, exist_ok=True)
    shutil.copy2(CATALOG_PATH, PUBLIC_DIR / "catalog.json")
    shutil.copy2(CATALOG_PATH, ROOT / "src" / "staff-pwa" / "data" / "demoBarcodeCatalog.json")
    for png in BARCODE_DIR.glob("*.png"):
        shutil.copy2(png, PUBLIC_DIR / png.name)

    readme = BARCODE_DIR / "README.md"
    readme.write_text(
        """# Demo product barcodes

Print these barcodes for staff scanner demos. Scan with the **Staff PWA → Scan** tab (camera or manual entry).

## Product barcodes (EAN-13)

| Product | Barcode | SKU |
|---------|---------|-----|
"""
        + "\n".join(
            f"| {p['name']} | `{p['barcode']}` | `{p['sku']}` |"
            for p in catalog["products"]
        )
        + """

## Batch barcodes (Code128)

| Batch | Code |
|-------|------|
"""
        + "\n".join(f"| {b['name']} | `{b['barcode']}` |" for b in catalog["batches"] if not b.get("wasteDemo"))
        + """

## Waste demo barcodes (Code128 — scan then tap Record Waste)

| Product | Batch code | Reason |
|---------|------------|--------|
"""
        + "\n".join(
            f"| {b['name']} | `{b['barcode']}` | {b.get('wasteReason', 'EXPIRED')} |"
            for b in catalog["batches"]
            if b.get("wasteDemo")
        )
        + """

## Shelf QR

| Shelf | QR payload |
|-------|------------|
"""
        + "\n".join(f"| {s['shelfCode']} | `{s['barcode']}` |" for s in catalog["shelves"])
        + """

Copies are also served at `/barcodes/` when the dev server runs.
""",
        encoding="utf-8",
    )

    print(f"\nDone. {len(list(BARCODE_DIR.glob('*.png')))} images in {BARCODE_DIR}")


if __name__ == "__main__":
    main()
