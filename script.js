// selecting dom elements
const hueInput = document.getElementById('input-hue');
const chromaInput = document.getElementById('input-chroma');
const modeBtn = document.getElementById('mode-toggle');
const cssDisplay = document.getElementById('css-code');
const badge = document.getElementById('contrast-badge');

let isDark = false;

// update function
function updatePalette() {
    const h = parseFloat(hueInput.value);
    const c = parseFloat(chromaInput.value);
    
    // setting lightness
    const bgL = isDark ? 0.1 : 0.98;
    const textL = isDark ? 0.95 : 0.15;
    const accentL = isDark ? 0.75 : 0.55;

    // creating oklch objects for culori
    const bgObj = { mode: 'oklch', l: bgL, c: 0.02, h: h };
    const textObj = { mode: 'oklch', l: textL, c: 0.02, h: h };
    const accentObj = { mode: 'oklch', l: accentL, c: c, h: h };

    // converting to hex strings
    const bgHex = culori.formatHex(bgObj);
    const textHex = culori.formatHex(textObj);
    const accentHex = culori.formatHex(accentObj);

    // updating css variables
    document.documentElement.style.setProperty('--bg', bgHex);
    document.documentElement.style.setProperty('--text', textHex);
    document.documentElement.style.setProperty('--accent', accentHex);

    // updating labels
    document.getElementById('hex-bg').innerText = bgHex;
    document.getElementById('hex-text').innerText = textHex;
    document.getElementById('hex-accent').innerText = accentHex;
    document.getElementById('val-hue').innerText = h;
    document.getElementById('val-chroma').innerText = c;

    // check accessibility 
    const contrast = culori.wcagContrast(accentHex, bgHex);
    if (contrast < 4.5) {
        badge.innerText = `FAIL (${contrast.toFixed(2)})`;
        badge.style.backgroundColor = '#ff4444';
        badge.style.color = 'white';
    } else {
        badge.innerText = `PASS (${contrast.toFixed(2)})`;
        badge.style.backgroundColor = 'var(--bg)';
        badge.style.color = 'var(--text)';
    }

    // update code block
    cssDisplay.innerText = `:root {
  --color-primary: ${bgHex};
  --color-secondary: ${textHex};
  --color-accent: ${accentHex};
}`;
}

// event listeners
hueInput.addEventListener('input', updatePalette);
chromaInput.addEventListener('input', updatePalette);

modeBtn.addEventListener('click', () => {
    isDark = !isDark;
    modeBtn.innerText = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
    updatePalette();
});

// initialize
updatePalette();