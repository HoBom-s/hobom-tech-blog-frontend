export default async function handler(req, res) {
  const { url } = req;

  // /api/proxy/hobom-internal/api/v1/... → /hobom-api-gateway/hobom-internal/api/v1/...
  const path = url.replace(/^\/api\/proxy/, '');
  const target = `${process.env.HOBOM_API_GATEWAY_URL}/hobom-api-gateway${path}`;

  const headers = { ...req.headers };
  delete headers.host;
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
