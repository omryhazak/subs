const vscode = require('vscode');
const { startWatching, stopWatching } = require('./watcher');

/** @type {vscode.StatusBarItem} */
let statusBar;
/** @type {vscode.OutputChannel} */
let outputChannel;

function activate(context) {
  outputChannel = vscode.window.createOutputChannel('Subs');

  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
  statusBar.command = 'subs.start';
  statusBar.text = '$(eye) Subs';
  statusBar.tooltip = 'Click to start watching';
  statusBar.show();
  context.subscriptions.push(statusBar);

  context.subscriptions.push(
    vscode.commands.registerCommand('subs.start', () => {
      return startWatching(context, statusBar, outputChannel).catch((err) => {
        outputChannel.appendLine('[Subs] Failed to start: ' + err.message);
      });
    }),
    vscode.commands.registerCommand('subs.stop', () => {
      return stopWatching(statusBar, outputChannel);
    })
  );

  startWatching(context, statusBar, outputChannel).catch((err) => {
    outputChannel.appendLine('[Subs] Auto-start failed: ' + err.message);
  });
}

function deactivate() {
  if (statusBar) {
    stopWatching(statusBar);
  }
}

module.exports = { activate, deactivate };
