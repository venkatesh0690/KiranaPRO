#!/usr/bin/env bash
# Reviewed KiranaPRO LocalFresh image import. Run from inside a Git checkout.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="${1:-$SCRIPT_DIR}"
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$ROOT" || ! -f "$ROOT/src/utils/localFreshIllustrations.js" ]]; then
  echo "ERROR: Run from a KiranaPRO checkout containing the product mapping." >&2
  exit 1
fi
if [[ "$(git -C "$ROOT" branch --show-current)" != "feature/complete-product-images" ]]; then
  if git -C "$ROOT" show-ref --verify --quiet refs/heads/feature/complete-product-images; then
    git -C "$ROOT" switch feature/complete-product-images
  else
    git -C "$ROOT" switch -c feature/complete-product-images
  fi
fi
python3 - "$SOURCE_DIR" "$ROOT/public/product-images" <<'PY'
import pathlib, shutil, sys, hashlib
source,target=map(pathlib.Path,sys.argv[1:3])
ids="""1001 1002 1005 1008 1009 1013 1015 1016 1018 1022 1024 1026 1029 1034 1036 1050 1051 1053 1055 1056 1057 1059 1060 1063 1064 1068 1074 1075 1076 1077 1078 1079 1080 1085 1087 1088 1089 1090 1091 1092 1095 1097 1098 1099 1100 1102 1104 1105 1106""".split()
files=[source / f"lf-{x}.webp" for x in ids]
missing=[str(p.name) for p in files if not p.is_file()]
if missing: raise SystemExit("ERROR: Missing expected images: "+", ".join(missing))
for p in files:
    data=p.read_bytes()
    if len(data)>1000000 or len(data)<1000 or data[:4]!=b"RIFF" or data[8:12]!=b"WEBP":
        raise SystemExit("ERROR: Invalid WebP image: "+p.name)
target.mkdir(parents=True,exist_ok=True)
copied=0
for p in files:
    dest=target/p.name
    if dest.exists():
        if hashlib.sha256(p.read_bytes()).digest()!=hashlib.sha256(dest.read_bytes()).digest():
            raise SystemExit("ERROR: Existing file differs. Refusing to overwrite: "+str(dest))
        continue
    shutil.copy2(p,dest)
    copied+=1
print(f"Validated {len(files)} LocalFresh WebP illustrations. Added {copied} files.")
if (source/"1204.webp").exists():
    print("Excluded 1204.webp: no matching LocalFresh product ID (review required).")
PY
git -C "$ROOT" add -- public/product-images
if ! git -C "$ROOT" diff --cached --quiet -- public/product-images; then
  git -C "$ROOT" commit -m "assets: add 49 reviewed LocalFresh AI illustration images"
else
  echo "Images already imported; no new asset commit needed."
fi
echo "Ready to push: git push -u origin feature/complete-product-images"
