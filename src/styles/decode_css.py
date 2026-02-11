import base64, os, sys
b64_file = sys.argv[1]
out_file = sys.argv[2]
with open(b64_file) as bf:
    data = bf.read()
css = base64.b64decode(data).decode("utf-8")
with open(out_file, "w", encoding="utf-8") as of:
    of.write(css)
print(f"Decoded {len(data)} b64 chars -> {len(css)} CSS chars")
print(f"Written to {out_file}")
