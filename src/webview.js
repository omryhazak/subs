function getWebviewHtml(nonce) {
  return /*html*/ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
<style nonce="${nonce}">
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: var(--vscode-editor-font-family, 'Menlo', monospace);
    font-size: 12px;
    background: var(--vscode-editor-background, #1e1e1e);
    color: var(--vscode-editor-foreground, #d4d4d4);
    padding: 8px;
    overflow-x: hidden;
  }
  .header {
    position: sticky;
    top: 0;
    background: var(--vscode-editor-background, #1e1e1e);
    border-bottom: 1px solid var(--vscode-panel-border, #333);
    padding: 8px 0 10px;
    margin-bottom: 8px;
    z-index: 10;
  }
  .header-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .agent-badge {
    background: #4DB6AC;
    color: #000;
    padding: 2px 8px;
    border-radius: 3px;
    font-weight: bold;
    font-size: 11px;
    flex-shrink: 0;
  }
  .status {
    font-size: 11px;
    flex-shrink: 0;
  }
  .status.running { color: #4DB6AC; }
  .status.done { color: #e8913a; }
  .header-meta {
    color: var(--vscode-descriptionForeground, #555);
    font-size: 10px;
    margin-left: auto;
  }
  .task-desc {
    margin-top: 8px;
    padding: 6px 12px 6px 26px;
    background: transparent;
    border-radius: 4px;
    font-size: 13px;
    font-weight: bold;
    color: var(--vscode-editor-foreground, #d4d4d4);
    line-height: 1.4;
    cursor: pointer;
    position: relative;
  }
  .task-desc::before {
    content: '▶';
    position: absolute;
    left: 10px;
    top: 8px;
    font-size: 8px;
    color: #4DB6AC;
    transition: transform 0.15s;
  }
  .task-desc:not(.collapsed)::before {
    transform: rotate(90deg);
  }
  .task-desc.collapsed {
    max-height: 42px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .parent-title {
    margin-top: 6px;
    font-size: 10px;
    color: var(--vscode-descriptionForeground, #888);
    padding-left: 2px;
  }
  .parent-title::before {
    content: 'from: ';
    color: var(--vscode-descriptionForeground, #555);
  }
  .msg {
    margin-bottom: 8px;
    padding: 6px 12px 6px 26px;
    border-radius: 4px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
    position: relative;
    background: transparent;
  }
  .msg::before {
    content: '';
    position: absolute;
    left: 10px;
    top: 12px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
  .msg.text {
    white-space: normal;
  }
  .msg.text::before {
    background: #4DB6AC;
  }
  .msg.user-text {
    opacity: 0.7;
    font-size: 11px;
    white-space: normal;
  }
  .msg.user-text::before {
    background: #569cd6;
  }
  .msg.tool-call {
    font-size: 11px;
    color: var(--vscode-descriptionForeground, #999);
  }
  .msg.tool-call::before {
    background: #e8913a;
  }
  .msg.tool-result {
    font-size: 10px;
    color: var(--vscode-descriptionForeground, #777);
    max-height: 120px;
    overflow-y: auto;
    white-space: normal;
  }
  .msg.tool-result::before {
    background: var(--vscode-panel-border, #555);
  }
  .msg.tool-result.error {
    color: #f44747;
  }
  .msg.tool-result.error::before {
    background: #f44747;
  }
  .tool-name {
    color: #e8913a;
    font-weight: bold;
  }
  .ts {
    float: right;
    color: var(--vscode-descriptionForeground, #555);
    font-size: 10px;
  }

  /* Final result highlight */
  .result-banner {
    margin: 12px 0 6px;
    padding: 6px 12px 6px 26px;
    background: transparent;
    border-radius: 4px;
    font-size: 11px;
    font-weight: bold;
    color: #e8913a;
    position: relative;
  }
  .result-banner::before {
    content: '';
    position: absolute;
    left: 10px;
    top: 10px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #e8913a;
  }
  .msg.final-result {
    background: transparent;
  }
  .msg.final-result::before {
    background: #e8913a;
    width: 7px;
    height: 7px;
  }

  /* Markdown styles */
  .md-h1, .md-h2, .md-h3 { font-weight: bold; margin: 6px 0 3px; }
  .md-h1 { font-size: 15px; border-bottom: 1px solid var(--vscode-panel-border, #444); padding-bottom: 3px; }
  .md-h2 { font-size: 13px; }
  .md-h3 { font-size: 12px; color: var(--vscode-descriptionForeground, #aaa); }
  .md-hr { border: none; border-top: 1px solid var(--vscode-panel-border, #444); margin: 6px 0; }
  .md-code {
    background: var(--vscode-textCodeBlock-background, rgba(127,127,127,0.15));
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 11px;
    font-family: var(--vscode-editor-font-family, monospace);
  }
  .md-pre {
    background: var(--vscode-textCodeBlock-background, rgba(127,127,127,0.15));
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 11px;
    margin: 4px 0;
    overflow-x: auto;
    white-space: pre;
    font-family: var(--vscode-editor-font-family, monospace);
  }
  .md-bold { font-weight: bold; }
  .md-italic { font-style: italic; }
  .md-li { padding-left: 12px; }
  .md-li::before { content: '\\2022 '; opacity: 0.5; }
  .md-p { margin: 3px 0; }

  /* Status bar */
  .status-bar {
    position: sticky;
    bottom: 0;
    background: var(--vscode-statusBar-background, #007acc);
    color: var(--vscode-statusBar-foreground, #fff);
    font-size: 11px;
    padding: 3px 10px;
    display: flex;
    gap: 14px;
    align-items: center;
    border-top: 1px solid var(--vscode-panel-border, #333);
    z-index: 10;
    margin: 0 -8px -8px;
  }
  .status-bar .stat {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .status-bar .stat-label {
    opacity: 0.7;
    font-size: 10px;
  }
  .status-bar .stat-value {
    font-weight: bold;
  }
  .status-bar .model-tag {
    background: rgba(127,127,127,0.25);
    padding: 1px 6px;
    border-radius: 3px;
    font-size: 10px;
    margin-left: auto;
  }
</style>
</head>
<body>
  <div class="header">
    <div class="header-row">
      <span class="agent-badge" id="badge"></span>
      <span class="status running" id="status">Running...</span>
      <span class="header-meta" id="msgCount"></span>
    </div>
    <div class="parent-title" id="parentTitle" style="display:none"></div>
    <div class="task-desc collapsed" id="taskDesc" style="display:none"><span id="taskDescText"></span></div>
  </div>
  <div id="messages"></div>
  <div class="status-bar" id="statusBar">
    <div class="stat"><span class="stat-label">elapsed</span> <span class="stat-value" id="sbTime">--</span></div>
    <div class="stat"><span class="stat-label">in</span> <span class="stat-value" id="sbIn">0</span></div>
    <div class="stat"><span class="stat-label">out</span> <span class="stat-value" id="sbOut">0</span></div>
    <div class="stat"><span class="stat-label">cache read</span> <span class="stat-value" id="sbCacheR">0</span></div>
    <div class="stat"><span class="stat-label">cache write</span> <span class="stat-value" id="sbCacheW">0</span></div>
    <span class="model-tag" id="sbModel"></span>
  </div>

<script nonce="${nonce}">
  (function() {
    var container = document.getElementById('messages');
    var statusEl = document.getElementById('status');
    var countEl = document.getElementById('msgCount');
    var badgeEl = document.getElementById('badge');
    var taskDescEl = document.getElementById('taskDesc');
    var taskDescText = document.getElementById('taskDescText');
    var parentTitleEl = document.getElementById('parentTitle');
    var sbTime = document.getElementById('sbTime');
    var sbIn = document.getElementById('sbIn');
    var sbOut = document.getElementById('sbOut');
    var sbCacheR = document.getElementById('sbCacheR');
    var sbCacheW = document.getElementById('sbCacheW');
    var sbModel = document.getElementById('sbModel');

    // Collapsible task description
    taskDescEl.addEventListener('click', function() {
      taskDescEl.classList.toggle('collapsed');
    });

    function formatTokens(n) {
      if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
      if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
      return String(n);
    }

    function formatElapsed(firstTs, lastTs) {
      if (!firstTs || !lastTs) return '--';
      var ms = new Date(lastTs) - new Date(firstTs);
      var secs = Math.floor(ms / 1000);
      if (secs < 60) return secs + 's';
      var mins = Math.floor(secs / 60);
      var remSecs = secs % 60;
      return mins + 'm ' + remSecs + 's';
    }

    /** Safe markdown-to-DOM renderer (no innerHTML, all textContent) */
    function renderMarkdown(text) {
      var frag = document.createDocumentFragment();
      var lines = text.split('\\n');
      var i = 0;
      while (i < lines.length) {
        var line = lines[i];
        if (line.trimStart().indexOf('\`\`\`') === 0) {
          var pre = document.createElement('div');
          pre.className = 'md-pre';
          var codeLines = [];
          i++;
          while (i < lines.length && lines[i].trimStart().indexOf('\`\`\`') !== 0) {
            codeLines.push(lines[i]);
            i++;
          }
          pre.textContent = codeLines.join('\\n');
          frag.appendChild(pre);
          i++;
          continue;
        }
        if (/^---+$/.test(line.trim())) {
          var hr = document.createElement('div');
          hr.className = 'md-hr';
          frag.appendChild(hr);
          i++;
          continue;
        }
        var hMatch = line.match(/^(#{1,3})\\s+(.+)/);
        if (hMatch) {
          var hEl = document.createElement('div');
          hEl.className = 'md-h' + hMatch[1].length;
          renderInline(hMatch[2], hEl);
          frag.appendChild(hEl);
          i++;
          continue;
        }
        if (/^\\s*[-*]\\s+/.test(line)) {
          var li = document.createElement('div');
          li.className = 'md-li';
          renderInline(line.replace(/^\\s*[-*]\\s+/, ''), li);
          frag.appendChild(li);
          i++;
          continue;
        }
        if (/^\\s*\\d+\\.\\s+/.test(line)) {
          var nli = document.createElement('div');
          nli.className = 'md-li';
          var numMatch = line.match(/^\\s*(\\d+\\.)\\s+(.*)/);
          if (numMatch) {
            var numSpan = document.createElement('span');
            numSpan.style.opacity = '0.5';
            numSpan.textContent = numMatch[1] + ' ';
            nli.appendChild(numSpan);
            renderInline(numMatch[2], nli);
          }
          frag.appendChild(nli);
          i++;
          continue;
        }
        if (line.trim() === '') { i++; continue; }
        var p = document.createElement('div');
        p.className = 'md-p';
        renderInline(line, p);
        frag.appendChild(p);
        i++;
      }
      return frag;
    }

    /** Render inline markdown safely into parent element */
    function renderInline(text, parent) {
      var pattern = /(\`[^\`]+\`|\\*\\*[^*]+\\*\\*|\\*[^*]+\\*)/g;
      var lastIdx = 0;
      var m;
      while ((m = pattern.exec(text)) !== null) {
        if (m.index > lastIdx) {
          parent.appendChild(document.createTextNode(text.slice(lastIdx, m.index)));
        }
        var tok = m[0];
        var span = document.createElement('span');
        if (tok.charAt(0) === '\`') {
          span.className = 'md-code';
          span.textContent = tok.slice(1, -1);
        } else if (tok.indexOf('**') === 0) {
          span.className = 'md-bold';
          span.textContent = tok.slice(2, -2);
        } else if (tok.charAt(0) === '*') {
          span.className = 'md-italic';
          span.textContent = tok.slice(1, -1);
        }
        parent.appendChild(span);
        lastIdx = m.index + tok.length;
      }
      if (lastIdx < text.length) {
        parent.appendChild(document.createTextNode(text.slice(lastIdx)));
      }
    }

    var lastCount = 0;
    var autoScroll = true;

    window.addEventListener('scroll', function() {
      var atBottom = (window.innerHeight + window.scrollY) >= document.body.scrollHeight - 30;
      autoScroll = atBottom;
    });

    window.addEventListener('message', function(event) {
      var data = event.data;

      if (data.type === 'init') {
        badgeEl.textContent = data.agentId || '';
        return;
      }

      if (data.type !== 'update') return;
      var messages = data.messages;
      if (messages.length === lastCount && !data.done) return;
      lastCount = messages.length;

      if (data.taskDescription) {
        taskDescText.textContent = data.taskDescription;
        taskDescEl.style.display = 'block';
      }

      if (data.parentTitle) {
        parentTitleEl.textContent = data.parentTitle;
        parentTitleEl.style.display = 'block';
      }

      if (data.done) {
        statusEl.textContent = 'Done';
        statusEl.className = 'status done';
      } else {
        statusEl.textContent = 'Running...';
        statusEl.className = 'status running';
      }

      var lastAssistantTextIdx = -1;
      for (var i = messages.length - 1; i >= 0; i--) {
        if (messages[i].kind === 'text' && messages[i].role === 'assistant') {
          lastAssistantTextIdx = i;
          break;
        }
      }

      container.textContent = '';
      var textCount = 0;
      var toolCount = 0;

      for (var i = 0; i < messages.length; i++) {
        var msg = messages[i];

        if (data.done && i === lastAssistantTextIdx) {
          var banner = document.createElement('div');
          banner.className = 'result-banner';
          banner.textContent = 'RETURNED TO MAIN SESSION:';
          container.appendChild(banner);
        }

        var div = document.createElement('div');
        div.classList.add('msg');

        if (msg.kind === 'text' && msg.role === 'assistant') {
          div.classList.add('text');
          if (data.done && i === lastAssistantTextIdx) {
            div.classList.add('final-result');
          }
          div.appendChild(renderMarkdown(msg.text));
          textCount++;
        } else if (msg.kind === 'text' && msg.role === 'user') {
          div.classList.add('user-text');
          var userPrefix = document.createElement('span');
          userPrefix.style.opacity = '0.5';
          userPrefix.textContent = '> ';
          div.appendChild(userPrefix);
          div.appendChild(renderMarkdown(msg.text));
        } else if (msg.kind === 'tool_call') {
          div.classList.add('tool-call');
          var toolSpan = document.createElement('span');
          toolSpan.className = 'tool-name';
          toolSpan.textContent = msg.tool;
          div.appendChild(toolSpan);
          div.appendChild(document.createTextNode(' ' + (msg.input || '')));
          toolCount++;
        } else if (msg.kind === 'tool_result') {
          div.classList.add('tool-result');
          if (msg.isError) div.classList.add('error');
          div.appendChild(renderMarkdown(msg.text));
        }

        if (msg.ts) {
          var span = document.createElement('span');
          span.className = 'ts';
          span.textContent = new Date(msg.ts).toLocaleTimeString();
          div.prepend(span);
        }

        container.appendChild(div);
      }

      countEl.textContent = textCount + ' msgs, ' + toolCount + ' tools';

      if (data.stats) {
        var s = data.stats;
        sbTime.textContent = formatElapsed(s.firstTs, s.lastTs);
        sbIn.textContent = formatTokens(s.totalInputTokens);
        sbOut.textContent = formatTokens(s.totalOutputTokens);
        sbCacheR.textContent = formatTokens(s.totalCacheRead);
        sbCacheW.textContent = formatTokens(s.totalCacheCreation);
        if (s.model) {
          var friendly = s.model
            .replace('claude-', '')
            .replace(/-\\d{8}$/, '');
          sbModel.textContent = friendly;
        }
      }

      if (autoScroll) {
        window.scrollTo(0, document.body.scrollHeight);
      }
    });
  })();
</script>
</body>
</html>`;
}

module.exports = { getWebviewHtml };
