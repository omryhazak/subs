const vscode = require('vscode');

function getTasksDirs() {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length === 0) {
    return [];
  }

  const wsPath = workspaceFolders[0].uri.fsPath;
  const encoded = wsPath.replace(/\//g, '-');

  return [
    `/private/tmp/claude/${encoded}/tasks`,
    `/private/tmp/claude-${process.getuid()}/${encoded}/tasks`,
  ];
}

module.exports = { getTasksDirs };
