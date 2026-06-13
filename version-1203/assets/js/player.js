(function () {
  window.initStaticPlayer = function (source) {
    const video = document.querySelector("[data-player-video]");
    const overlay = document.querySelector("[data-player-overlay]");
    const button = document.querySelector("[data-play-button]");
    let started = false;
    let hls = null;

    if (!video || !source) {
      return;
    }

    const load = function () {
      if (!started) {
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    };

    if (overlay) {
      overlay.addEventListener("click", load);
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        load();
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        load();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
