function createAccumulated() {
  return {
    messages: [],
    taskDescription: '',
    sessionId: '',
    model: '',
    firstTs: '',
    lastTs: '',
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCacheRead: 0,
    totalCacheCreation: 0,
  };
}

function resetAccumulated(acc) {
  acc.messages.length = 0;
  acc.taskDescription = '';
  acc.sessionId = '';
  acc.model = '';
  acc.firstTs = '';
  acc.lastTs = '';
  acc.totalInputTokens = 0;
  acc.totalOutputTokens = 0;
  acc.totalCacheRead = 0;
  acc.totalCacheCreation = 0;
}

/** Parse a single JSONL line and accumulate results */
function parseLine(line, acc) {
  const entry = JSON.parse(line);
  const msg = entry.message;
  if (!msg) {
    return;
  }

  if (entry.timestamp) {
    if (!acc.firstTs) {
      acc.firstTs = entry.timestamp;
    }
    acc.lastTs = entry.timestamp;
  }

  if (!acc.sessionId && entry.sessionId) {
    acc.sessionId = entry.sessionId;
  }

  if (entry.type === 'assistant' && msg.content) {
    if (msg.model && !acc.model) {
      acc.model = msg.model;
    }
    if (msg.usage) {
      acc.totalInputTokens += msg.usage.input_tokens || 0;
      acc.totalOutputTokens += msg.usage.output_tokens || 0;
      acc.totalCacheRead += msg.usage.cache_read_input_tokens || 0;
      acc.totalCacheCreation += msg.usage.cache_creation_input_tokens || 0;
    }

    for (const block of msg.content) {
      if (block.type === 'text' && block.text) {
        acc.messages.push({
          kind: 'text',
          role: 'assistant',
          text: block.text,
          ts: entry.timestamp,
        });
      } else if (block.type === 'tool_use') {
        acc.messages.push({
          kind: 'tool_call',
          role: 'assistant',
          tool: block.name,
          input: summarizeInput(block.input),
          ts: entry.timestamp,
        });
      }
    }
  } else if (entry.type === 'user' && msg.content) {
    if (typeof msg.content === 'string') {
      if (msg.content === 'Warmup') {
        return;
      }
      if (!acc.taskDescription) {
        acc.taskDescription = msg.content;
      }
      acc.messages.push({
        kind: 'text',
        role: 'user',
        text: msg.content,
        ts: entry.timestamp,
      });
    } else if (Array.isArray(msg.content)) {
      for (const block of msg.content) {
        if (block.type === 'tool_result') {
          const content =
            typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
          acc.messages.push({
            kind: 'tool_result',
            role: 'system',
            text: content.slice(0, 2000),
            isError: block.is_error || false,
            ts: entry.timestamp,
          });
        }
      }
    }
  }
}

function summarizeInput(input) {
  if (!input) {
    return '';
  }
  // Truncate commands to prevent leaking long bash strings
  if (input.command) {
    return input.command.slice(0, 200);
  }
  if (input.pattern) {
    return `pattern: ${input.pattern}`;
  }
  if (input.file_path) {
    return input.file_path;
  }
  if (input.query) {
    return input.query;
  }
  if (input.prompt) {
    return input.prompt.slice(0, 100);
  }
  const keys = Object.keys(input);
  if (keys.length === 0) {
    return '';
  }
  return keys
    .map((k) => {
      const v = input[k];
      const s = typeof v === 'string' ? v : JSON.stringify(v);
      return `${k}: ${s.slice(0, 60)}`;
    })
    .join(', ');
}

module.exports = { createAccumulated, resetAccumulated, parseLine, summarizeInput };
