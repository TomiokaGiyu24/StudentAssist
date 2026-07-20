import json
import re

file_path = r'c:\Users\Administrator\Downloads\StudentAssist-main\StudentAssist-main\src\data\Boards\Physics\movingchargesandmagnetism.json'

with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# We want to identify strings that contain mathematical equations and wrap them in $.
# However, we only want to wrap the math part, not the text part.
# Since it's hard to parse perfectly, we can look for known patterns from this chapter.

def wrap_math(text):
    if not isinstance(text, str):
        return text
    
    # If it's already wrapped, skip
    if '$' in text:
        return text
        
    # List of known full equations in points/descriptions to wrap in $
    known_equations = [
        r"|d\vec{B}| = \frac{\mu_{0}}{4\pi} \frac{I dl \sin\theta}{r^{2}}",
        r"\vec{F} = q[\vec{E}(\vec{r}) + \vec{v} \times \vec{B}(\vec{r})]",
        r"\vec{F}_{magnetic} = q(\vec{v} \times \vec{B})",
        r"\vec{F} = q(\vec{v} \times \vec{B})",
        r"\theta = 0^{\circ} \text{ or } 180^{\circ}",
        r"\vec{v} = 0",
        r"\vec{B} \times \vec{v}",
        r"\vec{v} \times \vec{B}",
        r"\vec{l} \times \vec{B}",
        r"\vec{F} = I(\vec{l} \times \vec{B})",
        r"F = I l B \sin\theta",
        r"\vec{v}_{d}",
        r"\vec{F} = (nAl)q(\vec{v}_{d} \times \vec{B})",
        r"I = nq|\vec{v}_{d}|A",
        r"I l B = mg",
        r"B = \frac{mg}{Il}",
        r"B = \frac{0.2 \times 9.8}{2 \times 1.5}",
        r"\vec{F} \cdot d\vec{r} = 0",
        r"\frac{mv^{2}}{r} = qvB",
        r"r = \frac{mv}{qB}",
        r"v = \omega r = \frac{2\pi r}{T}",
        r"T = \frac{2\pi m}{qB}",
        r"r = \frac{\sqrt{2mK}}{qB}",
        r"r_{p} = \frac{\sqrt{2m_{p}K}}{q_{p}B}",
        r"r_{\alpha} = \frac{\sqrt{2m_{\alpha}K}}{q_{\alpha}B}",
        r"r_{\alpha} = \frac{\sqrt{2(4m_{p})K}}{(2q_{p})B} = \frac{2\sqrt{2m_{p}K}}{2q_{p}B} = \frac{\sqrt{2m_{p}K}}{q_{p}B}",
        r"\frac{r_{p}}{r_{\alpha}} = 1",
        r"v_{\perp} = v\sin\theta",
        r"v_{\parallel} = v\cos\theta",
        r"p = v_{\parallel} T = \frac{2\pi m v\cos\theta}{qB}",
        r"p = v_{\parallel} \times T",
        r"r = \frac{mv}{qB} = \frac{p}{qB} = \frac{\sqrt{2mK}}{qB} = \frac{\sqrt{2mqV}}{qB}",
        r"dB = \frac{\mu_{0}}{4\pi} \frac{I dl \sin\theta}{r^{2}}",
        r"B = \frac{\mu_{0} I}{2 r}",
        r"B = \frac{\mu_{0} N I}{2 r}",
        r"B = \frac{\mu_{0} I R^{2}}{2(x^{2} + R^{2})^{3/2}}",
        r"\oint \vec{B} \cdot d\vec{l} = \mu_{0} I_{enclosed}",
        r"B = \mu_{0} n I",
        r"B = \frac{\mu_{0} N I}{2\pi r}",
        r"\vec{F}_{21} = \frac{\mu_{0} I_{1} I_{2}}{2\pi d} l",
        r"f = \frac{\mu_{0} I_{1} I_{2}}{2\pi d}",
        r"\tau = N I A B \sin\theta",
        r"\vec{\tau} = \vec{m} \times \vec{B}",
        r"\vec{m} = N I \vec{A}",
        r"I_{g} = \frac{V}{R + R_{g}}",
        r"S = \frac{I_{g}}{I - I_{g}} R_{g}",
        r"R = \frac{V}{I_{g}} - R_{g}"
    ]
    
    for eq in known_equations:
        # replace equation with $equation$
        # we need to be careful about replacing parts of other equations
        if eq in text:
            # check if it's already wrapped in $
            if f"${eq}$" not in text:
                text = text.replace(eq, f"${eq}$")
                
    return text

def process_dict(d):
    for key, value in d.items():
        if isinstance(value, str):
            if key != 'latex': # latex field might already be rendered with BlockMath
                d[key] = wrap_math(value)
        elif isinstance(value, list):
            for i in range(len(value)):
                if isinstance(value[i], str):
                    value[i] = wrap_math(value[i])
                elif isinstance(value[i], dict):
                    process_dict(value[i])
        elif isinstance(value, dict):
            process_dict(value)

for item in data:
    process_dict(item)

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Finished wrapping known equations in $")
