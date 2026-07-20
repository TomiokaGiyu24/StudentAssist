const fs = require('fs');
let data = fs.readFileSync('src/data/Boards/Physics/electricfieldandcharges.json', 'utf8');

const replacements = [
  ['\\\\vec{E}_{axial}', '$\\\\vec{E}_{axial}$'],
  ['\\\\vec{E}_{equatorial}', '$\\\\vec{E}_{equatorial}$'],
  ['E_{axial} = 2 \\\\times E_{equatorial}', '$E_{axial} = 2 \\\\times E_{equatorial}$'],
  ['\\\\theta = 0^{\\\\circ}', '$\\\\theta = 0^{\\\\circ}$'],
  ['\\\\theta = 180^{\\\\circ}', '$\\\\theta = 180^{\\\\circ}$'],
  ['\\\\theta = 90^{\\\\circ}', '$\\\\theta = 90^{\\\\circ}$'],
  ['\\\\vec{F}_{+} = q\\\\vec{E}', '$\\\\vec{F}_{+} = q\\\\vec{E}$'],
  ['\\\\vec{F}_{-} = -q\\\\vec{E}', '$\\\\vec{F}_{-} = -q\\\\vec{E}$'],
  ['17.7 \\\\times 10^{-12}\\\\,\\\\text{C/m}^{2}', '$17.7 \\\\times 10^{-12}\\\\,\\\\text{C/m}^{2}$'],
  ['-17.7 \\\\times 10^{-12}\\\\,\\\\text{C/m}^{2}', '$-17.7 \\\\times 10^{-12}\\\\,\\\\text{C/m}^{2}$'],
  ['8.85 \\\\times 10^{-12}\\\\,\\\\text{C}^{2}/\\\\text{Nm}^{2}', '$8.85 \\\\times 10^{-12}\\\\,\\\\text{C}^{2}/\\\\text{Nm}^{2}$'],
  ['1/r^2', '$1/r^2$'],
  ['1/r^3', '$1/r^3$'],
  ['1/r', '$1/r$'],
  ['\\\\text{C}^{2}/\\\\text{Nm}^{2}', '$\\\\text{C}^{2}/\\\\text{Nm}^{2}$'],
  ['q_{1}, q_{2}', '$q_{1}, q_{2}$'],
  ['\\\\vec{F}_{21}', '$\\\\vec{F}_{21}$'],
  ['r_{21}', '$r_{21}$'],
  ['\\\\hat{r}_{21}', '$\\\\hat{r}_{21}$'],
  ['\\\\hat{r}_{12}', '$\\\\hat{r}_{12}$'],
  ['\\\\vec{r}_{1}', '$\\\\vec{r}_{1}$'],
  ['\\\\vec{r}_{2}', '$\\\\vec{r}_{2}$'],
  ['\\\\vec{r}_{21}', '$\\\\vec{r}_{21}$'],
  ['\\\\vec{F}_{12}', '$\\\\vec{F}_{12}$'],
  ['q_{1}', '$q_{1}$'],
  ['q_{2}', '$q_{2}$'],
  ['q_{3}', '$q_{3}$'],
  ['F_{net} = \\\\sqrt{F_{1}^{2} + F_{2}^{2} + 2F_{1}F_{2}\\\\cos\\\\theta}', '$F_{net} = \\\\sqrt{F_{1}^{2} + F_{2}^{2} + 2F_{1}F_{2}\\\\cos\\\\theta}$'],
  ['F_{AC}', '$F_{AC}$'],
  ['q_{A}', '$q_{A}$'],
  ['q_{C}', '$q_{C}$'],
  ['q_{B}', '$q_{B}$'],
  ['F_{BC}', '$F_{BC}$'],
  ['\\\\vec{F}_{1}', '$\\\\vec{F}_{1}$'],
  ['q_{i}', '$q_{i}$'],
  ['r_{1i}', '$r_{1i}$'],
  ['\\\\hat{r}_{1i}', '$\\\\hat{r}_{1i}$'],
  ['\\\\hat{r}_{i1}', '$\\\\hat{r}_{i1}$'],
  ['\\\\vec{F}_{13}', '$\\\\vec{F}_{13}$'],
  ['\\\\vec{F}_{14}', '$\\\\vec{F}_{14}$'],
  ['8.854 \\\\times 10^{-12}', '$8.854 \\\\times 10^{-12}$'],
  ['\\\\text{m}^{2}', '$\\\\text{m}^{2}$'],
  ['\\\\theta = 60^{\\\\circ}', '$\\\\theta = 60^{\\\\circ}$'],
  ['\\\\cos(60^{\\\\circ}) = 0.5', '$\\\\cos(60^{\\\\circ}) = 0.5$'],
  ['\\\\vec{E} = \\\\lim_{q_{0} \\\\to 0} \\\\frac{\\\\vec{F}}{q_{0}}', '$\\\\vec{E} = \\\\lim_{q_{0} \\\\to 0} \\\\frac{\\\\vec{F}}{q_{0}}$'],
  ['q_{0} \\\\to 0', '$q_{0} \\\\to 0$'],
  ['q_{0}', '$q_{0}$'],
  ['10\\\\,\\\\text{m/s}^{2}', '$10\\\\,\\\\text{m/s}^{2}$'],
  ['\\\\vec{E} = \\\\frac{\\\\vec{F}}{q_{0}}', '$\\\\vec{E} = \\\\frac{\\\\vec{F}}{q_{0}}$'],
  ['\\\\vec{F}', '$\\\\vec{F}$'],
  ['Q_{1}', '$Q_{1}$'],
  ['Q_{2}', '$Q_{2}$'],
  ['(0.3 - x)^2', '$(0.3 - x)^2$'],
  ['\\\\vec{E} = 5 \\\\times 10^{3} \\\\hat{i}\\\\,\\\\text{N/C}', '$\\\\vec{E} = 5 \\\\times 10^{3} \\\\hat{i}\\\\,\\\\text{N/C}$'],
  ['10\\\\,\\\\text{cm}', '$10\\\\,\\\\text{cm}$'],
  ['\\\\text{cm}^{2}', '$\\\\text{cm}^{2}$'],
  ['\\\\text{Nm}^{2}/\\\\text{C}', '$\\\\text{Nm}^{2}/\\\\text{C}$'],
  ['\\\\text{N/C}', '$\\\\text{N/C}$'],
  ['\\\\vec{E} = 3 \\\\times 10^{3} \\\\hat{i}\\\\,\\\\text{N/C}', '$\\\\vec{E} = 3 \\\\times 10^{3} \\\\hat{i}\\\\,\\\\text{N/C}$'],
  ['0.1\\\\,\\\\text{m}', '$0.1\\\\,\\\\text{m}$'],
  ['1\\\\,\\\\text{cm}^{2} = 10^{-4}\\\\,\\\\text{m}^{2}', '$1\\\\,\\\\text{cm}^{2} = 10^{-4}\\\\,\\\\text{m}^{2}$'],
  ['E = E_{+q} - E_{-q}', '$E = E_{+q} - E_{-q}$'],
  ['(r+a)^{2} - (r-a)^{2} = 4ar', '$(r+a)^{2} - (r-a)^{2} = 4ar$'],
  ['\\\\frac{2kp}{r^{3}}', '$\\\\frac{2kp}{r^{3}}$'],
  ['r \\\\gg a', '$r \\\\gg a$'],
  ['(r+a)^{2} - (r-a)^{2}', '$(r+a)^{2} - (r-a)^{2}$'],
  ['E = 2kp/r^{3}', '$E = 2kp/r^{3}$'],
  ['2kp/r^3', '$2kp/r^3$'],
  ['\\\\cos\\\\theta = r/\\\\sqrt{r^2+a^2}', '$\\\\cos\\\\theta = r/\\\\sqrt{r^2+a^2}$'],
  ['a/\\\\sqrt{r^2+a^2}', '$a/\\\\sqrt{r^2+a^2}$'],
  ['\\\\sin(0^{\\\\circ}) = 0', '$\\\\sin(0^{\\\\circ}) = 0$'],
  ['\\\\text{C/m}^{2}', '$\\\\text{C/m}^{2}$'],
  ['\\\\text{C/m}^{3}', '$\\\\text{C/m}^{3}$'],
  ['q_{enc} = 17.7 \\\\times 10^{-12}\\\\,\\\\text{C}', '$q_{enc} = 17.7 \\\\times 10^{-12}\\\\,\\\\text{C}$'],
  ['q_{enc}', '$q_{enc}$'],
  ['q_{enc} = \\\\lambda L', '$q_{enc} = \\\\lambda L$'],
  ['q_{enc} = \\\\sigma A', '$q_{enc} = \\\\sigma A$'],
  ['\\\\sigma_2', '$\\\\sigma_2$'],
  ['q = 4\\\\pi R^{2} \\\\sigma', '$q = 4\\\\pi R^{2} \\\\sigma$'],
  ['E_{out}', '$E_{out}$'],
  ['E_{in}', '$E_{in}$'],
  ['q = 4\\\\pi R^{2}\\\\sigma', '$q = 4\\\\pi R^{2}\\\\sigma$']
];

let changed = 0;
// First replace anything that is already inside $ so we don't double wrap
data = data.replace(/\$([^$]+)\$/g, (match, p1) => {
  return 'DOUBLEDOLLAR_TEMP_' + Buffer.from(p1).toString('base64') + '_ENDTEMP';
});

// For pure exact match replacement
for (const [search, replace] of replacements) {
  if (data.includes(search)) {
    data = data.split(search).join(replace);
    changed++;
  }
}

// Additional regex replacements for missing stuff
// Fix any standalone expressions that follow patterns like E = ...
data = data.replace(/([^\$])(E = \\\\frac\{[^{}]+\}\{[^{}]+\})/g, '$1$$$2$$');

// Restore previously wrapped ones
data = data.replace(/DOUBLEDOLLAR_TEMP_([A-Za-z0-9+/=]+)_ENDTEMP/g, (match, p1) => {
  return '$' + Buffer.from(p1, 'base64').toString('utf8') + '$';
});

// Also fix any $$q_{1}$$ issues that might have happened
data = data.replace(/\$\$/g, '$');

fs.writeFileSync('src/data/Boards/Physics/electricfieldandcharges.json', data);
console.log('Replaced ' + changed + ' patterns.');
