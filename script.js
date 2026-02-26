import { formatHex, wcagContrast } from 'https://cdn.jsdelivr.net/npm/culori@3.3.0/+esm';

const hueInput = document.getElementById('input-hue');
const chromaInput = document.getElementById('input-chroma');
const valHue = document.getElementById('val-hue');
const valChroma = document.getElementById('val-chroma');
const modeBtn = document.getElementById('mode-toggle');
const cssCodeBlock = document.getElementById('css-code');
const subtitle = document.getElementById('dynamic-subtitle');

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
    
    let statusText = "";
    let complianceText = "";

    // WCAG AA requires 4.5:1 for normal text, 3:1 for large text.
    // Since this is a general palette tool, we usually aim for 4.5.
    if (contrast >= 4.5) {
        statusText = "passes";
        complianceText = "WCAG AA Compliant";
        subtitle.style.color = "var(--text)"; // Normal text color
    } else {
        statusText = "fails";
        complianceText = "Fails WCAG AA";
        // Optional: make the subtitle red if it fails, or keep it neutral.
        // Keeping it neutral usually looks cleaner, but let's just ensure opacity is reset
        subtitle.style.color = "var(--text)"; 
    }

    // Update the subtitle sentence
    subtitle.innerText = `Your current palette ${statusText} with a ${ratio}:1 contrast ratio. (${complianceText})`;
}

hueInput.addEventListener('input', updatePalette);
chromaInput.addEventListener('input', updatePalette);

modeBtn.addEventListener('click', () => {
    isDark = !isDark;
    modeBtn.innerText = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
    updatePalette();
});

// Init
updatePalette();
