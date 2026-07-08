#!/usr/bin/env node
// @ai-native-solutions/quine-cube-runner-api
// HTTP REST proxy for @ai-native-solutions/quine-cube-runner-sdk.
// Zero external deps beyond Node + the SDK. Sandboxed execution via
// node:vm inside the SDK. Requests have a hard timeout.

import { createServer } from 'node:http';
import {
  VERSION,
  loadTemplate, listTemplates, detectLang,
  run, verify, mutateReplace
} from '@ai-native-solutions/quine-cube-runner-sdk';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4300;
const HOST = process.env.HOST || '0.0.0.0';
const RUN_TIMEOUT_MS = process.env.RUN_TIMEOUT_MS ? Number(process.env.RUN_TIMEOUT_MS) : 2000;

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type'
};

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json', ...CORS });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let s = '';
    req.on('data', c => { s += c; if (s.length > 1e6) reject(new Error('body too large')); });
    req.on('end', () => { try { resolve(s ? JSON.parse(s) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

const ROUTES = {
  'GET /': () => ({
    name: '@ai-native-solutions/quine-cube-runner-api',
    version: VERSION,
    sdk_version: VERSION,
    description: 'HTTP proxy for the sovereign Quine Cube Runner SDK',
    endpoints: [
      'GET  /              this metadata',
      'GET  /health        health check',
      'GET  /templates     list the 10 built-in templates',
      'GET  /templates/:k  load one template by key',
      'POST /run           body: { source, language }',
      'POST /verify        body: { source, output }',
      'POST /mutate        body: { source, position, char?, language }'
    ]
  }),
  'GET /health':    () => ({ ok: true, ts: new Date().toISOString(), sdk: VERSION }),
  'GET /templates': () => ({ templates: listTemplates() }),
  'POST /run': async (b) => {
    if (!b.source || !b.language) throw new Error('source and language required');
    const res = await run(String(b.source), String(b.language), { timeoutMs: RUN_TIMEOUT_MS });
    const v = res.ok ? verify(b.source, res.output) : { identical: false };
    return { output: res.output, ok: res.ok, valid: !!v.identical, simulated: !!res.simulated, error: res.error };
  },
  'POST /verify': (b) => {
    if (b.source === undefined || b.output === undefined) throw new Error('source and output required');
    return verify(String(b.source), String(b.output));
  },
  'POST /mutate': async (b) => {
    if (!b.source || b.position === undefined || !b.language) throw new Error('source, position, language required');
    return mutateReplace(String(b.source), Number(b.position), String(b.char ?? ''), String(b.language));
  }
};

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const path = url.pathname;

  // Dynamic route: GET /templates/:key
  if (req.method === 'GET' && path.startsWith('/templates/')) {
    const key = decodeURIComponent(path.slice('/templates/'.length));
    try {
      const source = loadTemplate(key);
      return send(res, 200, { key, source, bytes: source.length, runsIn: detectLang(key) });
    } catch (e) {
      return send(res, 404, { error: e.message });
    }
  }

  const key = `${req.method} ${path}`;
  const handler = ROUTES[key];
  if (!handler) return send(res, 404, { error: `no route for ${key}` });
  try {
    const body = req.method === 'POST' ? await readBody(req) : {};
    const out = await handler(body);
    send(res, 200, out);
  } catch (e) {
    send(res, 400, { error: e.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`quine-cube-runner-api · listening on http://${HOST}:${PORT} · sdk v${VERSION}`);
});
