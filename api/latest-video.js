// Vercel sunucu fonksiyonu: YouTube Data API'den en son yüklenen videoyu bulup kart için gerekli alanları döndürür.
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  // YouTube anahtarı yalnızca sunucu tarafında, Vercel ortam değişkeninde tutulur.
  // Vercel > Project Settings > Environment Variables içine YOUTUBE_API_KEY ekle; anahtarı tarayıcı koduna koyma.
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "YouTube API anahtarı ayarlanmamış." });
  }

  try {
    // Önce @selcanwn kanalının uploads listesi kimliğini bul; sonraki istek bu listedeki en yeni videoyu getirir.
    const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
    channelUrl.search = new URLSearchParams({
      part: "contentDetails",
      forHandle: "@selcanwn",
      key: apiKey,
    }).toString();

    const channelResponse = await fetch(channelUrl);
    const channelData = await channelResponse.json();
    if (!channelResponse.ok) {
      return res.status(channelResponse.status).json({ error: "YouTube kanal bilgisi alınamadı." });
    }

    const uploadsPlaylist = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylist) {
      return res.status(404).json({ error: "Kanalın video listesi bulunamadı." });
    }

    // maxResults=1 en yeni yüklemeyi seçer; yanıt video adresi, başlık ve uygun küçük görseli oluşturmak için kullanılır.
    const videosUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    videosUrl.search = new URLSearchParams({
      part: "snippet,contentDetails",
      playlistId: uploadsPlaylist,
      maxResults: "1",
      key: apiKey,
    }).toString();

    const videosResponse = await fetch(videosUrl);
    const videosData = await videosResponse.json();
    if (!videosResponse.ok) {
      return res.status(videosResponse.status).json({ error: "Son video bilgisi alınamadı." });
    }

    const latest = videosData.items?.[0];
    const videoId = latest?.contentDetails?.videoId || latest?.snippet?.resourceId?.videoId;
    if (!videoId) {
      return res.status(404).json({ error: "Kanalda görüntülenebilir video bulunamadı." });
    }

    return res.status(200).json({
      url: `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`,
      title: latest.snippet?.title || "YouTube'daki son video",
      thumbnail: latest.snippet?.thumbnails?.maxres?.url
        || latest.snippet?.thumbnails?.high?.url
        || latest.snippet?.thumbnails?.medium?.url
        || null,
    });
  } catch {
    return res.status(500).json({ error: "Son video bilgisi alınırken bir hata oluştu." });
  }
};
