#!/usr/bin/env node
/**
 * COMPREHENSIVE LATEX FIX SCRIPT
 * ================================
 * Fixes ALL types of LaTeX errors in physics question JSON files:
 *
 * 1. MATH PLACEHOLDER REMOVAL:
 *    - Removes `$___$MATH$_$PH$_$N$___$` placeholders from stems, options, topper logic
 *    - Removes `___$MATH$_$PH$_$N$___$` fragments inside LaTeX expressions
 *    - Cleans up any dangling punctuation/space artifacts left behind
 *
 * 2. BROKEN LATEX IN MCQ OPTIONS:
 *    - Fixes `\$\frac{...}$\$\frac{...}$` → `$\frac{...} \cdot \frac{...}$`
 *    - Fixes `\\\\pi` → `\\pi` (double-escaped backslashes)
 *    - Fixes `$\$\pi$\$\epsilon_{0}` nested dollar breaks
 *    - Reconstructs well-formed `$...$` delimited LaTeX from broken fragments
 *
 * 3. DOUBLE-ESCAPED BACKSLASHES:
 *    - `\\\\frac` → `\\frac`, `\\\\pi` → `\\pi`, etc. in subjective question fields
 *    - Normalizes `\\\\text{...}` → `\\text{...}`
 *
 * 4. SPECIAL SYMBOL FIXES:
 *    - `$-$` mid-word hyphens → plain `-`
 *    - `$*$...$*$` italic markers → `*...*`
 *    - `$**$...$**$` bold markers → `**...**`
 *
 * 5. MULTI-PART QUESTION FORMATTING:
 *    - Ensures `\n\n` separators between (a), (b), (c) sub-parts
 *    - Fixes trailing mark annotations like `$(1$ Mark$)` 
 *
 * 6. CITE REFERENCE REMOVAL:
 *    - Strips `[cite: NNNN]` and `[cite: NNNN, NNNN]` style references
 *
 * Usage:
 *   node fix_all_latex.cjs [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const QUESTIONS_DIR = path.join(__dirname, '..', 'src', 'data', 'Boards', 'Physics', 'Questions');
const DRY_RUN = process.argv.includes('--dry-run');

// ANSI colors
const GREEN = '\x1b[92m';
const YELLOW = '\x1b[93m';
const RED = '\x1b[91m';
const CYAN = '\x1b[96m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

let totalFixes = 0;
let fixLog = [];

function log(type, msg) {
  const prefix = {
    info: `${CYAN}[INFO]${RESET}`,
    fix: `${GREEN}[FIX]${RESET}`,
    warn: `${YELLOW}[WARN]${RESET}`,
    err: `${RED}[ERR]${RESET}`,
  };
  console.log(`${prefix[type] || ''} ${msg}`);
}

function recordFix(category, before, after) {
  totalFixes++;
  fixLog.push({ category, before: before.substring(0, 80), after: after.substring(0, 80) });
}

// ============================================================================
// FIX 1: MATH PLACEHOLDER REMOVAL
// ============================================================================

/**
 * Remove $___$MATH$_$PH$_$N$___$ placeholders and clean up surrounding artifacts.
 */
function fixMathPlaceholders(text) {
  let result = text;

  // Pattern: Full placeholder wrapped in dollar signs: $___$MATH$_$PH$_$N$___$
  // This appears as inline "math" that renders to "MATH PH N"
  // Also handle variants: $(___$MATH$_$PH$_$N$___)$ with parens
  result = result.replace(/\$?\(?\$?___\$MATH\$_\$PH\$_\$\d+\$___\$?\)?\$?/g, '');

  // Pattern: ___$MATH$_$PH$_$N$___$ fragments inside LaTeX (no leading $)
  result = result.replace(/___\$MATH\$_\$PH\$_\$\d+\$___\$?/g, '');

  // Clean up dangling artifacts: ", ," → ","  and "  " → " "
  result = result.replace(/,\s*,/g, ',');
  result = result.replace(/\s{2,}/g, ' ');

  // Clean up empty dollar-sign pairs: $$ → remove
  result = result.replace(/\$\s*\$/g, '');

  // Clean up trailing/leading spaces around punctuation
  result = result.replace(/\s+\./g, '.');
  result = result.replace(/\s+,/g, ',');
  result = result.replace(/\(\s+/g, '(');
  result = result.replace(/\s+\)/g, ')');

  return result;
}

