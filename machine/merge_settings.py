import json, os, sys
pub_path, priv_path, out_path, home = sys.argv[1:]

def load(path):
    with open(path, encoding="utf-8") as f:
        return json.loads(f.read().replace("__HOME__", home))

def merge(base, extra):
    for k, v in extra.items():
        if isinstance(v, dict) and isinstance(base.get(k), dict):
            merge(base[k], v)
        elif isinstance(v, list) and isinstance(base.get(k), list):
            base[k] += [x for x in v if x not in base[k]]
        else:
            base[k] = v
    return base

settings = load(pub_path)
if os.path.exists(priv_path):
    merge(settings, load(priv_path))
    print("  비공개 오버레이 병합됨")
else:
    print("  비공개 오버레이 없음 — 공개 템플릿만 사용")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(settings, f, indent=2, ensure_ascii=False)
