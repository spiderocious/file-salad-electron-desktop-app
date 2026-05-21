import path from 'node:path';

import { app, BrowserWindow, Menu, screen, Tray } from 'electron';

import { registerIpcHandlers } from './ipc-handlers.ts';
import { createTrayIcon } from './tray-icon.js';

// FileSalad is a macOS menu-bar app: a tray icon owns a drop-down panel window.
// There is no primary dock window — the panel toggles open under the tray item
// and hides on blur / Esc. See the PRD "Platform & shape" section.

const PANEL_WIDTH = 380;
const PANEL_HEIGHT = 520;

let tray: Tray | null = null;
let panel: BrowserWindow | null = null;

function createPanel(): BrowserWindow {
  const window = new BrowserWindow({
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT,
    show: false,
    frame: false,
    resizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Hide rather than destroy when focus is lost, so reopening is instant and
  // local state survives. Esc-to-hide is wired in the renderer via the bridge.
  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) window.hide();
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void window.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  return window;
}

function positionPanelUnderTray(window: BrowserWindow, trayInstance: Tray): void {
  const trayBounds = trayInstance.getBounds();
  const display = screen.getDisplayNearestPoint({ x: trayBounds.x, y: trayBounds.y });
  const workArea = display.workArea;

  const x = Math.round(trayBounds.x + trayBounds.width / 2 - PANEL_WIDTH / 2);
  const clampedX = Math.max(
    workArea.x,
    Math.min(x, workArea.x + workArea.width - PANEL_WIDTH),
  );
  const y = Math.round(trayBounds.y + trayBounds.height + 4);

  window.setPosition(clampedX, y, false);
}

function togglePanel(): void {
  if (!panel || !tray) return;
  if (panel.isVisible()) {
    panel.hide();
    return;
  }
  positionPanelUnderTray(panel, tray);
  panel.show();
  panel.focus();
}

function createTray(): Tray {
  const trayInstance = new Tray(createTrayIcon());
  trayInstance.setToolTip('FileSalad — drop a file, get a link');
  // A short title next to the glyph makes the item findable in a crowded menu
  // bar (the placeholder glyph is subtle). Drop the title once the real icon
  // lands.
  trayInstance.setTitle('FileSalad');

  // Left click toggles the panel; right click opens a small menu — the standard
  // way to quit a menu-bar app that has no dock or window chrome.
  trayInstance.on('click', togglePanel);
  trayInstance.on('right-click', () => {
    const menu = Menu.buildFromTemplate([
      { label: 'Open FileSalad', click: togglePanel },
      { type: 'separator' },
      { label: 'Quit FileSalad', click: () => app.quit() },
    ]);
    trayInstance.popUpContextMenu(menu);
  });

  return trayInstance;
}

app.whenReady().then(() => {
  // No dock presence — this is a menu-bar utility, not a windowed app.
  app.dock?.hide();

  registerIpcHandlers({ onPanelHide: () => panel?.hide() });
  panel = createPanel();
  tray = createTray();
});

// Keep running with no windows — the tray is the app's home. Doing nothing
// here (rather than the default quit) keeps the menu-bar app alive.
app.on('window-all-closed', () => {});
