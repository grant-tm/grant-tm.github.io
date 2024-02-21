/* visualizer parameters */
//import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";
import {FFT} from "./audio_analysis.js";

var plot_container = document.getElementById("plot-container");


//****************************************************************************
// DATA COLLECTION / PROCESSING
//****************************************************************************
const fft = new FFT({
    fft_size: 2048,
    update_interval: 50,
    time_smoothing: 0.5,
    freq_smoothing: 0.1,
    bass_trebel_bias: 0.66,
    bias_strength: 0.5,
    history_length: 1,
});

fft.perform_fft();

//****************************************************************************
// DATA VISUALIZATION
//****************************************************************************
function updateGraph(data){
    if(!data){return;}
    var plot = Plot.plot({
        height: plot_container.clientHeight,
        width: plot_container.clientWidth,
        x: {domain: [0, data.length], axis: null},
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
    document.getElementById("plot-container").replaceChildren(plot);
}

function renderGraph(){
    return setInterval(() => {
        updateGraph(fft.data_frames);
    }, fft.update_interval);
}
var graph_interval = renderGraph(fft.update_interval);

//****************************************************************************
// CONTROL SURFACES
//****************************************************************************
var update_rate_knob = document.getElementById("update-rate-knob");
update_rate_knob.addEventListener("input", function(){
    var interval = 110 - this.value;
    fft.update_interval = interval;
    fft.perform_fft();
    clearInterval(graph_interval);
    graph_interval = renderGraph();
});

var freq_smoothing_knob = document.getElementById("freq-norm-knob");
freq_smoothing_knob.addEventListener("input", function(){
    fft.freq_smoothing = this.value;
});

var time_smoothing_knob = document.getElementById("time-norm-knob");
time_smoothing_knob.addEventListener("input", function(){
    fft.setTimeSmoothing(this.value);
});

var bias_freq_knob = document.getElementById("bias-freq-knob");
bias_freq_knob.addEventListener("input", function(){
    fft.bass_trebel_bias = this.value;
});

var bias_strength_knob = document.getElementById("bias-strength-knob");
bias_strength_knob.addEventListener("input", function(){
    fft.bias_strength = this.value;
});