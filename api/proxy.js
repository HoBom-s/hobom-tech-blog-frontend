export default async function handler(req, res) {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  const proxyPath = reqUrl.searchParams.get('path') || '';
  const query = req.url.includes('&') ? '?' + req.url.split('&').slice(1).join('&') : '';

  // Reconstruct query params from original request (exclude 'path' param)
  const params = new URLSearchParams(reqUrl.search);
  params.delete('path');
  const qs = params.toString() ? `?${params.toString()}` : '';

  const target = `${process.env.HOBOM_API_GATEWAY_URL}/hobom-api-gateway${proxyPath}${qs}`;

  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (!['host', 'connection'].includes(key.toLowerCase())) {
      headers[key] = value;
    }
  }
  headers['x-hobom-api-key'] = process.env.HOBOM_API_GATEWAY_KEY;

  try {
    const response = await fetch(target, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
      duplex: req.method !== 'GET' && req.method !== 'HEAD' ? 'half' : undefined,
    });

    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (!['transfer-encoding', 'content-encoding', 'connection'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    const body = await response.arrayBuffer();
    res.send(Buffer.from(body));
  } catch (err) {
    res.status(502).json({ error: 'proxy failed', message: err.message });
  }
}
