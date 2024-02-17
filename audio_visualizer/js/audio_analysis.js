// Create an AudioContext instance
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioElement = document.getElementById('audio-source');
const audioSource = audioContext.createMediaElementSource(audioElement);

class FFT {
    constructor(audioContext, audioSource, parameters = {}){
        const defaults = {
            update: 100,
            fft_size: 512,
            time_smoothing: 0.5,
            freq_smoothing: 0.5,
            bass_trebel_bias: 0.5,
            history_length: 1
        };
        
        this.parameters = Object.assign({}, defaults, parameters);
        
        this.audioContext = audioContext;
        this.audioSource = audioSource;

        this.analyzer = this.audioContext.createAnalyser();
        this.analyzer.fftSize = this.parameters.fft_size;
        this.analyzer.smoothingTimeConstant = this.parameters.time_smoothing;
        
        this.audioSource.connect(this.analyzer);
        this.analyzer.connect(this.audioContext.destination);

        this.data_frames = [];
        this.frame = new Uint8Array(this.parameters.fft_size / 2); 
    }

    performFFT() {
        setInterval(() => {
            // Retrieve FFT data
            this.analyzer.getByteFrequencyData(this.frame);
            this.storeFFT(this.frame);
        }, this.parameters.update_interval);
    }

    storeFFT(fft_data) {
        // process current frame
        var new_frame = [];
        new_frame.push({index: 0, value:0});
        for (let i = 1; i < fft_data.length-1; i++) {
            new_frame.push({
                index: i, 
                value: fft_data[i],
            });
        }
        new_frame.push({index: fft_data.length-1, value:0});

        // add current frame to history
        if(this.data_frames.length > this.parameters.history_length){
            this.data_frames.shift();
        }
        this.data_frames.push(new_frame);
    }

}

export { audioContext }
export { audioElement }
export { audioSource}
export { FFT }