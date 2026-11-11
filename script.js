const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const liveButton = document.getElementById("live-button");

async function updateLiveStatus() {
  if (!liveButton) return;

  try {
    const response = await fetch("/api/live-status", { cache: "no-store" });
    if (!response.ok) throw new Error("Canlı yayın bilgisi alınamadı.");

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


async function updateLatestVideo() {
  const videoCard = document.getElementById("latest-video-card");
  if (!videoCard) return;

  try {
    const response = await fetch("/api/latest-video", { cache: "no-store" });
    if (!response.ok) throw new Error("Son video bilgisi alınamadı.");

    const video = await response.json();
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

updateLiveStatus();
updateLatestVideo();
setInterval(updateLiveStatus, 60_000);

function highlightTodaySchedule() {
  const days = ["pazartesi", "salı", "çarşamba", "perşembe", "cuma", "cumartesi", "pazar"];
  const today = new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    timeZone: "Europe/Istanbul",
  }).format(new Date()).toLocaleLowerCase("tr-TR");
  const todayIndex = days.indexOf(today);

  document.querySelectorAll(".schedule-card").forEach((card) => {
    const day = card.querySelector(".schedule-day")?.textContent.trim().toLocaleLowerCase("tr-TR");
    const dayIndex = days.indexOf(day);
    card.classList.toggle("is-today", day === today);
    card.classList.toggle("is-past", dayIndex >= 0 && dayIndex < todayIndex);
  });
}

highlightTodaySchedule();
setInterval(highlightTodaySchedule, 60 * 60 * 1000);




