export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const calComLink = process.env.CAL_COM_LINK || '';
  return res.status(200).json({
    ok: true,
    calComLink,
  });
}
