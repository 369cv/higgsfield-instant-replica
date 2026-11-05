// Higgsfield Instant - Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Higgsfield Instant] Extension installed');

  // Create context menu item
  chrome.contextMenus.create({
    id: 'higgsfield-recreate-context',
    title: 'Recreate with Higgsfield Instant',
    contexts: ['image', 'link']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'higgsfield-recreate-context' && tab?.id) {
    const targetUrl = info.srcUrl || info.linkUrl;
    if (targetUrl) {
      chrome.storage.local.set({ lastRecreateImage: targetUrl }, () => {
        // Open side panel
        if (chrome.sidePanel && typeof chrome.sidePanel.open === 'function') {
          if (tab.windowId) {
            (chrome.sidePanel.open as any)({ windowId: tab.windowId });
          } else {
            (chrome.sidePanel.open as any)({ tabId: tab.id });
          }
        }
      });
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'HIGGSFIELD_RECREATE_IMAGE' && sender.tab?.id) {
    const imageUrl = message.imageUrl;
    chrome.storage.local.set({ lastRecreateImage: imageUrl }, () => {
      if (chrome.sidePanel && typeof chrome.sidePanel.open === 'function') {
        if (sender.tab?.windowId) {
          (chrome.sidePanel.open as any)({ windowId: sender.tab.windowId });
        } else if (sender.tab?.id) {
          (chrome.sidePanel.open as any)({ tabId: sender.tab.id });
        }
      }
    });
    sendResponse({ received: true });
  }
  return true;
});
