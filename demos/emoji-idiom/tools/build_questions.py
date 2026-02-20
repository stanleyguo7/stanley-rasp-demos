#!/usr/bin/env python3
import json
from datetime import datetime, timezone
from emoji_chengyu.puzzle import gen_puzzle

MAX_Q = 1200
seen = set()
questions = []
for p in gen_puzzle():
    emoji = p.puzzle_str
    idiom = p.chengyu_item.word
    if len(idiom) < 4:
        continue
    key = (emoji, idiom)
    if key in seen:
        continue
    seen.add(key)
    questions.append({
        "emoji": emoji,
        "answer": idiom,
        "maskNum": p.mask_num,
    })
    if len(questions) >= MAX_Q:
        break

payload = {
    "meta": {
        "count": len(questions),
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": [
            "emoji-chengyu (PyPI)",
            "https://github.com/alingse/emoji-chengyu"
        ]
    },
    "questions": questions
}

with open('demos/emoji-idiom/assets/questions.json', 'w', encoding='utf-8') as f:
    json.dump(payload, f, ensure_ascii=False)

print('generated', len(questions))
