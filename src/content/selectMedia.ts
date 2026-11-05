// Higgsfield Instant - Content Script for Media Selection & Hover Overlay
// Disassembled & adapted from official select-media.js (v1.3.2)

console.log('[Higgsfield Instant] Media selector active');

let activeHoverButton: HTMLElement | null = null;
let currentTargetImage: HTMLImageElement | null = null;

function createHoverButton() {
  const btn = document.createElement('div');
  btn.id = 'higgsfield-hover-recreate-btn';
  btn.style.position = 'absolute';
  btn.style.zIndex = '999999';
  btn.style.display = 'none';
  btn.style.alignItems = 'center';
  btn.style.gap = '6px';
  btn.style.padding = '6px 12px';
  btn.style.backgroundColor = '#0b0c0e';
  btn.style.color = '#d1fe17';
  btn.style.border = '1px solid #282b37';
  btn.style.borderRadius = '9999px';
  btn.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.6)';
  btn.style.cursor = 'pointer';
  btn.style.fontSize = '12px';
  btn.style.fontWeight = '700';
  btn.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  btn.style.transition = 'transform 0.15s ease, background-color 0.15s ease';

  btn.innerHTML = `
    <span style="font-size: 14px; font-weight: 900;">〰</span>
    <span style="color: #ffffff;">Recreate</span>
  `;

  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'scale(1.05)';
    btn.style.backgroundColor = '#181920';
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'scale(1)';
    btn.style.backgroundColor = '#0b0c0e';
  });

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!currentTargetImage) return;

    const imageUrl = currentTargetImage.src || currentTargetImage.currentSrc;
    console.log('[Higgsfield Instant] Triggered recreate on:', imageUrl);

    // Notify extension background worker
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'HIGGSFIELD_RECREATE_IMAGE',
        imageUrl
      });
    } else {
      // In standalone browser test, dispatch custom event
      window.dispatchEvent(new CustomEvent('HIGGSFIELD_RECREATE_IMAGE', { detail: { imageUrl } }));
    }
  });

  document.body.appendChild(btn);
  return btn;
}

function initMediaObserver() {
  const btn = activeHoverButton || createHoverButton();
  activeHoverButton = btn;

  document.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    // Check if target is an image or container inside Instagram, Pinterest, or X
    let img: HTMLImageElement | null = null;
    if (target.tagName.toLowerCase() === 'img') {
      img = target as HTMLImageElement;
    } else {
      img = target.querySelector('img') || target.closest('article')?.querySelector('img') || null;
    }

    if (!img || img.clientWidth < 150 || img.clientHeight < 150) {
      return;
    }

    currentTargetImage = img;
    const rect = img.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    btn.style.top = `${rect.top + scrollTop + 12}px`;
    btn.style.left = `${rect.left + scrollLeft + 12}px`;
    btn.style.display = 'flex';
  }, true);

  document.addEventListener('mousemove', (e) => {
    if (!activeHoverButton || !currentTargetImage) return;
    const btnRect = activeHoverButton.getBoundingClientRect();
    const imgRect = currentTargetImage.getBoundingClientRect();

    const inBtn = (
      e.clientX >= btnRect.left &&
      e.clientX <= btnRect.right &&
      e.clientY >= btnRect.top &&
      e.clientY <= btnRect.bottom
    );

    const inImg = (
      e.clientX >= imgRect.left &&
      e.clientX <= imgRect.right &&
      e.clientY >= imgRect.top &&
      e.clientY <= imgRect.bottom
    );

    if (!inBtn && !inImg) {
      activeHoverButton.style.display = 'none';
      currentTargetImage = null;
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMediaObserver);
} else {
  initMediaObserver();
}
