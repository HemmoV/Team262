const nodemailer = require('nodemailer');

let cachedTransporter;

function getTransporter() {
  if (cachedTransporter !== undefined) return cachedTransporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    cachedTransporter = null;
    return cachedTransporter;
  }

  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return cachedTransporter;
}

// Verstuurt een contactformulier-bericht via SMTP. Als er nog geen SMTP is
// ingesteld in .env, wordt het bericht alleen gelogd zodat het formulier niet
// stukloopt voordat een beheerder e-mail heeft geconfigureerd.
async function sendContactEmail({ naam, email, telefoon, bericht }) {
  const transporter = getTransporter();
  const to = process.env.CONTACT_TO || process.env.SMTP_USER;

  if (!transporter || !to) {
    console.log('[contact] SMTP is nog niet ingesteld — bericht alleen gelogd:', {
      naam,
      email,
      telefoon,
      bericht,
      tijd: new Date().toISOString(),
    });
    return false;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    replyTo: email,
    subject: `Nieuw contactbericht van ${naam} — Team262 website`,
    text: [
      `Naam: ${naam}`,
      `E-mail: ${email}`,
      `Telefoon: ${telefoon || '-'}`,
      '',
      'Bericht:',
      bericht,
    ].join('\n'),
  });
  return true;
}

module.exports = { sendContactEmail };
