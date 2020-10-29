class VideoMediaPlayer {
    constructor({manifestJSON, network }) {
        this.manifestJSON = manifestJSON;
        this.network = network;

        this.videoElement = null;
        this.sourceBuffer = null;
        this.selected = {};
        this.videoDuration = 0;
    }

    initializeCodec() {
        this.videoElement = document.getElementById("vid");
        const mediaSourceSupported = !!window.MediaSource;
        if (!mediaSourceSupported) {
            alert('Seu browser ou sistema não tem suporte a MSE!');
            return;
        }

        const codecSupported = MediaSource.isTypeSupported(this.manifestJSON.codec);
        if (!mediaSourceSupported) {
            alert(`Seu browser não suporta o codec: ${this.manifestJSON.codec}`);
            return;
        }

        const mediaSource = new MediaSource();
        this.videoElement.src = URL.createObjectURL(mediaSource);

        mediaSource.addEventListener("sourceopne", this.sourceOpenWrapper(mediaSource))

    }

    sourceOpenWrapper(mediaSource) {
        return async(_) => {
            console.log('carregou!');
            this.sourceBuffer = mediaSource.addSourceBuffer(this.manifestJSON.codec);
            const selected = this.selected = this.manifestJSON.intro;
            // evita rodar como "LIVE"
            mediaSourceDuration = this.videoDuration;
            await this.fileDownload(selected.url);
        }
    }

    async fileDownload(url) {
        const prepareUrl = {
            url,
            fileResolution: 360,
            fileResolutionTag: this.manifestJSON.fileResolutionTag,
            hostTag: this.manifestJSON.hostTag
        }
        const finalUrl = this.network.parseManifestURL(prepareUrl);
        this.setVideoPlayerDuration(finalUrl);
        console.log('finalURL', finalUrl);
        console.log('duration', this.videoDuration);
        const data = await this.network.fetchFile(finalUrl);
        return this.processBufferSegments(data);
    }

    setVideoPlayerDuration(finalURL) {
        const bars = finalURL.split('/');
        const [ name, videoDuration ] = parseFloat(bars[bars.length - 1].split('-'));
        this.videoDuration += videoDuration;
    }

    async processBufferSegments(allSegments) {
        const sourceBuffer = this.sourceBuffer;
        sourceBuffer.appendBuffer(allSegments);

        return new Promise((promise, reject) => {
            const updateEnd = (_) => {
                sourceBuffer.removeEventListener("updateend", updateEnd);
                sourceBuffer.timestampOffset = this.videoDuration;
                return resolve();
            };

            sourceBuffer.addEventListener("updateend", updateEnd);
            sourceBuffer.addEventListener("error", reject);
        });
    }
}