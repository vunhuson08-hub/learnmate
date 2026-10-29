"""Gộp LearnMate (ES modules) thành một tệp HTML tự chứa, script thường (không type=module)."""
import re, os, sys, json

ROOT = sys.argv[1]
OUT = sys.argv[2]

IMPORT_RE = re.compile(r'^import\s+(.+?)\s+from\s+"(.+?)";\s*$', re.M)
EXPORT_DECL_RE = re.compile(r'^export\s+(async\s+function|function|const|let|class)\s+([A-Za-z_$][\w$]*)', re.M)

modules = {}

def resolve(base, spec):
    return os.path.normpath(os.path.join(os.path.dirname(base), spec))

def load(path):
    if path in modules:
        return
    src = open(os.path.join(ROOT, path), encoding="utf-8").read()
    deps = []
    def repl(m):
        clause, spec = m.group(1), m.group(2)
        dep = resolve(path, spec)
        deps.append(dep)
        key = json.dumps(dep)
        clause = clause.strip()
        if clause.startswith("* as "):
            return f"const {clause[5:].strip()} = __mods[{key}];"
        if clause.startswith("{"):
            parts = [p.strip() for p in clause.strip("{} ").split(",") if p.strip()]
            mapped = []
            for p in parts:
                if " as " in p:
                    a, b = [x.strip() for x in p.split(" as ")]
                    mapped.append(f"{a}: {b}")
                else:
                    mapped.append(p)
            return f"const {{ {', '.join(mapped)} }} = __mods[{key}];"
        raise SystemExit(f"Unsupported import in {path}: {m.group(0)}")
    src = IMPORT_RE.sub(repl, src)
    names = EXPORT_DECL_RE.findall(src)
    src = EXPORT_DECL_RE.sub(lambda m: f"{m.group(1)} {m.group(2)}", src)
    if re.search(r'^\s*export\s', src, re.M):
        raise SystemExit(f"Unhandled export in {path}")
    modules[path] = {"src": src, "deps": deps, "exports": [n for _, n in names]}
    for d in deps:
        load(d)

load("js/app.js")

order, seen = [], set()
def visit(p, stack=()):
    if p in seen: return
    if p in stack: raise SystemExit("cycle " + p)
    for d in modules[p]["deps"]:
        visit(d, stack + (p,))
    seen.add(p); order.append(p)
visit("js/app.js")

js = ["(function () {", '"use strict";', "const __mods = {};"]
for p in order:
    m = modules[p]
    js.append(f"// ── {p} ──")
    js.append(f"__mods[{json.dumps(p)}] = (function () {{")
    js.append(m["src"])
    js.append(f"return {{ {', '.join(m['exports'])} }};")
    js.append("})();")
js.append("})();")
bundle = "\n".join(js).replace("</script", "<\\/script")

html = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
css = open(os.path.join(ROOT, "css/styles.css"), encoding="utf-8").read()
html = html.replace('<link rel="stylesheet" href="css/styles.css" />', f"<style>\n{css}\n</style>")
html = html.replace('<script type="module" src="js/app.js"></script>', f"<script>\n{bundle}\n</script>")
assert "<style>" in html and "__mods" in html
open(OUT, "w", encoding="utf-8").write(html)
print("modules:", len(order), "bytes:", len(html))
