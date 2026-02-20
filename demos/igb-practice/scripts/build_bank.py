#!/usr/bin/env python3
import json
import os
import re
import subprocess
import tempfile
import zipfile
from pathlib import Path
from urllib.parse import urlparse

import requests

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
RAW = DATA / "raw"
TXT = DATA / "txt"
OUT = DATA / "question_bank.json"
RESOURCE_URL = "https://www.internationalgeographybee.com/resources"


def safe_name(url: str) -> str:
    p = urlparse(url)
    name = os.path.basename(p.path) or "file"
    return re.sub(r"[^a-zA-Z0-9._-]+", "_", name)


def fetch_links() -> list[str]:
    text = requests.get("https://r.jina.ai/http://www.internationalgeographybee.com/resources", timeout=60).text
    links = sorted(
        {
            m.group(0).rstrip(".,;")
            for m in re.finditer(r"https?://[^\s)\]]+", text)
            if "wp-content/uploads" in m.group(0).lower() and m.group(0).lower().endswith((".pdf", ".docx"))
        }
    )
    return links


def download(url: str, out: Path) -> bool:
    try:
        r = requests.get(url, timeout=90)
        if r.status_code != 200 or len(r.content) < 200:
            return False
        out.write_bytes(r.content)
        return True
    except Exception:
        return False


def extract_pdf(src: Path, dst: Path) -> bool:
    try:
        subprocess.run(["pdftotext", "-layout", str(src), str(dst)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return dst.exists() and dst.stat().st_size > 0
    except Exception:
        return False


def extract_docx(src: Path, dst: Path) -> bool:
    try:
        with zipfile.ZipFile(src) as zf:
            xml = zf.read("word/document.xml").decode("utf-8", errors="ignore")
        xml = re.sub(r"</w:p>", "\n", xml)
        xml = re.sub(r"<[^>]+>", "", xml)
        xml = re.sub(r"\s+", " ", xml)
        xml = xml.replace("\u00a0", " ")
        # recover some line structure
        xml = re.sub(r"(\d{1,3}[.)])\s+", r"\n\1 ", xml)
        dst.write_text(xml.strip() + "\n", encoding="utf-8")
        return True
    except Exception:
        return False


def normalize_text(t: str) -> str:
    t = t.replace("\r", "\n")
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t


def parse_numbered_blocks(text: str):
    compact = text.replace("\u00a0", " ")
    compact = re.sub(r"\n+", "\n", compact)
    pattern = re.compile(r"(?ms)(?:^|\n)\s*(\d{1,3})[.)]\s+(.*?)(?=(?:\n\s*\d{1,3}[.)]\s)|\Z)")
    out = []
    for m in pattern.finditer(compact):
        qno = int(m.group(1))
        body = re.sub(r"\s+", " ", m.group(2)).strip(" -\t\n")
        if len(body) < 12:
            continue
        out.append((qno, body))
    return out


def parse_question_marks(text: str):
    lines = [re.sub(r"\s+", " ", x).strip() for x in text.splitlines()]
    out = []
    c = 0
    for line in lines:
        if "?" in line and len(line) > 20:
            c += 1
            out.append((c, line))
    return out


def infer_meta(name: str):
    y = re.search(r"(20\d{2})", name)
    year = y.group(1) if y else "unknown"
    lower = name.lower()
    round_name = "unknown"
    for key in ["round-1", "round-2", "round-3", "round-4", "round-5", "round-6", "round-7", "round-8", "quarterfinal", "semifinal", "final", "octofinal", "playoff", "orqe", "extra", "backup"]:
        if key in lower:
            round_name = key
            break
    level = "mixed"
    if any(x in lower for x in ["elementary", "es-"]):
        level = "elementary"
    elif any(x in lower for x in ["middle", "ms-"]):
        level = "middle"
    elif any(x in lower for x in ["varsity", "high-school", "junior"]):
        level = "high"
    return year, round_name, level


def main():
    DATA.mkdir(parents=True, exist_ok=True)
    RAW.mkdir(parents=True, exist_ok=True)
    TXT.mkdir(parents=True, exist_ok=True)

    links = fetch_links()
    fetched = []
    url_map = {}
    for url in links:
        name = safe_name(url)
        target = RAW / name
        if not target.exists() or target.stat().st_size < 200:
            ok = download(url, target)
            if not ok:
                continue
        fetched.append(target)
        url_map[target.name] = url

    questions = []
    source_count = 0

    for f in fetched:
        source_count += 1
        txt_path = TXT / (f.stem + ".txt")
        if not txt_path.exists():
            if f.suffix.lower() == ".pdf":
                extract_pdf(f, txt_path)
            elif f.suffix.lower() == ".docx":
                extract_docx(f, txt_path)

        if not txt_path.exists() or txt_path.stat().st_size < 20:
            continue

        text = normalize_text(txt_path.read_text(encoding="utf-8", errors="ignore"))
        blocks = parse_numbered_blocks(text)
        if len(blocks) < 5:
            blocks = parse_question_marks(text)

        year, rnd, level = infer_meta(f.name)
        for qno, body in blocks:
            questions.append(
                {
                    "id": f"{f.stem}-{qno}",
                    "source_file": f.name,
                    "source_url": url_map.get(f.name, ""),
                    "year": year,
                    "round": rnd,
                    "level": level,
                    "question_no": qno,
                    "question": body,
                    "answer": "",
                }
            )

    # dedupe by normalized question text
    seen = set()
    deduped = []
    for q in questions:
        key = re.sub(r"\W+", "", q["question"].lower())[:220]
        if len(key) < 20 or key in seen:
            continue
        seen.add(key)
        deduped.append(q)

    payload = {
        "generated_at": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        "source": RESOURCE_URL,
        "total_sources": source_count,
        "total_questions": len(deduped),
        "notes": "Questions are extracted from publicly listed IGB resource files. Some records may not contain answer keys.",
        "questions": deduped,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    print(f"sources={source_count} questions={len(deduped)} -> {OUT}")


if __name__ == "__main__":
    main()
