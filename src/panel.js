const vscode = require('vscode');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const crypto = require('crypto');
const { getTasksDirs } = require('./tasksDirs');
const { parseLine, createAccumulated, resetAccumulated } = require('./parser');
const { lookupParentTitle } = require('./parentTitle');
const { getWebviewHtml } = require('./webview');

/** @type {Map<string, {panel: vscode.WebviewPanel, interval: NodeJS.Timer, disposed: boolean}>} */
const activePanels = new Map();

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PANELS = 20;

async function resolveFile(filePath) {
  try {
    return await fsPromises.realpath(filePath);
  } catch {
    return null;
  }
}

async function openAgentPanel(filePath, filename, context, statusBar, outputChannel) {
  if (activePanels.size >= MAX_PANELS) {
    return;
  }

  const realPath = await resolveFile(filePath);
  if (!realPath) {
    return;
  }

  const agentId = filename.replace('.output', '');

  // Validate that the SYMLINK (not target) is within expected task directories
  // The .output files are symlinks to ~/.claude/projects/.../agent-*.jsonl
  const allowedDirs = getTasksDirs();
  const isAllowed = allowedDirs.some(
    (dir) => filePath.startsWith(dir + path.sep) || filePath === path.join(dir, filename)
  );
  if (!isAllowed) {
    return;
  }

  // Generate cryptographic nonce for CSP
  const nonce = crypto.randomBytes(16).toString('hex');

  const panel = vscode.window.createWebviewPanel(
    'subs',
    `Sub: ${agentId}`,
    { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
    { enableScripts: true, retainContextWhenHidden: true, localResourceRoots: [] }
  );

  panel.iconPath = vscode.Uri.joinPath(context.extensionUri, 'images', 'subs-icon_128.png');
  panel.webview.html = getWebviewHtml(nonce);

  // Send agentId via postMessage (not template interpolation — prevents </script> injection)
  panel.webview.postMessage({ type: 'init', agentId });

  // Incremental parsing state
  let bytesRead = 0;
  let leftover = '';
  let polling = false;
  let disposed = false;
  const accumulated = createAccumulated();
  let lastChangeTime = Date.now();
  let markedDone = false;

  async function pollFile() {
    if (disposed || polling) {
      return;
    }
    polling = true;
    try {
      const stat = await fsPromises.stat(realPath);
      if (stat.size > MAX_FILE_SIZE) {
        return;
      }

      // Handle file truncation (unlikely for append-only JSONL, but defensive)
      if (stat.size < bytesRead) {
        bytesRead = 0;
        leftover = '';
        resetAccumulated(accumulated);
      }

      const hasNewData = stat.size > bytesRead;

      if (hasNewData) {
        lastChangeTime = Date.now();
        markedDone = false;

        // Read only new bytes (incremental)
        const fd = await fsPromises.open(realPath, 'r');
        try {
          const newSize = stat.size - bytesRead;
          const buf = Buffer.alloc(newSize);
          const result = await fd.read(buf, 0, newSize, bytesRead);
          if (result.bytesRead > 0) {
            bytesRead += result.bytesRead;
            const chunk = leftover + buf.toString('utf8', 0, result.bytesRead);
            const lines = chunk.split('\n');
            leftover = lines.pop() || ''; // Keep partial last line

            for (const line of lines) {
              if (!line.trim()) {
                continue;
              }
              try {
                parseLine(line, accumulated);
              } catch {
                // Skip malformed JSONL lines
              }
            }
          }
        } finally {
          await fd.close();
        }

        await sendUpdate(panel, accumulated, false);

        // Update tab title with task description
        if (accumulated.taskDescription) {
          const short = accumulated.taskDescription.slice(0, 50);
          panel.title = short + (accumulated.taskDescription.length > 50 ? '...' : '');
        }
      }

      // Detect completion: no changes for 5 seconds
      if (!markedDone && !hasNewData && Date.now() - lastChangeTime > 5000 && bytesRead > 0) {
        markedDone = true;
        await sendUpdate(panel, accumulated, true);
        panel.title = '[Done] ' + (panel.title || agentId);
      }
    } catch {
      // File may have been removed or become inaccessible
    } finally {
      polling = false;
    }
  }

  const interval = setInterval(pollFile, 400);
  pollFile();

  const entry = { panel, interval, disposed: false };

  panel.onDidDispose(() => {
    disposed = true;
    entry.disposed = true;
    clearInterval(interval);
    activePanels.delete(filename);
    statusBar.text =
      activePanels.size > 0 ? `$(eye) Subs (${activePanels.size})` : '$(eye) Subs (watching)';
  });

  activePanels.set(filename, entry);
  statusBar.text = `$(eye) Subs (${activePanels.size})`;
}

async function sendUpdate(panel, accumulated, done) {
  try {
    const parentTitle = accumulated.sessionId ? await lookupParentTitle(accumulated.sessionId) : '';
    panel.webview.postMessage({
      type: 'update',
      messages: accumulated.messages,
      taskDescription: accumulated.taskDescription,
      parentTitle,
      stats: {
        model: accumulated.model,
        firstTs: accumulated.firstTs,
        lastTs: accumulated.lastTs,
        totalInputTokens: accumulated.totalInputTokens,
        totalOutputTokens: accumulated.totalOutputTokens,
        totalCacheRead: accumulated.totalCacheRead,
        totalCacheCreation: accumulated.totalCacheCreation,
      },
      done,
    });
  } catch {
    // Panel may have been disposed during async operation
  }
}

function hasPanel(filename) {
  return activePanels.has(filename);
}

function disposeAllPanels() {
  for (const [key, entry] of activePanels) {
    clearInterval(entry.interval);
    entry.disposed = true;
    entry.panel.dispose();
  }
  activePanels.clear();
}

function getPanelCount() {
  return activePanels.size;
}

module.exports = { openAgentPanel, hasPanel, disposeAllPanels, getPanelCount };
