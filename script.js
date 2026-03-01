import { formatHex, wcagContrast } from 'https://cdn.jsdelivr.net/npm/culori@3.3.0/+esm';

// --- DOM Elements ---
const hueInput = document.getElementById('input-hue');
const chromaInput = document.getElementById('input-chroma');
const baseChromaInput = document.getElementById('input-base-chroma');

const valHue = document.getElementById('val-hue');
const valChroma = document.getElementById('val-chroma');
const valBaseChroma = document.getElementById('val-base-chroma');

const modeBtn = document.getElementById('mode-toggle');
const cssCodeBlock = document.getElementById('css-code');
const subtitle = document.getElementById('dynamic-subtitle');
const codeCard = document.getElementById('code-card');

// Header Elements
const infoTrigger = document.getElementById('info-trigger');
const infoDialog = document.getElementById('info-dialogue');

let isDark = false;

// --- Main Logic ---

function updatePalette() {
    const h = parseFloat(hueInput.value);
    const c = parseFloat(chromaInput.value);
    const baseC = parseFloat(baseChromaInput.value);

    // Update number inputs
    valHue.value = h;
    valChroma.value = c;
    valBaseChroma.value = baseC.toFixed(2);

    // Define Lightness
    const bgL = isDark ? 0.15 : 0.98;
    const textL = isDark ? 0.98 : 0.10;
    const accentL = isDark ? 0.70 : 0.55;

    // Generate Hex
    const bgHex = formatHex({ mode: 'oklch', l: bgL, c: baseC * 0.5, h: h });
    const textHex = formatHex({ mode: 'oklch', l: textL, c: baseC, h: h });
    const accentHex = formatHex({ mode: 'oklch', l: accentL, c: c, h: h });

    // Apply CSS Variables
    document.documentElement.style.setProperty('--bg', bgHex);
    document.documentElement.style.setProperty('--text', textHex);
    document.documentElement.style.setProperty('--accent', accentHex);
   
    // Update Slider Track Color
    const trackColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
    document.documentElement.style.setProperty('--track-color', trackColor);

    // Update displayed hex values
    document.getElementById('hex-bg').innerText = bgHex;
    document.getElementById('hex-text').innerText = textHex;
    document.getElementById('hex-accent').innerText = accentHex;

    // Update Code Block
    cssCodeBlock.innerText = `:root {
  --bg: ${bgHex};
  --text: ${textHex};
  --accent: ${accentHex};
}`;

    // Contrast Check & Subtitle
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

    subtitle.innerHTML = `Your current palette ${passOrFail} with a ${ratio}:1 contrast ratio. (<a href="${wcagLink}" target="_blank" rel="noopener noreferrer">${complianceLevel}</a>)`;

    // Update Code Card Background (Moved inside to avoid wrapper issues)
    updateCodeCardBackground();
}

function updateCodeCardBackground() {
    const codeOutput = document.querySelector('.code-output');
    if (codeOutput) {
        const codeBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';
        codeOutput.style.background = codeBg;
    }
}

// --- Event Listeners: Main App ---

hueInput.addEventListener('input', updatePalette);
chromaInput.addEventListener('input', updatePalette);
baseChromaInput.addEventListener('input', updatePalette);

valHue.addEventListener('input', () => { hueInput.value = valHue.value; updatePalette(); });
valChroma.addEventListener('input', () => { chromaInput.value = valChroma.value; updatePalette(); });
valBaseChroma.addEventListener('input', () => { baseChromaInput.value = valBaseChroma.value; updatePalette(); });

modeBtn.addEventListener('click', () => {
    isDark = !isDark;
    modeBtn.innerText = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
    updatePalette();
});

codeCard.addEventListener('click', async () => {
    const codeText = cssCodeBlock.textContent.trim();
    try {
        await navigator.clipboard.writeText(codeText);
        const hint = codeCard.querySelector('.copy-hint');
        const originalText = hint.textContent;
        hint.textContent = 'copied!';
        hint.style.opacity = '0.95';
        hint.style.fontStyle = 'normal';
        setTimeout(() => {
            hint.textContent = originalText;
            hint.style.opacity = '';
            hint.style.fontStyle = 'italic';
        }, 1800);
    } catch (err) {
        console.error('Copy failed:', err);
    }
});

// --- Event Listeners: Header Info Toggle ---

if (infoTrigger && infoDialog) {
    infoTrigger.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent document click from immediately closing it
        
        const isExpanded = infoTrigger.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            closeInfo();
        } else {
            openInfo();
        }
    });

    // Close dialogue when clicking anywhere outside
    document.addEventListener('click', (e) => {
        if (infoDialog.classList.contains('visible') && !infoDialog.contains(e.target) && e.target !== infoTrigger) {
            closeInfo();
        }
    });
} else {
    console.error("Header elements not found! Check HTML IDs.");
}

function openInfo() {
    infoTrigger.setAttribute('aria-expanded', 'true');
    infoTrigger.classList.add('active'); // Rotates the +
    infoDialog.hidden = false;
    
    // Small timeout to allow display change to register before opacity transition
    setTimeout(() => {
        infoDialog.classList.add('visible');
    }, 10);
}

function closeInfo() {
    infoTrigger.setAttribute('aria-expanded', 'false');
    infoTrigger.classList.remove('active'); // Rotates back
    infoDialog.classList.remove('visible');
    
    // Wait for transition to finish before hiding element
    setTimeout(() => {
        infoDialog.hidden = true;
    }, 200);
}

// --- Init ---
updatePalette();
