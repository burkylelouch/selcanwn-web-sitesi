// Sayfa altındaki yıl alanını bilgisayarın mevcut yılıyla doldurur; yılı HTML'de elle güncellemek gerekmez.
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const liveButton = document.getElementById("live-button");

// Kick durumunu /api/live-status uç noktasından alır. Canlıysa düğmeyi Kick'e, değilse yayın takvimine yönlendirir.
async function updateLiveStatus() {
  if (!liveButton) return;

  try {
    const response = await fetch("/api/live-status", { cache: "no-store" });
    if (!response.ok) throw new Error("Canlı yayın bilgisi alınamadı.");

    // API JSON içindeki isLive true ise yayındadır; false ise yayın yoktur. Düğme metni ve href buna göre değiştirilir.
    const { isLive } = await response.json();
    if (isLive) {
      liveButton.href = "https://kick.com/selcanwn";
      liveButton.target = "_blank";
      liveButton.rel = "noreferrer";
      liveButton.textContent = "Yayındayız 🔴 ↗";
      liveButton.setAttribute("aria-label", "Kick'te canlı yayına git");
    } else {
      liveButton.href = "#takvim";
      liveButton.removeAttribute("target");
      liveButton.removeAttribute("rel");
      liveButton.textContent = "Yayın takvimine göz at 📅";
      liveButton.setAttribute("aria-label", "Haftalık yayın takvimine git");
    }
  } catch {
    // Yerel dosyada veya API yanıt vermediğinde takvim bağlantısı yedek olarak kalır.
    liveButton.href = "#takvim";
    liveButton.textContent = "Yayın takvimine göz at 📅";
  }
}


// /api/latest-video uç noktasından kanalın son videosunu ister; dönen bilgileri video kartına aktarır.
async function updateLatestVideo() {
  const videoCard = document.getElementById("latest-video-card");
  if (!videoCard) return;

  try {
    const response = await fetch("/api/latest-video", { cache: "no-store" });
    if (!response.ok) throw new Error("Son video bilgisi alınamadı.");

    const video = await response.json();
    // url tıklama hedefi, title başlık, thumbnail kartın arka plan görselidir; eksik alanlar mevcut varsayılanı bırakır.
    if (video.url) videoCard.href = video.url;

    const title = document.getElementById("latest-video-title");
    if (title && video.title) title.textContent = video.title;

    const thumbnail = videoCard.querySelector(".video-thumb");
    if (thumbnail && video.thumbnail) {
      thumbnail.style.backgroundImage = `url("${video.thumbnail.replaceAll('"', "%22")}")`;
      thumbnail.classList.add("has-video-thumbnail");
    }
  } catch {
    // API geçici olarak yanıt vermezse kart kanalın videolarına gider.
  }
}

// Sayfa açılırken canlılık ve son video bilgisini hemen yükle; canlılık durumunu her 60 saniyede yenile.
updateLiveStatus();
updateLatestVideo();
// Kick durumu 60 saniyede bir yenilenir; süreyi değiştirmek için bu aralığı düzenle.
setInterval(updateLiveStatus, 60_000);

// Türkiye saat dilimindeki haftanın gününü bulur, takvim kartlarına is-today / is-past sınıflarını uygular.
function highlightTodaySchedule() {
  const days = ["pazartesi", "salı", "çarşamba", "perşembe", "cuma", "cumartesi", "pazar"];
  const today = new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    timeZone: "Europe/Istanbul",
  }).format(new Date()).toLocaleLowerCase("tr-TR");
  // Günlerin sırası HTML yayın takviminin haftalık sırasıyla aynı olmalıdır.
  const todayIndex = days.indexOf(today);

  document.querySelectorAll(".schedule-card").forEach((card) => {
    const day = card.querySelector(".schedule-day")?.textContent.trim().toLocaleLowerCase("tr-TR");
    const dayIndex = days.indexOf(day);
    card.classList.toggle("is-today", day === today);
    card.classList.toggle("is-past", dayIndex >= 0 && dayIndex < todayIndex);
  });
}

// İlk kart vurgusunu sayfa açılırken yap; saat başında yeniden hesaplayarak gün değişimini yakala.
highlightTodaySchedule();
setInterval(highlightTodaySchedule, 60 * 60 * 1000);




