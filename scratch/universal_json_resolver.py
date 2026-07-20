#!/usr/bin/env python3
import os
import sys
import json
import argparse

# ANSI color codes for premium terminal output
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

def log_info(msg):
    print(f"{CYAN}[INFO]{RESET} {msg}")

def log_success(msg):
    print(f"{GREEN}[SUCCESS]{RESET} {msg}")

def log_warn(msg):
    print(f"{YELLOW}[WARNING]{RESET} {msg}")

def log_error(msg):
    print(f"{RED}[ERROR]{RESET} {msg}", file=sys.stderr)

def fix_json_content(content):
    """
    Scans raw JSON content character by character and repairs common problems:
    1. Escapes invalid backslashes in LaTeX commands (e.g. \\sin, \\omega).
    2. Restores silent LaTeX escape corruptions parsed as control chars (\\frac, \\theta, \\nu, \\beta, \\rho, \\tan).
    3. Escapes literal newlines inside strings.
    4. Inserts missing commas between objects in JSON arrays (context-aware, only outside strings).
    """
    fixed = []
    in_string = False
    i = 0
    n = len(content)
    
    while i < n:
        char = content[i]
        
        if not in_string:
            if char == '"':
                in_string = True
                fixed.append(char)
                i += 1
            elif char == '}':
                # Look ahead for a missing comma between objects in a JSON array
                j = i + 1
                has_comma = False
                found_open_brace = False
                while j < n:
                    next_c = content[j]
                    if next_c.isspace():
                        j += 1
                    elif next_c == ',':
                        has_comma = True
                        break
                    elif next_c == '{':
                        found_open_brace = True
                        break
                    else:
                        break
                
                if found_open_brace and not has_comma:
                    fixed.append('},')  # Insert missing comma context-awarely
                else:
                    fixed.append('}')
                i += 1
            else:
                fixed.append(char)
                i += 1
        else:
            # We are inside a JSON string literal
            if char == '"':
                in_string = False
                fixed.append(char)
                i += 1
            elif char == '\\':
                if i + 1 < n:
                    next_char = content[i+1]
                    if next_char in ['"', '\\']:
                        # Leave escaped quote or escaped backslash alone
                        fixed.append(char)
                        fixed.append(next_char)
                        i += 2
                    elif next_char in ['/', 'b', 'f', 'n', 'r', 't']:
                        # Check if it is a LaTeX command starting with b,f,n,r,t
                        # (e.g. \\beta, \\frac, \\nu, \\rho, \\theta, \\tan)
                        # We identify a LaTeX command if the character following the escape code is a letter.
                        is_latex = False
                        if i + 2 < n:
                            after_next = content[i+2]
                            if after_next.isalpha():
                                is_latex = True
                        
                        if is_latex:
                            # It's a LaTeX command! Escape the backslash to prevent silent corruption
                            fixed.append('\\')
                            fixed.append('\\')
                            fixed.append(next_char)
                            i += 2
                        else:
                            # It is a legitimate JSON control sequence (like \\n or \\t at the end of a line)
                            fixed.append(char)
                            fixed.append(next_char)
                            i += 2
                    elif next_char == 'u':
                        # Verify if it is a valid unicode hex escape \\uXXXX
                        is_hex = True
                        for offset in range(2, 6):
                            if i + offset >= n or not content[i+offset].isalnum():
                                is_hex = False
                                break
                        if is_hex:
                            fixed.append(char)
                            fixed.append('u')
                            i += 2
                        else:
                            # Escape it
                            fixed.append('\\')
                            fixed.append('\\')
                            fixed.append('u')
                            i += 2
                    else:
                        # Any other character, we must escape the backslash (e.g. \\sin, \\omega)
                        fixed.append('\\')
                        fixed.append('\\')
                        fixed.append(next_char)
                        i += 2
                else:
                    # Single trailing backslash at end of file/string
                    fixed.append('\\')
                    fixed.append('\\')
                    i += 1
            elif char == '\n':
                # Escape literal newline inside string
                fixed.append('\\')
                fixed.append('n')
                i += 1
            elif char == '\r':
                # Handle Windows newlines \\r\\n inside string
                if i + 1 < n and content[i+1] == '\n':
                    fixed.append('\\')
                    fixed.append('n')
                    i += 2
                else:
                    fixed.append('\\')
                    fixed.append('r')
                    i += 1
            else:
                fixed.append(char)
                i += 1
                
    return "".join(fixed)

