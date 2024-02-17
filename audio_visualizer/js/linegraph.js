/* visualizer parameters */
//import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";
import {audioContext, audioSource, FFT} from "./audio_analysis.js";

const fft = new FFT(audioContext, audioSource, {
    update_interval: 50,
    fft_size: 512,
    time_smoothing: 0.5,
    freq_smoothing: 0.5,
    bass_trebel_bias: 0.5,
    history_length: 1
});
fft.performFFT();

function updateGraph(data){
    if(!data){return;}
    if(document.getElementById("plot-container").firstChild){
        document.getElementById("plot-container").removeChild(document.getElementById("plot-container").firstChild);
    }
    var plot = Plot.plot({
        x: {domain: [0, data.length * 0.8], axis: null},
        y: {domain: [0, 256], axis: null},
        marks: [
            Plot.ruleY([0]),
            Plot.lineY(data, {
                x: "index", 
                y: "value", 
                stroke: "lightblue", 
                fillOpacity: 0.2, 
                fill: "steelblue"
            }),
        ]
    })
    document.getElementById("plot-container").appendChild(plot);
}

setInterval(() => {
    updateGraph(fft.data_frames[0]);
}, fft.update_interval);