import { formatHex, wcagContrast } from 'https://cdn.jsdelivr.net/npm/culori@3.3.0/+esm';

const hueInput = document.getElementById('input-hue');
const chromaInput = document.getElementById('input-chroma');
const valHue = document.getElementById('val-hue');
const valChroma = document.getElementById('val-chroma');
const modeBtn = document.getElementById('mode-toggle');
const cssCodeBlock = document.getElementById('css-code');
const subtitle = document.getElementById('dynamic-subtitle');
const copyBtn = document.getElementById('copy-btn');

let isDark = false;

function updatePalette() {
    const h = parseFloat(hueInput.value);
    const c = parseFloat(chromaInput.value);

    // Update UI numbers
    valHue.innerText = h;
    valChroma.innerText = c;

    // Define Lightness
    const bgL = isDark ? 0.15 : 0.98;
    const textL = isDark ? 0.98 : 0.10;
    const accentL = isDark ? 0.70 : 0.55;

    // Generate Hex
    const bgHex = formatHex({ mode: 'oklch', l: bgL, c: 0.01, h: h });
    const textHex = formatHex({ mode: 'oklch', l: textL, c: 0.02, h: h });
    const accentHex = formatHex({ mode: 'oklch', l: accentL, c: c, h: h });

    // Apply CSS Variables
    document.documentElement.style.setProperty('--bg', bgHex);
    document.documentElement.style.setProperty('--text', textHex);
    document.documentElement.style.setProperty('--accent', accentHex);
    
    // Update Slider Track Color based on Mode
    const trackColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
    document.documentElement.style.setProperty('--track-color', trackColor);

    // Update Text
    document.getElementById('hex-bg').innerText = bgHex;
    document.getElementById('hex-text').innerText = textHex;
    document.getElementById('hex-accent').innerText = accentHex;

    // Update Code Block
    cssCodeBlock.innerText = `:root {
  --bg: ${bgHex};
  --text: ${textHex};
  --accent: ${accentHex};
}`;

    // Contrast Check & Subtitle Update
    const contrast = wcagContrast(accentHex, bgHex);
    const ratio = contrast.toFixed(2);
    
    let passOrFail = "fails";
    let complianceLevel = "Fails WCAG";
    let wcagLink = "https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html";

    if (contrast >= 7.0) {
        passOrFail = "passes";
        complianceLevel = "WCAG AAA Compliant";
    } else if (contrast >= 4.5) {
        passOrFail = "passes";
        complianceLevel = "WCAG AA Compliant";
    } else if (contrast >= 3.0) {
        passOrFail = "partially passes"; 
        complianceLevel = "WCAG AA Large Text Only";
    } else {
        passOrFail = "fails";
        complianceLevel = "Fails WCAG";
    }

    // Update Subtitle
    subtitle.innerHTML = `Your current palette ${passOrFail} with a ${ratio}:1 contrast ratio. (<a href="${wcagLink}" target="_blank" rel="noopener noreferrer">${complianceLevel}</a>)`;
}

// COPY BUTTON LOGIC
copyBtn.addEventListener('click', () => {
    const codeText = cssCodeBlock.innerText;
    
    navigator.clipboard.writeText(codeText).then(() => {
        // Visual Feedback
        const originalText = copyBtn.innerText;
        copyBtn.innerText = "Copied!";
        
        // Revert back after 2 seconds
        setTimeout(() => {
            copyBtn.innerText = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
});

hueInput.addEventListener('input', updatePalette);
chromaInput.addEventListener('input', updatePalette);

modeBtn.addEventListener('click', () => {
    isDark = !isDark;
    modeBtn.innerText = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
    updatePalette();
});

// Init
updatePalette();
