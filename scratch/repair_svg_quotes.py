import json
import os
import re

def main():
    path = r"c:\StudentAssist-main\src\data\Boards\Chemistry\physical\solutions.json"
    if not os.path.exists(path):
        print(f"Error: File not found at {path}")
        return

    with open(path, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except Exception as e:
            print(f"Error reading JSON: {e}")
            return

    count = 0
    for item in data:
        if "graph_id" in item and "svg_rendering_block" in item:
            svg = item["svg_rendering_block"]
            # Replace sequences of backslashes followed by a double quote with a single double quote
            # For example, \\\" or \\" or \" in JavaScript string will be parsed, and we clean them up.
            new_svg = re.sub(r'\\+"', '"', svg)
            
            # Also clean double-escaped backslashes in transform="rotate(-90 20 190)"
            # For instance, if there's \\\\\" or similar.
            
            if new_svg != svg:
                item["svg_rendering_block"] = new_svg
                count += 1
                print(f"Cleaned SVG block for {item['graph_id']}")

    if count > 0:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Successfully repaired {count} graphs in solutions.json")
    else:
        print("No repairs were needed or made in solutions.json")

if __name__ == "__main__":
    main()
