(() => {
  "use strict";
  if (window.performancePlayerInstalled) return;
  window.performancePlayerInstalled = true;
  let audio;
  let currentCard;
  let request = 0;

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return "--:--";
    const value = Math.max(0, Math.floor(seconds));
    return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
  };
  function update() {
    if (!currentCard) return;
    const playing = !audio.paused && !audio.ended;
    currentCard.classList.toggle("is-playing", playing);
    const button = currentCard.querySelector(".performance-toggle");
    button.setAttribute("aria-pressed", String(playing));
    button.setAttribute("aria-label", `${playing ? "暂停" : "播放"}：${currentCard.querySelector(".performance-title").textContent}`);
    button.querySelector("span").textContent = playing ? "Ⅱ" : "▶";
    const seek = currentCard.querySelector(".performance-seek");
    seek.disabled = !(audio.duration > 0 && Number.isFinite(audio.duration));
    seek.value = seek.disabled ? 0 : audio.currentTime / audio.duration * 100;
    currentCard.querySelector(".performance-time").textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  }
  function status(message) {
    if (currentCard) currentCard.querySelector(".performance-status").textContent = message;
  }
  function stop() {
    request++;
    if (!audio || !currentCard) return;
    audio.pause();
    audio.currentTime = 0;
    update();
    status("");
    currentCard = undefined;
    audio.removeAttribute("src");
    audio.load();
  }
  function getAudio() {
    if (audio) return audio;
    audio = document.createElement("audio");
    audio.preload = "none";
    // Keep the media element in the document for mutual exclusion with the theme player.
    audio.hidden = true;
    document.body.append(audio);
    ["play", "pause", "ended", "timeupdate", "loadedmetadata", "durationchange"].forEach((event) => audio.addEventListener(event, update));
    audio.addEventListener("waiting", () => status("正在缓冲…"));
    audio.addEventListener("playing", () => status(""));
    audio.addEventListener("error", () => { update(); status("音频暂时无法播放，请稍后重试。"); });
    return audio;
  }
  document.addEventListener("click", (event) => {
    const card = event.target.closest(".performance-card");
    if (!card || event.target.closest("input, a") || window.getSelection()?.toString()) return;
    const player = getAudio();
    if (currentCard === card && !player.paused) {
      request++;
      player.pause();
      status("");
      return;
    }
    if (currentCard !== card) {
      stop();
      currentCard = card;
      player.src = card.dataset.src;
    }
    if (player.ended) player.currentTime = 0;
    const attempt = ++request;
    status("正在加载…");
    player.play().catch(() => {
      if (attempt !== request) return;
      update();
      status("播放失败，请点击重试。");
    });
  });
  document.addEventListener("input", (event) => {
    if (!event.target.matches(".performance-seek") || !currentCard ||
        event.target.closest(".performance-card") !== currentCard || !Number.isFinite(audio.duration)) return;
    audio.currentTime = audio.duration * Number(event.target.value) / 100;
    update();
  });
  // Native media play events do not bubble; capture them to coordinate both players.
  document.addEventListener("play", (event) => {
    if (!audio) return;
    if (event.target === audio) {
      document.querySelectorAll("audio, video").forEach((media) => {
        if (media !== audio && !media.paused) media.pause();
      });
    } else if (event.target instanceof HTMLMediaElement && currentCard) {
      request++;
      audio.pause();
      status("");
    }
  }, true);
  document.addEventListener("pjax:send", stop);
  document.addEventListener("pjax:beforeReplace", stop);
  window.addEventListener("pagehide", stop);
  // Also covers the theme's navigation implementation if it emits no PJAX events.
  new MutationObserver(() => {
    if (currentCard && !currentCard.isConnected) stop();
  }).observe(document.body, { childList: true, subtree: true });
})();
