const { put, get } = require('@vercel/blob');
const PATH = 'gantt.json';

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const r = await get(PATH, { access: 'private' });
      if (!r || r.statusCode !== 200) return res.status(200).json(null);
      const text = await new Response(r.stream).text();
      return res.status(200).setHeader('Content-Type', 'application/json').send(text);
    }
    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body || !Array.isArray(body.tasks)) return res.status(400).json({ error: 'bad data' });
      body.updatedAt = Date.now();
      await put(PATH, JSON.stringify(body), {
        access: 'private', allowOverwrite: true, addRandomSuffix: false, contentType: 'application/json',
      });
      return res.status(200).json({ updatedAt: body.updatedAt });
    }
    res.status(405).end();
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
