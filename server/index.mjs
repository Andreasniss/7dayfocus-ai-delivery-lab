import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { parsePlanRequest } from './contract.mjs'
import { requestProviderPlan } from './providers.mjs'

const HOST = '127.0.0.1'
const PORT = Number(process.env.PORT ?? 8787)
const MAX_BODY_BYTES = 128 * 1024
const DIST = resolve(process.cwd(), 'dist')
const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
}

function sendJson(response, status, value) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  })
  response.end(JSON.stringify(value))
}

function isLoopbackHost(host = '') {
  const name = host.split(':')[0]
  return name === '127.0.0.1' || name === 'localhost'
}

function isAllowedOrigin(origin) {
  if (!origin) return true
  try {
    const url = new URL(origin)
    return url.protocol === 'http:' && (url.hostname === '127.0.0.1' || url.hostname === 'localhost')
  } catch {
    return false
  }
}

async function readJsonBody(request) {
  let size = 0
  const chunks = []
  for await (const chunk of request) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error('Request is too large.'), { status: 413 })
    chunks.push(chunk)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw Object.assign(new Error('Request body must be valid JSON.'), { status: 400 })
  }
}

async function serveStatic(request, response) {
  const pathname = new URL(request.url ?? '/', `http://${HOST}:${PORT}`).pathname
  const requested = pathname === '/' ? 'index.html' : pathname.slice(1)
  const safe = normalize(requested).replace(/^(\.\.(\/|\\|$))+/, '')
  let path = join(DIST, safe)
  try {
    if (!(await stat(path)).isFile()) throw new Error('not a file')
  } catch {
    path = join(DIST, 'index.html')
  }
  try {
    const body = await readFile(path)
    response.writeHead(200, {
      'content-type': MIME[extname(path)] ?? 'application/octet-stream',
      'x-content-type-options': 'nosniff',
      'content-security-policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'",
      'referrer-policy': 'no-referrer',
    })
    response.end(body)
  } catch {
    response.writeHead(404).end('Not found')
  }
}

export function createAppServer(options = {}) {
  const providerRequest = options.providerRequest ?? requestProviderPlan
  return createServer(async (request, response) => {
    const requestId = randomUUID()
    if (!isLoopbackHost(request.headers.host) || !isAllowedOrigin(request.headers.origin)) {
      sendJson(response, 403, { error: { code: 'forbidden', message: 'Only loopback same-origin requests are allowed.', requestId } })
      return
    }

    if (request.url === '/api/plan') {
      if (request.method !== 'POST' || !request.headers['content-type']?.toLowerCase().startsWith('application/json')) {
        sendJson(response, 415, { error: { code: 'unsupported_request', message: 'Use POST with application/json.', requestId } })
        return
      }
      try {
        const parsed = parsePlanRequest(await readJsonBody(request))
        const proposal = await providerRequest(parsed)
        sendJson(response, 200, { proposal, provider: parsed.provider, model: parsed.model, requestId })
      } catch (error) {
        const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500 ? error.status : 502
        const message = status === 400 || status === 413
          ? error.message
          : error.message || 'The provider request failed.'
        sendJson(response, status, { error: { code: 'plan_failed', message, requestId } })
      }
      return
    }

    if (request.method === 'GET' || request.method === 'HEAD') {
      await serveStatic(request, response)
      return
    }
    response.writeHead(405).end('Method not allowed')
  })
}

if (import.meta.url.startsWith('file:') && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createAppServer().listen(PORT, HOST, () => {
    process.stdout.write(`7DayFocus local gateway: http://${HOST}:${PORT}\n`)
  })
}