// ============================================================================
// FIX 2: BROKEN LATEX IN MCQ OPTIONS
// ============================================================================

/**
 * Reconstruct broken LaTeX option strings.
 * Input patterns like: \$\frac{1}{4\\pi\\epsilon_{0}}$\$\frac{q q_{0}}{2a^{2}}$
 * Should become:      $\frac{1}{4\pi\epsilon_{0}} \cdot \frac{q q_{0}}{2a^{2}}$
 */
function fixBrokenOptionLatex(text) {
  let result = text;

  // Step 1: Replace \$ (backslash-dollar) that are NOT valid LaTeX with just $
  // Pattern: \$\command{...} at the START → $\command{...}
  // Also fix intermediate \$ breaks: }$\$\command → } \command
  
  // First, detect if this is a "broken MCQ option" format
  // These have the characteristic pattern: starts with \$ and contains $\$
  if (result.includes('\\$\\') || result.includes('$\\$\\')) {
    // This is a broken option. Reconstruct it.
    
    // Remove all backslash-before-dollar patterns and merge into single LaTeX block
    // Step: Replace \$ with $ at start
    result = result.replace(/^\\\$/, '$');
    
    // Step: Replace }$\$\ with } \  (merge two LaTeX fragments)
    result = result.replace(/\}\$\\\$\\/g, '} \\');
    
    // Step: Replace {$\$\ with { \  (merge nested fragments)
    result = result.replace(/\{\$\\\$\\/g, '{');
    
    // Step: Replace remaining $\$\ with space + backslash
    result = result.replace(/\$\\\$\\/g, ' \\');
    
    // Step: Fix double-escaped backslashes inside: \\\\pi → \\pi
    result = result.replace(/\\\\(pi|epsilon|sigma|lambda|mu|nu|theta|alpha|beta|gamma|delta|rho|tau|phi|psi|omega|chi|hat|vec|frac|sqrt|text|cdot|times|circ|oint|int|sum|prod|partial|nabla|infty|approx|propto|implies|quad|left|right|cos|sin|tan|log|ln|exp|lim)/g, '\\$1');
    
    // Make sure it ends with $ if it doesn't
    result = result.trim();
    if (!result.endsWith('$')) {
      result += '$';
    }
    
    // Make sure it starts with $ if it doesn't
    if (!result.startsWith('$')) {
      result = '$' + result;
    }
  }

  return result;
}

// ============================================================================
// FIX 3: DOUBLE-ESCAPED BACKSLASHES IN SUBJECTIVE FIELDS
// ============================================================================

/**
 * Normalize double-escaped backslashes: \\\\command → \\command
 * This is for subjective question fields where LaTeX has \\\\frac etc.
 */
function fixDoubleEscapedBackslashes(text) {
  let result = text;
  
  // The JSON stores \\frac as \\\\frac in the file, which parses to \\frac in JS
  // But some values have FOUR backslashes in file (\\\\\\\\frac) which parse to \\\\frac
  // We need to normalize \\\\command → \\command
  
  // Match sequences of 2+ backslashes followed by a LaTeX command
  const latexCommands = [
    'frac', 'vec', 'sqrt', 'text', 'hat', 'bar', 'dot', 'ddot', 'tilde', 'overline',
    'pi', 'epsilon', 'sigma', 'lambda', 'mu', 'nu', 'theta', 'alpha', 'beta', 'gamma',
    'delta', 'rho', 'tau', 'phi', 'psi', 'omega', 'chi', 'kappa', 'eta', 'zeta', 'xi',
    'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma', 'Phi', 'Psi', 'Omega',
    'cdot', 'times', 'circ', 'oint', 'int', 'sum', 'prod', 'partial', 'nabla',
    'infty', 'approx', 'propto', 'implies', 'Rightarrow', 'rightarrow', 'leftarrow',
    'quad', 'qquad', 'left', 'right',
    'cos', 'sin', 'tan', 'csc', 'sec', 'cot', 'log', 'ln', 'exp', 'lim', 'det',
    'leq', 'geq', 'neq', 'gg', 'll', 'pm', 'mp',
    'Phi',
  ];

  // Pattern: 2+ consecutive backslashes before a LaTeX command → single backslash
  const cmdPattern = latexCommands.join('|');
  const regex = new RegExp(`\\\\{2,}(${cmdPattern})(?![a-zA-Z])`, 'g');
  result = result.replace(regex, '\\$1');

  return result;
}