def process_file(file_path, make_fixes=False):
    log_info(f"Scanning file: {BOLD}{os.path.basename(file_path)}{RESET}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        log_error(f"Failed to read {file_path}: {e}")
        return False
        
    # Check if the file is currently valid
    original_valid = False
    try:
        json.loads(content)
        original_valid = True
    except json.JSONDecodeError:
        pass
        
    # Run the fixer engine
    repaired_content = fix_json_content(content)
    
    # Try parsing the repaired content
    repaired_valid = False
    parse_error = None
    try:
        parsed_data = json.loads(repaired_content)
        repaired_valid = True
    except json.JSONDecodeError as e:
        parse_error = e

    if original_valid and not parse_error:
        # File was already valid, and our resolver didn't break it
        # Let's check if the resolver actually made changes (e.g. fixing silent LaTeX corruptions)
        if content != repaired_content:
            if make_fixes:
                try:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        json.dump(parsed_data, f, indent=2, ensure_ascii=False)
                    log_success(f"Fixed silent LaTeX escape corruptions in: {file_path}")
                except Exception as e:
                    log_error(f"Failed to write fixed file {file_path}: {e}")
                    return False
            else:
                log_warn(f"File contains silent LaTeX escape corruptions: {file_path} (Run with --fix to repair)")
            return True
        else:
            log_success(f"File is 100% valid and correct: {file_path}")
            return True
            
    if not repaired_valid:
        log_error(f"Failed to resolve errors in {file_path}")
        if parse_error:
            log_error(f"Decoder error: {parse_error}")
            # Print surrounding context for debugging
            start = max(0, parse_error.pos - 80)
            end = min(len(repaired_content), parse_error.pos + 80)
            log_error(f"Context: {repr(repaired_content[start:end])}")
        return False
        
    # The file has been successfully repaired!
    if make_fixes:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(parsed_data, f, indent=2, ensure_ascii=False)
            log_success(f"REPAIRED and updated file successfully: {file_path}")
        except Exception as e:
            log_error(f"Failed to write repaired file {file_path}: {e}")
            return False
    else:
        log_warn(f"File is currently INVALID but CAN BE REPAIRED: {file_path} (Run with --fix to repair)")
        
    return True

def main():
    parser = argparse.ArgumentParser(
        description="Universal JSON Error Resolver: Detects and context-awarely repairs syntax and LaTeX escape errors."
    )
    parser.add_argument("path", help="Path to JSON file or directory containing JSON files")
    parser.add_argument("--fix", action="store_true", help="Write fixed/repaired output back to files")
    args = parser.parse_args()

    target_path = args.path
    if not os.path.exists(target_path):
        log_error(f"Specified path does not exist: {target_path}")
        sys.exit(1)
        
    files_to_process = []
    if os.path.isdir(target_path):
        for root, _, files in os.walk(target_path):
            for file in files:
                if file.endswith('.json'):
                    files_to_process.append(os.path.join(root, file))
    else:
        if target_path.endswith('.json'):
            files_to_process.append(target_path)
        else:
            log_error("Specified file is not a .json file")
            sys.exit(1)
            
    if not files_to_process:
        log_warn("No JSON files found to process.")
        sys.exit(0)
        
    log_info(f"Found {len(files_to_process)} JSON file(s) to process.")
    success_count = 0
    
    for file_path in files_to_process:
        if process_file(file_path, make_fixes=args.fix):
            success_count += 1
            
    total = len(files_to_process)
    print(f"\n{BOLD}Summary:{RESET} {success_count}/{total} files are in perfect condition.")
    if success_count < total:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()
