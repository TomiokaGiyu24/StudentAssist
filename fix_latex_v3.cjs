const fs = require('fs');

let data = JSON.parse(fs.readFileSync('src/data/Boards/Physics/electricfieldandcharges.json', 'utf8'));

// The strings to be wrapped in $...$
const targets = [
  "\\vec{E}_{axial}",
  "\\vec{E}_{equatorial}",
  "E_{axial} = 2 \\times E_{equatorial}",
  "\\theta = 0^{\\circ}",
  "\\theta = 180^{\\circ}",
  "\\theta = 90^{\\circ}",
  "\\vec{F}_{+} = q\\vec{E}",
  "\\vec{F}_{-} = -q\\vec{E}",
  "17.7 \\times 10^{-12}\\,\\text{C/m}^{2}",
  "-17.7 \\times 10^{-12}\\,\\text{C/m}^{2}",
  "8.85 \\times 10^{-12}\\,\\text{C}^{2}/\\text{Nm}^{2}",
  "8.854 \\times 10^{-12}\\,\\text{C}^{2}/\\text{Nm}^{2}",
  "1/r^2",
  "1/r^3",
  "1/r",
  "\\text{C}^{2}/\\text{Nm}^{2}",
  "q_{1}, q_{2}",
  "\\vec{F}_{21}",
  "r_{21}",
  "\\hat{r}_{21}",
  "\\hat{r}_{12}",
  "\\vec{r}_{1}",
  "\\vec{r}_{2}",
  "\\vec{r}_{21}",
  "\\vec{F}_{12}",
  "q_{1}",
  "q_{2}",
  "q_{3}",
  "F_{net} = \\sqrt{F_{1}^{2} + F_{2}^{2} + 2F_{1}F_{2}\\cos\\theta}",
  "F_{AC}",
  "q_{A}",
  "q_{C}",
  "q_{B}",
  "F_{BC}",
  "\\vec{F}_{1}",
  "q_{i}",
  "r_{1i}",
  "\\hat{r}_{1i}",
  "\\hat{r}_{i1}",
  "\\vec{F}_{13}",
  "\\vec{F}_{14}",
  "8.854 \\times 10^{-12}",
  "\\text{m}^{2}",
  "\\theta = 60^{\\circ}",
  "\\cos(60^{\\circ}) = 0.5",
  "\\vec{E} = \\lim_{q_{0} \\to 0} \\frac{\\vec{F}}{q_{0}}",
  "q_{0} \\to 0",
  "q_{0}",
  "10\\,\\text{m/s}^{2}",
  "\\vec{E} = \\frac{\\vec{F}}{q_{0}}",
  "\\vec{F}",
  "Q_{1}",
  "Q_{2}",
  "(0.3 - x)^2",
  "\\vec{E} = 5 \\times 10^{3} \\hat{i}\\,\\text{N/C}",
  "10\\,\\text{cm}",
  "\\text{cm}^{2}",
  "\\text{Nm}^{2}/\\text{C}",
  "\\text{N/C}",
  "\\vec{E} = 3 \\times 10^{3} \\hat{i}\\,\\text{N/C}",
  "0.1\\,\\text{m}",
  "1\\,\\text{cm}^{2} = 10^{-4}\\,\\text{m}^{2}",
  "E = E_{+q} - E_{-q}",
  "(r+a)^{2} - (r-a)^{2} = 4ar",
  "\\frac{2kp}{r^{3}}",
  "r \\gg a",
  "(r+a)^{2} - (r-a)^{2}",
  "E = 2kp/r^{3}",
  "2kp/r^3",
  "\\cos\\theta = r/\\sqrt{r^2+a^2}",
  "a/\\sqrt{r^2+a^2}",
  "\\sin(0^{\\circ}) = 0",
  "\\text{C/m}^{2}",
  "\\text{C/m}^{3}",
  "q_{enc} = 17.7 \\times 10^{-12}\\,\\text{C}",
  "q_{enc}",
  "q_{enc} = \\lambda L",
  "q_{enc} = \\sigma A",
  "\\sigma_2",
  "q = 4\\pi R^{2} \\sigma",
  "E_{out}",
  "E_{in}",
  "q = 4\\pi R^{2}\\sigma",
  "q_{1}, q_{2}, ..., q_{n}",
  "q_{1} + q_{2} + ... + q_{n}",
  "1.6 \\times 10^{-19}\\,\\text{C}",
  "0.32 \\times 10^{-18}\\,\\text{C}",
  "q_{1}q_{2} > 0",
  "q_{1}q_{2} < 0",
  "q_{1}q_{2}",
  "r^{2}",
  "\\frac{1}{4\\pi\\epsilon_{0}}",
  "\\epsilon_{0}",
  "9 \\times 10^{9}\\,\\text{Nm}^{2}/\\text{C}^{2}",
  "\\vec{F}_{12} = -\\vec{F}_{21}",
  "\\frac{1}{r^{2}}",
  "q_{A} = +2 \\times 10^{-6}\\,\\text{C}",
  "q_{B} = -2 \\times 10^{-6}\\,\\text{C}",
  "q_{C} = +1 \\times 10^{-6}\\,\\text{C}",
  "0.2\\,\\text{m}",
  "r_{AC} = 0.1\\,\\text{m}",
  "r_{BC} = 0.1\\,\\text{m}",
  "F_{AC} = \\frac{9 \\times 10^{9} \\times 2 \\times 10^{-6} \\times 1 \\times 10^{-6}}{(0.1)^{2}} = 1.8\\,\\text{N}",
  "F_{BC} = \\frac{9 \\times 10^{9} \\times 2 \\times 10^{-6} \\times 1 \\times 10^{-6}}{(0.1)^{2}} = 1.8\\,\\text{N}",
  "F_{net} = F_{AC} + F_{BC} = 1.8 + 1.8 = 3.6\\,\\text{N}",
  "+2 \\times 10^{-6}\\,\\text{C}",
  "-2 \\times 10^{-6}\\,\\text{C}",
  "10^{-6}",
  "10^{-9}",
  "10^{-19}",
  "\\vec{p} = q \\times 2a",
  "E = \\frac{2kp}{r^{3}}",
  "E = 9\\times 10^9 \\times 2 \\times 4\\times 10^{-7} / (0.2)^3 = 9\\times 10^5 \\text{N/C}",
  "\\vec{E}_{+q}",
  "\\vec{E}_{-q}",
  "E_{+q} = E_{-q} = \\frac{q}{4\\pi\\epsilon_{0}(r^{2}+a^{2})}",
  "E = 2 E_{+q} \\cos\\theta",
  "\\cos\\theta = \\frac{a}{\\sqrt{r^{2}+a^{2}}}",
  "E = \\frac{2qa}{4\\pi\\epsilon_{0}(r^{2}+a^{2})^{3/2}}",
  "E_{axial} = 2 \\times E_{equatorial}",
  "\\theta = 0^{\\circ}",
  "\\theta = 180^{\\circ}",
  "\\theta = 90^{\\circ}",
  "\\vec{F}_{+} = q\\vec{E}",
  "\\vec{F}_{-} = -q\\vec{E}",
  "17.7 \\times 10^{-12}\\,\\text{C/m}^{2}",
  "-17.7 \\times 10^{-12}\\,\\text{C/m}^{2}",
  "8.85 \\times 10^{-12}\\,\\text{C}^{2}/\\text{Nm}^{2}",
  "1/r^2",
  "1/r^3",
  "1/r",
  "q = ne",
  "E = \\frac{1}{4\\pi\\epsilon_{0}} \\frac{q}{r^{2}}",
  "\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{q_{enc}}{\\epsilon_{0}}",
  "E (4\\pi r^{2}) = \\frac{q}{\\epsilon_{0}} \\implies E = \\frac{1}{4\\pi\\epsilon_{0}} \\frac{q}{r^{2}}",
  "E \\oint dA = \\frac{q}{\\epsilon_{0}}",
  "\\oint E dA = \\frac{q}{\\epsilon_{0}}",
  "\\oint dA = 4\\pi r^{2}",
  "\\vec{E} \\cdot d\\vec{A} = E dA",
  "E \\to \\infty",
  "\\vec{E} = \\frac{\\lambda}{2\\pi\\epsilon_{0}r} \\hat{n}",
  "E(2\\pi r L) = \\frac{\\lambda L}{\\epsilon_{0}}",
  "\\vec{E} \\perp d\\vec{A}",
  "\\vec{E} = \\frac{\\sigma}{2\\epsilon_{0}} \\hat{n}",
  "2EA = \\frac{\\sigma A}{\\epsilon_{0}}",
  "\\sigma/\\epsilon_{0}",
  "\\sigma/2\\epsilon_{0}",
  "\\sigma / 2\\epsilon_{0}",
  "\\sigma / \\epsilon_{0}",
  "E_{1} = \\frac{|\\sigma_{1}|}{2\\epsilon_{0}}, \\quad E_{2} = \\frac{|\\sigma_{2}|}{2\\epsilon_{0}}",
  "E_{I} = E_{1} - E_{2} = \\frac{\\sigma}{2\\epsilon_{0}} - \\frac{\\sigma}{2\\epsilon_{0}} = 0",
  "E_{II} = E_{1} + E_{2} = \\frac{\\sigma}{2\\epsilon_{0}} + \\frac{\\sigma}{2\\epsilon_{0}} = \\frac{\\sigma}{\\epsilon_{0}}",
  "E_{II} = \\frac{17.7 \\times 10^{-12}}{8.85 \\times 10^{-12}} = 2\\,\\text{N/C}",
  "E_{outer} = 0, \\quad E_{inner} = 2",
  "\\frac{q}{4\\pi\\epsilon_{0}R^{2}}",
  "E_{out} = \\frac{1}{4\\pi\\epsilon_{0}}\\frac{q}{r^{2}}, \\quad E_{in} = 0",
  "\\oint E dA = E(4\\pi r^{2})",
  "E(4\\pi r^{2}) = \\frac{q}{\\epsilon_{0}}",
  "E(4\\pi r^{2}) = 0 \\implies E = 0",
  "q_enc = 0",
  "E_{max} = \\frac{1}{4\\pi\\epsilon_{0}}\\frac{q}{R^{2}}",
  "E \\propto \\frac{1}{r^{2}}",
  "E = \\frac{\\lambda}{2\\pi\\epsilon_{0}r}",
  "E = \\frac{\\sigma}{2\\epsilon_{0}}",
  "E = \\frac{1}{4\\pi\\epsilon_{0}}\\frac{q}{r^{2}}",
  "\\Phi_{total} = \\frac{q_{enc}}{\\epsilon_{0}} = \\frac{17.7 \\times 10^{-12}}{8.854 \\times 10^{-12}} = 2\\,\\text{Nm}^{2}/\\text{C}",
  "\\Phi_{face} = \\frac{\\Phi_{total}}{6} = \\frac{2}{6} = \\frac{1}{3}\\,\\text{Nm}^{2}/\\text{C}",
  "E = 0",
  "E_+q",
  "E_-q",
  "E_+q = E_-q",
  "\\Phi = EA \\cos\\theta"
];

