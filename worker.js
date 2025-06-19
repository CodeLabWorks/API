import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

// Import the generated route manifest
import ROUTES from './api-routes.js';

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [name, ...rest] = part.trim().split('=');
    if (!name) continue;
    cookies[name] = rest.join('=');
  }
  return cookies;
}

function makeSetCookie(name, value, options = {}) {
  let str = `${name}=${value}`;
  if (options.maxAge != null) str += `; Max-Age=${options.maxAge}`;
  if (options.path) str += `; Path=${options.path}`;
  if (options.httpOnly) str += `; HttpOnly`;
  if (options.sameSite) str += `; SameSite=${options.sameSite}`;
  if (options.secure) str += `; Secure`;
  return str;
}

function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSign(message, secret) {
  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return bufferToHex(sigBuffer);
}

async function verifySignature(message, signatureHex, secret) {
  const expected = await hmacSign(message, secret);
  if (expected.length !== signatureHex.length) return false;
  let result = 0;
  for (let i = 0; i < expected.length; i++) {
    result |= expected.charCodeAt(i) ^ signatureHex.charCodeAt(i);
  }
  return result === 0;
}

async function checkAndUpdateRateLimit(request, env) {
  const secret = env.RATE_LIMIT_SECRET;
  if (!secret) return { allowed: true };

  const cookieHeader = request.headers.get('Cookie');
  const cookies = parseCookies(cookieHeader);
  const windowMs = parseInt(env.RATE_LIMIT_WINDOW_MS || '60000', 10);
  const maxTokens = parseInt(env.RATE_LIMIT_TOKENS || '100', 10);

  let data = null;
  let isValid = false;
  if (cookies.rate_limit) {
    try {
      const [b64, sig] = cookies.rate_limit.split('.');
      if (b64 && sig) {
        const jsonStr = atob(b64);
        isValid = await verifySignature(jsonStr, sig, secret);
        if (isValid) {
          data = JSON.parse(jsonStr);
        }
      }
    } catch {
      isValid = false;
      data = null;
    }
  }

  const now = Date.now();
  if (!data || !isValid) {
    data = { tokens: maxTokens - 1, lastRefill: now };
  } else {
    const elapsed = now - data.lastRefill;
    if (elapsed > 0) {
      const refillCount = Math.floor(elapsed / windowMs) * maxTokens;
      if (refillCount > 0) {
        data.tokens = Math.min(maxTokens, data.tokens + refillCount);
        data.lastRefill = now;
      }
    }
    if (data.tokens > 0) {
      data.tokens -= 1;
    } else {
      return { allowed: false };
    }
  }

  const jsonStrNew = JSON.stringify(data);
  const sigNew = await hmacSign(jsonStrNew, secret);
  const b64New = btoa(jsonStrNew);
  const cookieValue = `${b64New}.${sigNew}`;
  const setCookie = makeSetCookie('rate_limit', cookieValue, {
    httpOnly: true,
    path: '/',
    sameSite: 'Lax',
    secure: true,
    maxAge: Math.floor(windowMs / 1000) * 2,
  });

  return { allowed: true, setCookie };
}

async function handleAPIRequest(request, env) {
  const rl = await checkAndUpdateRateLimit(request, env);
  if (!rl.allowed) return new Response('Too Many Requests', { status: 429 });

  const url = new URL(request.url);
  const apiPath = url.pathname.replace(/^\/api\//, '');

  // Lookup route module from manifest
  const routeModule = ROUTES[apiPath];
  if (routeModule) {
    try {
      // Since these are static imports, routeModule is a string path we imported statically in generateRoutes
      // Import all route handlers at top-level in worker or via an object here:
      // We'll import all at the top in generateRoutes script and export them in api-routes.json

      // The routeModule here is the module object itself (imported statically in generated code)
      // so let's assume the manifest maps apiPath => module object

      const resp = await routeModule.default(request, env);
      if (rl.setCookie) resp.headers.append('Set-Cookie', rl.setCookie);
      return resp;
    } catch (e) {
      // fallthrough to static asset fallback
    }
  }

  try {
    const assetRequest = new Request(url.origin + `/api/${apiPath}.json`, request);
    const staticResp = await getAssetFromKV({ request: assetRequest, waitUntil: () => {} }, {});
    if (rl.setCookie) staticResp.headers.append('Set-Cookie', rl.setCookie);
    staticResp.headers.set('Content-Type', 'application/json');
    return staticResp;
  } catch {
    const res404 = new Response('API route not found', { status: 404 });
    if (rl.setCookie) res404.headers.append('Set-Cookie', rl.setCookie);
    return res404;
  }
}

export default {
  async fetch(request, env, ctx) {
    const rl = await checkAndUpdateRateLimit(request, env);
    if (!rl.allowed) return new Response('Too Many Requests', { status: 429 });

    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      return await handleAPIRequest(request, env);
    }

    try {
      const staticResp = await getAssetFromKV({ request, waitUntil: ctx.waitUntil }, {});
      if (rl.setCookie) staticResp.headers.append('Set-Cookie', rl.setCookie);
      return staticResp;
    } catch {
      const notFound = new Response('Not Found', { status: 404 });
      if (rl.setCookie) notFound.headers.append('Set-Cookie', rl.setCookie);
      return notFound;
    }
  },
};
