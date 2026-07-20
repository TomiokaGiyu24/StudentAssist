import re
import json

file_path = r'C:\StudentAssist-main\src\data\Boards\Physics\alternatingcurrent.json'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

def replacer(match):
    s = match.group(0)
    if s == r'\\':
        return s  # Leave \\ alone
    elif s == r'\"':
        return s  # Leave \" alone
    else:
        return r'\\' + s[1:]

fixed_content = re.sub(r'\\.', replacer, content)

# Fix the specific unescaped newline issue we found earlier
fixed_content = fixed_content.replace('magnetic field \n\n.","elements"', 'magnetic field.","elements"')
# Also fix any other literal newlines that might be inside strings.
# A literal newline in a JSON string is technically not allowed.
# But re.sub with `\n` inside string quotes is tricky without parsing.
# We'll just catch exceptions and fix them manually if needed.

try:
    data = json.loads(fixed_content)
    print("Successfully parsed fixed JSON.")
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("File written successfully.")
except json.JSONDecodeError as e:
    print(f"Failed to parse after fix: {e}")
    start = max(0, e.pos - 50)
    end = min(len(fixed_content), e.pos + 50)
    print("Context around error:")
    print(repr(fixed_content[start:end]))