// Sort targets by length descending! Critical to prevent nested replaces.
targets.sort((a, b) => b.length - a.length);

let totalReplaced = 0;

function wrapString(str) {
  let result = str;
  // Use a placeholder to protect things we already replaced
  let placeholders = [];
  
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    // Find all occurrences of target in result that are NOT inside a placeholder
    let pos = 0;
    while ((pos = result.indexOf(target, pos)) !== -1) {
      // Check if this position is already inside a placeholder $...$
      // We'll just replace it with a placeholder ID and store the string
      const id = `___MATH_${placeholders.length}___`;
      placeholders.push(`$${target}$`);
      result = result.substring(0, pos) + id + result.substring(pos + target.length);
      pos += id.length;
      totalReplaced++;
    }
  }

  // Also intelligently find any remaining \vec{...}, \frac{...}, E = ... that might be missed
  // No, let's stick to explicit targets to be safe.
  
  // Restore placeholders
  for (let i = placeholders.length - 1; i >= 0; i--) {
    result = result.replace(`___MATH_${i}___`, placeholders[i]);
  }
  
  return result;
}

function traverse(obj) {
  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      if (key !== 'latex' && key !== 'symbol' && key !== 'what_is_shown') {
         obj[key] = wrapString(obj[key]);
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      traverse(obj[key]);
    }
  }
}

traverse(data);

fs.writeFileSync('src/data/Boards/Physics/electricfieldandcharges.json', JSON.stringify(data, null, 2));
console.log('Total replacements made:', totalReplaced);
