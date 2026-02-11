const vscode = require('vscode');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const { getTasksDirs } = require('./tasksDirs');
const { openAgentPanel, hasPanel, disposeAllPanels } = require('./panel');
const { clearCache } = require('./parentTitle');

/** @type {fs.FSWatcher[]} */
let dirWatchers = [];

async function startWatching(context, statusBar, outputChannel) {
  const tasksDirs = getTasksDirs();

  if (tasksDirs.length === 0) {
    vscode.window.showWarningMessage('No workspace folder found');
    return;
  }

  for (const w of dirWatchers) {
    w.close();
  }
  dirWatchers = [];

  const watchedDirs = [];

  for (const tasksDir of tasksDirs) {
    await fsPromises.mkdir(tasksDir, { recursive: true, mode: 0o700 });

    // Verify it's a real directory, not a symlink (pre-creation attack mitigation)
    const dirStat = await fsPromises.lstat(tasksDir);
    if (!dirStat.isDirectory()) {
      continue;
    }

    const watcher = fs.watch(tasksDir, (_event, filename) => {
      if (!filename || !filename.endsWith('.output')) {
        return;
      }

      if (hasPanel(filename)) {
        return;
      }

      const filePath = path.join(tasksDir, filename);

      setTimeout(() => {
        openAgentPanel(filePath, filename, context, statusBar, outputChannel).catch((err) => {
          outputChannel.appendLine('[Subs] Failed to open panel: ' + err.message);
        });
      }, 300);
    });

    watcher.on('error', (err) => {
      outputChannel.appendLine('[Subs] Watcher error: ' + err.message);
    });

    dirWatchers.push(watcher);
    watchedDirs.push(tasksDir);

    // Pick up existing recent .output files
    try {
      const existing = (await fsPromises.readdir(tasksDir)).filter((f) => f.endsWith('.output'));

      for (const f of existing) {
        const filePath = path.join(tasksDir, f);
        try {
          const stat = await fsPromises.stat(filePath);
          const ageMs = Date.now() - stat.mtimeMs;

          if (ageMs < 5 * 60 * 1000 && !hasPanel(f)) {
            openAgentPanel(filePath, f, context, statusBar, outputChannel).catch((err) => {
              outputChannel.appendLine('[Subs] Failed to open panel: ' + err.message);
            });
          }
        } catch {
          // File may have been removed between readdir and stat
        }
      }
    } catch {
      // Directory may have been removed
    }
  }

  statusBar.text = '$(eye) Subs (watching)';
  statusBar.tooltip = 'Watching: ' + watchedDirs.join(', ');
  vscode.window.showInformationMessage(`Watching ${watchedDirs.length} task dirs`);
}

function stopWatching(statusBar, outputChannel) {
  for (const w of dirWatchers) {
    w.close();
  }
  dirWatchers = [];
  disposeAllPanels();
  clearCache();
  statusBar.text = '$(eye) Subs';
  statusBar.tooltip = 'Click to start watching';
}

module.exports = { startWatching, stopWatching };
