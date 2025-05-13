let zapperActive = false;
let lastHoveredElement = null;

const ZAPPER_STYLE_ID = 'element-zapper-style';
const ZAPPER_HIGHLIGHT_CLASS = 'zapper-highlight-element';

function addZapperStyles() {
  if (document.getElementById(ZAPPER_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = ZAPPER_STYLE_ID;
  style.textContent = `
    .${ZAPPER_HIGHLIGHT_CLASS} {
      outline: 2px dashed red !important;
      cursor: crosshair !important;
    }
  `;
  document.head.appendChild(style);
}

function removeZapperStyles() {
  const style = document.getElementById(ZAPPER_STYLE_ID);
  if (style) {
    style.remove();
  }
}

function handleMouseOver(event) {
  if (!zapperActive) return;
  if (lastHoveredElement) {
    lastHoveredElement.classList.remove(ZAPPER_HIGHLIGHT_CLASS);
  }
  lastHoveredElement = event.target;
  if (lastHoveredElement && lastHoveredElement !== document.body && lastHoveredElement !== document.documentElement) {
    lastHoveredElement.classList.add(ZAPPER_HIGHLIGHT_CLASS);
  }
}

function handleClick(event) {
  if (!zapperActive) return;

  event.preventDefault();
  event.stopPropagation();

  if (event.target && event.target !== document.body && event.target !== document.documentElement) {
    event.target.style.display = 'none';
    // Remove highlight after clicking
    event.target.classList.remove(ZAPPER_HIGHLIGHT_CLASS);
    lastHoveredElement = null; // Reset last hovered element
  }
  return false; // Prevent further propagation
}

function activateZapper() {
  if (zapperActive) return;
  zapperActive = true;
  addZapperStyles();
  document.addEventListener('mouseover', handleMouseOver, true);
  document.addEventListener('click', handleClick, true);
  console.log("Element Zapper activated on page.");
}

function deactivateZapper() {
  if (!zapperActive) return;
  zapperActive = false;
  if (lastHoveredElement) {
    lastHoveredElement.classList.remove(ZAPPER_HIGHLIGHT_CLASS);
    lastHoveredElement = null;
  }
  removeZapperStyles();
  document.removeEventListener('mouseover', handleMouseOver, true);
  document.removeEventListener('click', handleClick, true);
  console.log("Element Zapper deactivated on page.");
}

// Listen for messages from the background script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === "initZapper") {
    activateZapper();
  } else if (message.command === "deactivateZapper") {
    deactivateZapper();
  }
});

// Ensure zapper is deactivated if script is reloaded or tab is navigated
// This is a simple way, a more robust state management might be needed for complex scenarios.
// Check initial state (e.g., if script injected while zapper should be on)
// This is tricky because content scripts can be persistent or re-injected.
// The background script now controls activation via messages.