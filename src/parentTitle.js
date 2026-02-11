const vscode = require('vscode');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

/** Cache parent session titles so we only read each JSONL once */
const cache = new Map();

async function lookupParentTitle(sessionId) {
  if (cache.has(sessionId)) {
    return cache.get(sessionId);
  }

  // Validate sessionId to prevent path traversal
  if (!/^[a-zA-Z0-9_-]+$/.test(sessionId)) {
    return '';
  }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return '';
  }
  const home = process.env.HOME;
  if (!home) {
    return '';
  }

  const wsPath = workspaceFolders[0].uri.fsPath;
  const encoded = wsPath.replace(/\//g, '-');
  const parentJsonl = path.join(home, '.claude', 'projects', encoded, `${sessionId}.jsonl`);

  try {
    // Read just enough to find the first user text message (usually within first 5 lines)
    const fd = await fsPromises.open(parentJsonl, 'r');
    try {
      const buf = Buffer.alloc(8192);
      const { bytesRead } = await fd.read(buf, 0, 8192, 0);
      const chunk = buf.toString('utf8', 0, bytesRead);
      const lines = chunk.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          if (entry.type === 'user' && entry.message && entry.message.content) {
            const content = entry.message.content;
            let text = '';
            if (typeof content === 'string') {
              text = content;
            } else if (Array.isArray(content)) {
              const textBlock = content.find((b) => b.type === 'text' && b.text);
              if (textBlock) {
                text = textBlock.text;
              }
            }
            if (text) {
              const title = text.slice(0, 60) + (text.length > 60 ? '...' : '');
              cache.set(sessionId, title);
              return title;
            }
          }
        } catch {
          // Skip malformed JSONL lines
        }
      }
    } finally {
      await fd.close();
    }
  } catch {
    // Parent session file may not exist
  }

  cache.set(sessionId, '');
  return '';
}

function clearCache() {
  cache.clear();
}

module.exports = { lookupParentTitle, clearCache };
