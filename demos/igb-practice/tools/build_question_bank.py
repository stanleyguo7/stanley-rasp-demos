#!/usr/bin/env python3
import json
import re
import zipfile
from pathlib import Path
from urllib.parse import urlparse, unquote
import subprocess
import requests
from requests.utils import requote_uri

BASE = Path(__file__).resolve().parents[1]
RAW = BASE / "data" / "raw"
TEXT = BASE / "data" / "text"
ASSETS = BASE / "assets"
RAW.mkdir(parents=True, exist_ok=True)
TEXT.mkdir(parents=True, exist_ok=True)
ASSETS.mkdir(parents=True, exist_ok=True)

RESOURCES_URL = "https://r.jina.ai/http://www.internationalgeographybee.com/resources"


def slug_from_url(url: str) -> str:
    name = unquote(Path(urlparse(url).path).name)
    return re.sub(r"[^A-Za-z0-9._-]+", "_", name)


def fetch_links() -> list[str]:
    text = requests.get(RESOURCES_URL, timeout=60).text
    links = sorted(set(re.findall(r"https?://[^\s)\]]+", text)))
    clean = []
    for u in links:
        u = u.rstrip('.,;')
        if "/wp-content/uploads/" not in u:
            continue
        lu = u.lower()
        if lu.endswith('.pdf') or lu.endswith('.docx'):
            clean.append(u)
    return sorted(set(clean))


def download(url: str, path: Path):
    if path.exists() and path.stat().st_size > 0:
        return
    safe_url = requote_uri(url)
    last_err = None
    for _ in range(3):
        try:
            r = requests.get(safe_url, timeout=90, headers={"User-Agent": "Mozilla/5.0"})
            r.raise_for_status()
            path.write_bytes(r.content)
            return
        except Exception as e:
            last_err = e
    raise last_err


def pdf_to_text(src: Path, out: Path):
    if out.exists() and out.stat().st_size > 0:
        return
    subprocess.run(["pdftotext", "-layout", str(src), str(out)], check=False)
    if not out.exists():
        out.write_text("", encoding="utf-8")


def docx_to_text(src: Path, out: Path):
    if out.exists() and out.stat().st_size > 0:
        return
    txt = ""
    try:
        with zipfile.ZipFile(src, 'r') as zf:
            xml = zf.read('word/document.xml').decode('utf-8', errors='ignore')
        xml = re.sub(r"</w:p>", "\n", xml)
        xml = re.sub(r"<[^>]+>", "", xml)
        txt = re.sub(r"\n{2,}", "\n", xml)
    except Exception:
        txt = ""
    out.write_text(txt, encoding="utf-8")


def detect_year(name: str) -> str:
    m = re.search(r"(20\d{2})(?:[-_](20\d{2}))?", name)
    if m:
        return m.group(0).replace('_', '-')
    m = re.search(r"(\d{2})[-_](\d{2})", name)
    if m:
        return f"20{m.group(1)}-20{m.group(2)}"
    return "unknown"


def detect_round(name: str) -> str:
    checks = [
        (r"octofinal", "Octofinal"),
        (r"quarterfinal", "Quarterfinal"),
        (r"semi", "Semifinal"),
        (r"final", "Final"),
        (r"playoff", "Playoff"),
        (r"orqe", "ORQE"),
        (r"region", "Regional"),
        (r"national", "National"),
        (r"round[-_ .]*(\d+)", None),
        (r"rd[-_ .]*(\d+)", None),
    ]
    n = name.lower()
    for pat, label in checks:
        m = re.search(pat, n)
        if m:
            if label:
                return label
            return f"Round {m.group(1)}"
    return "General"


def parse_questions(text: str) -> list[dict]:
    lines = [re.sub(r"\s+", " ", l).strip() for l in text.splitlines()]
    lines = [l for l in lines if l]
    qlist = []
    i = 0
    while i < len(lines):
        line = lines[i]
        # likely question start
        is_start = bool(re.match(r"^(\d+|[Qq]\d+|[0-9]+\.|[0-9]+\))\s+", line)) or line.endswith('?')
        if not is_start:
            i += 1
            continue

        q = re.sub(r"^(\d+|[Qq]\d+|[0-9]+\.|[0-9]+\))\s+", "", line)
        opts = []
        j = i + 1
        while j < len(lines):
            l2 = lines[j]
            if re.match(r"^(\d+|[Qq]\d+|[0-9]+\.|[0-9]+\))\s+", l2) and (l2.endswith('?') or len(opts) > 0):
                break
            om = re.match(r"^([A-D])[\).:\-]\s*(.+)$", l2)
            if om:
                opts.append({"label": om.group(1), "text": om.group(2)})
            elif len(opts) == 0 and len(l2) < 180 and not l2.endswith(':') and not l2.lower().startswith('answer'):
                # possible continuation line for question
                if not q.endswith('?') and len(q) < 240:
                    q += ' ' + l2
                else:
                    break
            else:
                break
            j += 1

        if len(q) >= 12:
            qlist.append({"question": q, "options": opts, "answer": None})
        i = max(i + 1, j)

    # dedupe by normalized question text
    seen = set()
    out = []
    for it in qlist:
        k = re.sub(r"[^a-z0-9]+", "", it['question'].lower())
        if len(k) < 12 or k in seen:
            continue
        seen.add(k)
        out.append(it)
    return out


def main():
    links = fetch_links()
    questions = []
    files_meta = []

    for url in links:
        name = slug_from_url(url)
        raw_path = RAW / name
        txt_path = TEXT / (name.rsplit('.', 1)[0] + '.txt')
        try:
            download(url, raw_path)
        except Exception:
            continue

        if name.lower().endswith('.pdf'):
            pdf_to_text(raw_path, txt_path)
        else:
            docx_to_text(raw_path, txt_path)

        text = ""
        try:
            text = txt_path.read_text(encoding='utf-8', errors='ignore')
        except Exception:
            pass

        qs = parse_questions(text)
        year = detect_year(name)
        rnd = detect_round(name)

        for q in qs:
            q.update({
                "sourceFile": name,
                "sourceUrl": url,
                "year": year,
                "round": rnd,
            })
        questions.extend(qs)
        files_meta.append({
            "file": name,
            "url": url,
            "year": year,
            "round": rnd,
            "questionCount": len(qs),
        })

    # global dedupe
    ded = {}
    for q in questions:
        key = re.sub(r"[^a-z0-9]+", "", q['question'].lower())
        if key not in ded:
            ded[key] = q
    questions = list(ded.values())

    payload = {
        "meta": {
            "source": "International Geography Bee resources page",
            "resourcePage": "https://www.internationalgeographybee.com/resources",
            "fileCount": len(files_meta),
            "questionCount": len(questions),
        },
        "files": files_meta,
        "questions": questions,
    }
    (ASSETS / "questions.json").write_text(json.dumps(payload, ensure_ascii=False), encoding='utf-8')
    print(json.dumps(payload['meta'], ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
