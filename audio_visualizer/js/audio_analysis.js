// Create an AudioContext instance
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioElement = document.getElementById('audio-source');
const audioSource = audioContext.createMediaElementSource(audioElement);

class FFT {
    audio_context = audioContext;
    audio_source = audioSource;

    constructor({
            fft_size = 512, 
            update_interval = 50, 
            history_length = 1, 
            time_smoothing = 0.5, 
            freq_smoothing = 0.5, 
            bass_trebel_bias = 0.5, 
            bias_strength = 0.0}){

        this.fft_size = fft_size;
        this.update_interval = update_interval;
        this.history_length = history_length;
        this.time_smoothing = time_smoothing;
        this.freq_smoothing = freq_smoothing;
        this.bass_trebel_bias = bass_trebel_bias;
        this.bias_strength = bias_strength;

        this.analyzer = this.audio_context.createAnalyser();
        this.analyzer.fftSize = this.fft_size;
        this.analyzer.smoothingTimeConstant = this.time_smoothing;
        
        this.audio_source.connect(this.analyzer);
        this.analyzer.connect(this.audio_context.destination);
        
        this.data_frames = [{index: 0, value: 0, frame: 0}];
        this.frame = new Uint8Array(this.fft_size / 2); 
        
        this.interval_id = null;
    }

    //************************************************************************
    // FREQUENCY SMOOTHING FUNCTIONS
    //************************************************************************
    iterative_smoothing(data){
        var max_iterations = 50;
        var iterations = max_iterations * this.freq_smoothing;
        for(var j=0; j<iterations; j++){
            for(var i=1; i<data.length-1; i++){
                data[i].value += data[i-1].value;
                data[i].value += data[i+1].value;
                data[i].value /= 3;
            }
        }
        return data;
    }

    convolution(data){
        var kernel = this.fft_size * this.freq_smoothing / 8;
        var conv = [];
        const half_kernel = Math.floor(kernel / 2);
        for(var i=0; i<data.length; i++){
            var sum = 0;
            for(var j=0; j<kernel; j++){
                var index = i - half_kernel + j;
                if(index < 0){ index = 0; }
                if(index >= data.length-1){ index = data.length-1; }
                sum += data[index].value;
            }
            var entry = {index: i, value: sum/kernel, frame: 0};
            conv.push(entry);
        }
        return conv;
    }

    //************************************************************************
    // EQUILIZAITON
    //************************************************************************
    bias(data) {
        var bias = this.bass_trebel_bias;
        for(var i=1; i<data.length-1; i++){
            // calculate weight according to bass/trebel bias
            var weight = (i * (bias - 0.5));
            weight += ((data.length / 2) * (-bias)) + (data.length / 4);
            weight *= this.bias_strength;
            
            // apply weight to data
            if(data[i].value > 0){ data[i].value += weight; }

            // clamp data to 0-255 range
            data[i].value = Math.min(255, data[i].value);
            data[i].value = Math.max(0, data[i].value);
        }
        return data;
    }

    //************************************************************************
    // FFT DATA PROCESSING
    //************************************************************************
    perform_fft() {
        if(this.interval_id !== null){
            clearInterval(this.interval_id);
        }
        this.interval_id = setInterval(() => {
            // Retrieve fft data
            this.analyzer.getByteFrequencyData(this.frame);

            // process and store fft data
            var new_frame = this.format_frame(this.frame);
            new_frame = this.process_frame(new_frame);
            this.store_frame(new_frame);
        }, this.update_interval);
    }

    format_frame(fft_data){
        // copy values to formatted array
        var formatted = [];
        for (let i = 0; i < fft_data.length; i++) {
            formatted.push({index: i, value: fft_data[i], frame: 0});
        }
        return formatted;
    }

    process_frame(frame){
        // apply biasing
        frame = this.bias(frame);
        
        // apply frequency smoothing
        //frame = this.convolution(frame);
        frame = this.iterative_smoothing(frame);

        //anchor edges to 0
        frame[0].value = 0;
        frame[frame.length-1].value = 0;

        return frame;
    }

    store_frame(current_frame) {
        // add current frame to history
        var max_length = this.history_length * this.fft_size / 2;
        if(this.data_frames.length > max_length){
            this.data_frames.splice(0, current_frame.length);
        }
        
        for(var i=0; i<this.data_frames.length; i++){
            this.data_frames[i].frame += 1;
        }

        this.data_frames.push(...current_frame);
                
    }

    setTimeSmoothing(smoothing){
        this.time_smoothing = smoothing;
        this.analyzer.smoothingTimeConstant = smoothing;
    }

}

export { audioContext }
export { audioElement }
export { audioSource}
export { FFT }