// ============================================================================
// FIX 4: SPECIAL SYMBOL FIXES
// ============================================================================

/**
 * Fix $-$ mid-word hyphens, $*$ italic/bold markers, etc.
 */
function fixSpecialSymbols(text) {
  let result = text;

  // $-$ used as a hyphen → plain hyphen
  result = result.replace(/\$-\$/g, '-');

  // $*$...$*$ used as italic markers → *...*
  // But be careful not to match $*$ that are part of actual math
  result = result.replace(/\$\*\$(.*?)\$\*\$/g, '*$1*');

  // $**$...$**$ used as bold markers → **...**
  result = result.replace(/\$\*\*\$(.*?)\$\*\*\$/g, '**$1**');

  return result;
}

// ============================================================================
// FIX 5: MULTI-PART QUESTION FORMATTING
// ============================================================================

/**
 * Ensure sub-parts in stem_text are properly separated by newlines.
 * Patterns like: "...text$(1$ Mark$)\n\n($b)" should be cleaned.
 * Also fix Mark annotations: "$(1$ Mark$)" → "(1 Mark)"
 */
function fixMultiPartFormatting(text) {
  let result = text;

  // Fix mark annotations: $(N$ Mark$) or $(N$ Marks$)  → (N Mark) or (N Marks)
  result = result.replace(/\$\((\d+)\$\s*Mark(s?)\$\)/g, '($1 Mark$2)');
  
  // Fix opening of sub-parts: $)\n\n($ → )\n\n(
  result = result.replace(/\$\)\s*\\n\\n\s*\(\$/g, ')\n\n(');

  return result;
}

// ============================================================================
// FIX 6: CITE REFERENCE REMOVAL
// ============================================================================

/**
 * Remove [cite: NNNN] and [cite: NNNN, NNNN] references.
 */
function fixCiteReferences(text) {
  let result = text;
  // Match [cite: 1234] or [cite: 1234, 5678] or [cite: 1234, 5678, 9012]
  result = result.replace(/\[cite:\s*[\d,\s]+\]/gi, '');
  // Clean up any double spaces left behind
  result = result.replace(/\s{2,}/g, ' ');
  return result;
}

// ============================================================================
// FIX 7: TRAILING INCOMPLETE LATEX FRAGMENTS
// ============================================================================

/**
 * Fix cases where LaTeX expressions are cut off by MATH placeholders,
 * leaving dangling open `$` delimiters.
 */
function fixIncompleteLatex(text) {
  let result = text;

  // Count unmatched dollar signs - if odd number, there's a problem
  const dollarCount = (result.match(/\$/g) || []).length;
  if (dollarCount % 2 !== 0) {
    // Try to find the dangling $ and close it or remove it
    // Strategy: find the last unmatched $ and add a closing one
    let depth = 0;
    let lastOpen = -1;
    for (let i = 0; i < result.length; i++) {
      if (result[i] === '$') {
        if (depth === 0) {
          depth = 1;
          lastOpen = i;
        } else {
          depth = 0;
        }
      }
    }
    if (depth === 1 && lastOpen >= 0) {
      // Find where this expression should end (next space, period, comma, or end of string)
      const afterOpen = result.substring(lastOpen + 1);
      const endMatch = afterOpen.match(/^([^$]*?)(\s*[.,;:!?)\]]|$)/);
      if (endMatch) {
        const insertPos = lastOpen + 1 + endMatch[1].length;
        result = result.substring(0, insertPos) + '$' + result.substring(insertPos);
      }
    }
  }

  return result;
}

// ============================================================================
// MASTER FIX PIPELINE
// ============================================================================

/**
 * Apply all fixes to a single string value.
 * @param {string} text - The string to fix
 * @param {string} fieldName - The JSON field name (for context-aware fixing)
 * @returns {string} The fixed string
 */
