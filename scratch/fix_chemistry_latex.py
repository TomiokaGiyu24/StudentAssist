import json
import re
import os

file_path = r'c:\StudentAssist-main\src\data\Boards\Chemistry\physical\solutions.json'

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

def fix_latex_string(s):
    if not isinstance(s, str):
        return s
    
    # 1. Fix double-escaped backslashes in Python memory
    # E.g. \\frac -> \frac (which gets written as \\frac in the JSON file)
    # Regex r'\\\\' matches two literal backslashes in memory
    s = re.sub(r'\\\\([a-zA-Z%]+)', r'\\\1', s)
    s = re.sub(r'\\\\([%{}()_^\-+<>*/])', r'\\\1', s)
    
    # 2. Convert $$ ... $$ block math to [ ... ]
    s = re.sub(r'(?<!\\)\$\$(.+?)(?<!\\)\$\$', r'[ \1 ]', s)
    
    # 3. Convert $ ... $ inline math to ( ... )
    s = re.sub(r'(?<!\\)\$([^$]+?)(?<!\\)\$', r'( \1 )', s)
    
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

print("SUCCESS: LaTeX backslashes and delimiters fixed in solutions.json")
