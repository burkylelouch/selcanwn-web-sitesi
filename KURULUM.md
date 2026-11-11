# Selcanwn sitesi: yayın durumu ve yayın takvimi

## Yerelde açma

`index.html` dosyasına çift tıklayarak tasarımı açabilirsin. Yerel dosyada Kick API bağlantısı çalışmayacağı için düğme yayın takvimine gider. Takvimdeki gün ve saatler örnek olarak seçildi; Türkiye saatidir ve her hafta tekrar eder.

## Canlı durumunu otomatik kullanma

Otomatik kontrol, site bir web sunucusunda yayınlandığında çalışır. Bu klasörde Vercel için `api/live-status.js` sunucu işlevi hazırdır. Düğme durumu dakikada bir yenilenir.

1. Kick Developer hesabında uygulama oluşturup **Client ID** ve **Client Secret** al.
2. Bu klasörü Vercel'e proje olarak yükle.
3. Vercel proje ayarlarında şu ortam değişkenlerini ekle:
   - `KICK_CLIENT_ID`
   - `KICK_CLIENT_SECRET`
4. Yeni bir dağıtım yap.

Anahtarları `index.html` veya `script.js` içine yazma. `.env.example` dosyası yalnızca değişken adlarını gösterir; gerçek anahtarları içermez.

Kick API kanalın canlı olduğunu bildirirse düğme `Yayındayız 🔴 ↗` olarak Kick kanalını açar. Çevrimdışıyken düğme yayın takvimine götürür. API'ye ulaşılamazsa da takvim bağlantısı yedek olarak kalır.
