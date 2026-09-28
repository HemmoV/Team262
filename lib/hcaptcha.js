// Verifieert een hCaptcha-token server-side. Als er geen HCAPTCHA_SECRET_KEY is
// ingesteld, wordt de controle overgeslagen (zodat het contactformulier blijft
// werken voordat een beheerder hCaptcha heeft opgezet) in plaats van iedereen te blokkeren.
async function verifyCaptcha(token, remoteIp) {
  const secret = process.env.HCAPTCHA_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  try {
    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token);
    if (remoteIp) params.append('remoteip', remoteIp);

    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await response.json();
    return !!data.success;
  } catch (err) {
    console.error('hCaptcha-verificatie kon niet worden uitgevoerd:', err.message);
    // Bij een netwerk-/serverfout de bezoeker niet blokkeren voor iets buiten hun macht.
    return true;
  }
}

module.exports = { verifyCaptcha };
