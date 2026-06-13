(function () {
    var video = document.querySelector('[data-player-video]');
    var playButton = document.querySelector('[data-play-button]');
    var layer = document.querySelector('[data-play-layer]');
    var message = document.querySelector('[data-player-message]');

    if (!video) {
        return;
    }

    var stream = video.getAttribute('data-stream') || '';
    var ready = false;
    var hls = null;

    function setMessage(value) {
        if (message) {
            message.textContent = value;
        }
    }

    function hideLayer() {
        if (layer) {
            layer.classList.add('hidden');
        }
    }

    function showLayer() {
        if (layer) {
            layer.classList.remove('hidden');
        }
    }

    function attachStream() {
        if (ready || !stream) {
            return;
        }

        ready = true;

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(stream);
            hls.attachMedia(video);

            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                setMessage('点击播放');
            });

            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                    return;
                }

                if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                    return;
                }

                setMessage('播放失败，请稍后重试');
                showLayer();
            });
        } else {
            video.src = stream;
        }
    }

    function startPlay() {
        attachStream();
        hideLayer();

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                setMessage('点击播放');
                showLayer();
            });
        }
    }

    attachStream();

    if (playButton) {
        playButton.addEventListener('click', startPlay);
    }

    if (layer) {
        layer.addEventListener('click', function (event) {
            if (event.target === layer) {
                startPlay();
            }
        });
    }

    video.addEventListener('play', hideLayer);
    video.addEventListener('pause', function () {
        if (!video.ended) {
            showLayer();
        }
    });
    video.addEventListener('ended', showLayer);

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
})();
