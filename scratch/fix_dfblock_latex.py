import json
import re
import os

file_path = r'c:\StudentAssist-main\src\data\Boards\Chemistry\inorganic\d&fblock.json'

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    raw = f.read()

# Pre-processing: The JSON has invalid escape sequences like \c, \t (as LaTeX \text, \circ etc.)
# that Python's JSON parser rejects. We need to escape lone backslashes before parsing.
# Strategy: Inside JSON string values, replace single backslashes that precede a letter 
# (not already part of valid JSON escapes \n, \r, \t, \\, \", \/, \b, \f, \uXXXX)
# with double backslashes so JSON parser doesn't choke.

# But \t is both valid JSON escape (tab) AND part of \text (LaTeX). 
# In this chemistry context, \t almost always means \text, not tab.
# We handle this by escaping ALL single backslashes to double, then fixing JSON-valid ones back.

# Actually, simplest approach: use a raw string decoder that's lenient
# Python 3.1+ has json.JSONDecoder with strict=False but that only affects control chars.
# Best approach: pre-escape lone backslashes in string content.

def fix_raw_json(raw_text):
    """Fix invalid JSON escape sequences by doubling up lone backslashes inside string values."""
    result = []
    in_string = False
    i = 0
    while i < len(raw_text):
        ch = raw_text[i]
        
        if ch == '"' and (i == 0 or raw_text[i-1] != '\\'):
            # Check if the preceding backslashes are even (meaning the quote is not escaped)
            num_preceding_backslashes = 0
            j = i - 1
            while j >= 0 and raw_text[j] == '\\':
                num_preceding_backslashes += 1
                j -= 1
            if num_preceding_backslashes % 2 == 0:
                in_string = not in_string
            result.append(ch)
            i += 1
            continue
        
        if in_string and ch == '\\':
            # Look ahead to see what follows
            if i + 1 < len(raw_text):
                next_ch = raw_text[i + 1]
                # Valid JSON escapes: \" \\ \/ \b \f \n \r \t \uXXXX
                # But \t in this context is almost certainly \text (LaTeX), not tab
                # So we only preserve: \\ \" \n \r \/ \b \f \uXXXX
                if next_ch == '\\':
                    # Already escaped backslash, pass through both
                    result.append('\\\\')
                    i += 2
                    continue
                elif next_ch == '"':
                    # Escaped quote, keep as-is
                    result.append('\\"')
                    i += 2
                    continue
                elif next_ch == 'u' and i + 5 < len(raw_text) and all(c in '0123456789abcdefABCDEF' for c in raw_text[i+2:i+6]):
                    # Unicode escape, keep as-is
                    result.append(raw_text[i:i+6])
                    i += 6
                    continue
                elif next_ch in ('n', 'r', 'b', 'f', '/'):
                    # Check context: \n in middle of text is likely newline, but we can keep it
                    result.append(ch)
                    result.append(next_ch)
                    i += 2
                    continue
                else:
                    # This is a lone backslash before something that's not a valid JSON escape
                    # Double it up so JSON parser treats it as a literal backslash
                    result.append('\\\\')
                    i += 1
                    continue
            else:
                result.append('\\\\')
                i += 1
                continue
        
        result.append(ch)
        i += 1
    
    return ''.join(result)

print("Pre-processing raw JSON to fix invalid escape sequences...")
fixed_raw = fix_raw_json(raw)

try:
    data = json.loads(fixed_raw)
    print(f"JSON parsed successfully. {len(data)} top-level items found.")
except json.JSONDecodeError as e:
    print(f"JSON parse failed after pre-processing: {e}")
    # Write the fixed raw for debugging
    debug_path = file_path.replace('.json', '_debug.json')
    with open(debug_path, 'w', encoding='utf-8') as f:
        f.write(fixed_raw)
    print(f"Debug file written to {debug_path}")
    exit(1)

fix_count = 0

def fix_latex_string(s):
    global fix_count
    if not isinstance(s, str):
        return s
    
    original = s
    
    # 1. Remove [cite: ...] references (single or multiple numbers)
    s = re.sub(r'\[cite:\s*[\d,\s]+\]', '', s)
    
    # 2. Collapse runs of multiple backslashes before LaTeX commands to single backslash
    # In Python memory after JSON parse:
    # "\\\\text" means 2 actual backslashes + "text" -> KaTeX sees "\\text" (wrong, double escape)
    # We want: "\text" (1 actual backslash) -> KaTeX sees "\text" (correct)
    s = re.sub(r'\\{2,}([a-zA-Z])', r'\\\1', s)
    
    # Also fix over-escaped special chars
    s = re.sub(r'\\{2,}([{}()\[\]%&_^~#])', r'\\\1', s)
    
    # 3. Clean up double/trailing spaces left by citation removal
    s = re.sub(r'  +', ' ', s)
    s = s.strip()
    
    if s != original:
        fix_count += 1
    
    return s

def traverse_and_fix(obj):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, str):
                obj[k] = fix_latex_string(v)
            else:
                traverse_and_fix(v)
    elif isinstance(obj, list):
        for i in range(len(obj)):
            if isinstance(obj[i], str):
                obj[i] = fix_latex_string(obj[i])
            else:
                traverse_and_fix(obj[i])

traverse_and_fix(data)

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"SUCCESS: Fixed {fix_count} strings in d&fblock.json")

# Validate the output is valid JSON
with open(file_path, 'r', encoding='utf-8') as f:
    try:
        validated = json.load(f)
        print(f"VALIDATION: Output JSON is valid ✓ ({len(validated)} items)")
    except json.JSONDecodeError as e:
        print(f"VALIDATION ERROR: {e}")
