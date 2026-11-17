// Kick erişim anahtarını sona erme zamanına kadar bellekte tekrar kullan.
let cachedAccessToken = null;
let tokenExpiresAt = 0;

// Kick istemci bilgileriyle API çağrıları için kısa ömürlü erişim anahtarı al.
async function getAccessToken(clientId, clientSecret) {
  if (cachedAccessToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedAccessToken;
  }

  const response = await fetch("https://id.kick.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error("Kick erişim anahtarı alınamadı.");
  }

  cachedAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + (Number(data.expires_in) || 3600) * 1000;
  return cachedAccessToken;
}

// Kick kanalının canlı olup olmadığını ön yüze JSON olarak bildir.
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  // Gizli anahtarlar Vercel ortam değişkenlerinde tutulur; tarayıcıya gönderilmez.
  const clientId = process.env.KICK_CLIENT_ID;
  const clientSecret = process.env.KICK_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: "Kick API anahtarları ayarlanmamış." });
  }

  try {
    const accessToken = await getAccessToken(clientId, clientSecret);
    // Kanal adıyla sorgula ve yalnızca canlı yayın durumunu döndür.
    const channelUrl = new URL("https://api.kick.com/public/v1/channels");
    channelUrl.searchParams.set("slug", "selcanwn");

    const response = await fetch(channelUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: "Kick yayın durumu alınamadı." });
    }

    const channel = data.data?.[0];
    if (!channel) {
      return res.status(404).json({ error: "Kick kanalı bulunamadı." });
    }

    return res.status(200).json({ isLive: Boolean(channel.stream?.is_live) });
  } catch {
    return res.status(502).json({ error: "Kick yayın durumu kontrol edilemedi." });
  }
};
