// Create an AudioContext instance
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioElement = document.getElementById('audio-source');
const audioSource = audioContext.createMediaElementSource(audioElement);

class FFT {
    constructor(audioContext, audioSource, parameters = {}){
        const defaults = {
            update_interval: 50,
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

        this.interval_id = null;

        this.max_smoothing_iterations = 100;
    }

    
    smoothFreqs(data){
        for(var j=0; j<(this.max_smoothing_iterations * this.freq_smoothing); j++){
            for(var i=1; i<data.length-1; i++){
                data[i].value = (data[i-1].value + data[i].value + data[i+1].value) / 3;
            }
        }
        return data;
    }

    bassTrebelBias(data) {
        for(var i=1; i<data.length-1; i++){
            data[i].value = data[i].value * (i / data.length);
        }
        return data;
    }

    performFFT() {
        if(this.interval_id !== null){
            clearInterval(this.interval_id);
        }
        this.interval_id = setInterval(() => {
            // Retrieve FFT data
            this.analyzer.getByteFrequencyData(this.frame);
            this.storeFFT(this.frame);
        }, this.update_interval);
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

        // smooth current frame
        new_frame = this.smoothFreqs(new_frame);
        //new_frame = this.bassTrebelBias(new_frame);

        // add current frame to history
        if(this.data_frames.length > this.parameters.history_length){
            this.data_frames.shift();
        }
        this.data_frames.push(new_frame);
    }

    setTimeSmoothing(smoothing){
        this.parameters.time_smoothing = smoothing;
        this.analyzer.smoothingTimeConstant = smoothing;
    }

}

export { audioContext }
export { audioElement }
export { audioSource}
export { FFT }