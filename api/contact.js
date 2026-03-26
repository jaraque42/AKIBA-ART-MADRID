export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !toEmail || !fromEmail) {
    return res.status(500).json({
      ok: false,
      error: 'Missing email configuration on server',
    });
  }

  try {
    const {
      nombre = '',
      email = '',
      tipo = '',
      fecha = '',
      mensaje = '',
      website = '',
    } = req.body || {};

    if (website) {
      return res.status(200).json({ ok: true });
    }

    if (!nombre || !email || !tipo || !mensaje) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required fields',
      });
    }

    const safe = (value) =>
      String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const html = `
      <h2>Nueva solicitud desde AKIBA</h2>
      <p><strong>Nombre:</strong> ${safe(nombre)}</p>
      <p><strong>Email:</strong> ${safe(email)}</p>
      <p><strong>Tipo:</strong> ${safe(tipo)}</p>
      <p><strong>Fecha ideal:</strong> ${safe(fecha || 'No indicada')}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${safe(mensaje).replace(/\n/g, '<br/>')}</p>
    `;

    const sendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: `Nueva solicitud AKIBA · ${tipo}`,
        html,
      }),
    });

    if (!sendResponse.ok) {
      const resendError = await sendResponse.text();
      return res.status(502).json({
        ok: false,
        error: 'Email provider rejected request',
        details: resendError,
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: 'Unexpected server error',
      details: error?.message || 'Unknown error',
    });
  }
}