function fixString(text, fieldName) {
  if (!text || typeof text !== 'string') return text;

  let result = text;
  const original = text;

  // Apply fixes in order
  result = fixCiteReferences(result);
  result = fixSpecialSymbols(result);
  result = fixMathPlaceholders(result);
  
  // Context-aware: MCQ options get broken-option LaTeX fix
  if (fieldName === 'a' || fieldName === 'b' || fieldName === 'c' || fieldName === 'd') {
    result = fixBrokenOptionLatex(result);
  }

  // Subjective fields get double-backslash normalization
  result = fixDoubleEscapedBackslashes(result);

  // Stem text gets multi-part formatting fix
  if (fieldName === 'stem_text') {
    result = fixMultiPartFormatting(result);
  }

  // Final pass: fix any incomplete LaTeX
  result = fixIncompleteLatex(result);

  // Clean up any remaining whitespace issues
  result = result.replace(/\s{2,}/g, ' ').trim();

  if (result !== original) {
    recordFix(fieldName || 'unknown', original, result);
  }

  return result;
}

/**
 * Recursively walk through the parsed JSON and fix all string values.
 */
function fixObject(obj, parentKey) {
  if (typeof obj === 'string') {
    return fixString(obj, parentKey);
  }
  if (Array.isArray(obj)) {
    return obj.map((item, idx) => fixObject(item, parentKey));
  }
  if (obj && typeof obj === 'object') {
    const fixed = {};
    for (const [key, value] of Object.entries(obj)) {
      fixed[key] = fixObject(value, key);
    }
    return fixed;
  }
  return obj;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function processFile(filePath) {
  const fileName = path.basename(filePath);
  log('info', `Processing: ${BOLD}${fileName}${RESET}`);

  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    log('err', `Failed to read: ${filePath}`);
    return false;
  }

  // Skip empty/placeholder files (just "[]")
  if (raw.trim().length <= 4) {
    log('info', `${DIM}Skipped (empty placeholder): ${fileName}${RESET}`);
    return true;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    log('err', `JSON parse error in ${fileName}: ${e.message}`);
    return false;
  }

  const beforeFixes = totalFixes;
  const fixed = fixObject(parsed, null);
  const fixesApplied = totalFixes - beforeFixes;

  if (fixesApplied === 0) {
    log('info', `${DIM}No fixes needed for: ${fileName}${RESET}`);
    return true;
  }

  log('fix', `Applied ${BOLD}${fixesApplied}${RESET} fixes to ${BOLD}${fileName}${RESET}`);

  if (!DRY_RUN) {
    try {
      const output = JSON.stringify(fixed, null, 2);
      fs.writeFileSync(filePath, output, 'utf8');
      log('fix', `${GREEN}Written fixed file: ${fileName}${RESET}`);
    } catch (e) {
      log('err', `Failed to write: ${filePath}: ${e.message}`);
      return false;
    }
  } else {
    log('warn', `${YELLOW}DRY RUN - no changes written to disk${RESET}`);
  }

  return true;
}

function main() {
  console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}  COMPREHENSIVE LATEX FIXER v1.0${RESET}`);
  console.log(`${BOLD}${CYAN}═══════════════════════════════════════════════════${RESET}\n`);

  if (DRY_RUN) {
    log('warn', `Running in DRY RUN mode - no files will be modified\n`);
  }

  // Find all JSON files
  let files;
  try {
    files = fs.readdirSync(QUESTIONS_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => path.join(QUESTIONS_DIR, f));
  } catch (e) {
    log('err', `Failed to read questions directory: ${e.message}`);
    process.exit(1);
  }

  log('info', `Found ${BOLD}${files.length}${RESET} JSON files to process\n`);

  let successCount = 0;
  for (const file of files) {
    if (processFile(file)) {
      successCount++;
    }
  }

  // Summary
  console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}  SUMMARY${RESET}`);
  console.log(`${BOLD}${CYAN}═══════════════════════════════════════════════════${RESET}`);
  console.log(`  Files processed: ${BOLD}${successCount}/${files.length}${RESET}`);
  console.log(`  Total fixes applied: ${BOLD}${GREEN}${totalFixes}${RESET}`);

  if (fixLog.length > 0) {
    console.log(`\n${BOLD}  Fix Breakdown by Category:${RESET}`);
    const categories = {};
    fixLog.forEach(f => {
      categories[f.category] = (categories[f.category] || 0) + 1;
    });
    Object.entries(categories).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`    ${DIM}•${RESET} ${cat}: ${BOLD}${count}${RESET} fixes`);
    });
  }

  if (DRY_RUN) {
    console.log(`\n${YELLOW}  ⚠ DRY RUN complete. Run without --dry-run to apply changes.${RESET}`);
  } else {
    console.log(`\n${GREEN}  ✓ All fixes applied successfully.${RESET}`);
  }
  console.log();
}

main();
