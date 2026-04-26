/** Opens or focuses the floating panel window (MV3 service worker). */

const PANEL_PAGE = "panel.html";
/** Must match TARGET_TAB_SESSION_KEY in tabContext.ts */
const TARGET_TAB_SESSION_KEY = "rummageDeepTargetTabId";

function canRememberUrl(url: string | undefined): boolean {
  if (!url) return false;
  if (!url.startsWith("http://") && !url.startsWith("https://")) return false;
  if (url.startsWith("https://chrome.google.com/webstore")) return false;
  if (url.startsWith("https://microsoftedge.microsoft.com/addons")) return false;
  return true;
}

function rememberTab(tab: chrome.tabs.Tab | undefined): void {
  if (tab?.id == null || !canRememberUrl(tab.url)) return;
  void chrome.storage.session.set({ [TARGET_TAB_SESSION_KEY]: tab.id });
}

async function captureActiveTabFromLastFocusedBrowserWindow(): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    rememberTab(tab);
  } catch {
    /* ignore */
  }
}

chrome.action.onClicked.addListener(async () => {
  await captureActiveTabFromLastFocusedBrowserWindow();

  const url = chrome.runtime.getURL(PANEL_PAGE);
  const windows = await chrome.windows.getAll({ populate: true });
  for (const win of windows) {
    for (const tab of win.tabs ?? []) {
      if (tab.url === url && win.id != null) {
        await chrome.windows.update(win.id, { focused: true });
        return;
      }
    }
  }
  await chrome.windows.create({
    url,
    type: "popup",
    width: 420,
    height: 640,
    focused: true,
  });
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;
  void (async () => {
    try {
      const w = await chrome.windows.get(windowId, { populate: true });
      if (w.type !== "normal") return;
      const tab = w.tabs?.find((t) => t.active);
      rememberTab(tab);
    } catch {
      /* ignore */
    }
  })();
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  void (async () => {
    try {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      rememberTab(tab);
    } catch {
      /* ignore */
    }
  })();
});
