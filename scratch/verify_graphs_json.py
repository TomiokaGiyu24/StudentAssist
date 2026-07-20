import json
import re
import sys

file_path = r'c:\StudentAssist-main\src\data\Boards\Physics\Graphs\electricfieldandcharges.json'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print("SUCCESS: JSON is valid and loaded successfully.")
except Exception as e:
    print(f"ERROR: Failed to load JSON: {e}")
    sys.exit(1)

# Helper to check strings for double dollar signs or unbalanced single dollar signs
def check_string(s, path):
    if not isinstance(s, str):
        return
    
    # Check for double dollar signs
    if "$$" in s:
        print(f"WARNING: Double dollar signs found in path '{path}': {repr(s)}")
        
    # Check for unbalanced single dollar signs (excluding escaped ones if any, though standard LaTeX $ in json isn't escaped)
    # Let's count unescaped dollar signs
    # Note: we should ignore standard \$ if any are escaped, but usually it's just $
    dollars = [m.start() for m in re.finditer(r'(?<!\\)\$', s)]
    if len(dollars) % 2 != 0:
        print(f"ERROR: Unbalanced dollar signs ({len(dollars)} count) in path '{path}': {repr(s)}")

def traverse(obj, path=""):
    if isinstance(obj, dict):
        for k, v in obj.items():
            traverse(v, f"{path}.{k}" if path else k)
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            traverse(item, f"{path}[{i}]")
    elif isinstance(obj, str):
        check_string(obj, path)

traverse(data)
print("Traversal complete.")
