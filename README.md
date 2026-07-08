# @ai-native-solutions/quine-cube-runner-api

HTTP REST proxy for **[@ai-native-solutions/quine-cube-runner-sdk](https://github.com/sjgant80-hub/quine-cube-runner-sdk)** — load templates, run in a sandbox, byte-verify, mutation-test, over plain HTTP.

Zero external deps beyond Node and the SDK. Sandboxed execution via `node:vm` inside the SDK, hard timeout per request.

## Run

```bash
# npm
npx @ai-native-solutions/quine-cube-runner-api
# → listening on http://0.0.0.0:4300

# docker
docker compose up --build
```

Env vars: `PORT` (default 4300), `HOST` (default 0.0.0.0), `RUN_TIMEOUT_MS` (default 2000).

## Endpoints

| method | path              | body / notes                                     |
|--------|-------------------|--------------------------------------------------|
| GET    | `/`               | Metadata + endpoint list                         |
| GET    | `/health`         | `{ ok, ts, sdk }`                                |
| GET    | `/templates`      | List all ten templates                           |
| GET    | `/templates/:key` | Load one template (`js`, `minimal`, `haiku`, …) |
| POST   | `/run`            | `{ source, language }` → `{ output, ok, valid, simulated?, error? }` |
| POST   | `/verify`         | `{ source, output }` → `{ identical, diff, matchedLines, totalLines, sourceBytes, outputBytes }` |
| POST   | `/mutate`         | `{ source, position, char?, language }` — empty/omitted char = delete |

## Curl

```bash
curl -s localhost:4300/templates/minimal
# → { "key":"minimal", "source":"(f=>f(f))(f=>console.log('(f=>f(f))('+f+')'))", "bytes":43, "runsIn":"js" }

curl -s -XPOST localhost:4300/run -H content-type:application/json \
  -d '{"source":"(f=>f(f))(f=>console.log(`(f=>f(f))(${f})`))","language":"haiku"}'
# → { "output":"(f=>f(f))(f=>console.log(`(f=>f(f))(${f})`))", "ok":true, "valid":true, ... }

curl -s -XPOST localhost:4300/mutate -H content-type:application/json \
  -d '{"source":"(f=>f(f))(f=>console.log('\''(f=>f(f))('\''+f+'\'')'\''))","position":4,"char":"","language":"minimal"}'
```

## Estate

- SDK: [quine-cube-runner-sdk](https://github.com/sjgant80-hub/quine-cube-runner-sdk)
- MCP: [quine-cube-runner-mcp](https://github.com/sjgant80-hub/quine-cube-runner-mcp)
- Browser app: [quine-cube-runner](https://github.com/sjgant80-hub/quine-cube-runner)

## License

MIT · AI-Native Solutions
