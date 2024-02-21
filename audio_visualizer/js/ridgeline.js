/* visualizer parameters */
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
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
    history_length: 5,
});

fft.perform_fft();

var color_scale = d3.scaleLinear([0, fft.history_length], ["aquamarine", "purple"]);
var opacity_scale = d3.scaleLinear([0, fft.history_length], [1.0, 0.1]);
var facet_overlap = 0;


//****************************************************************************
// DATA VISUALIZATION
//****************************************************************************
function updateGraph(data){
    if(!data){return;};
    
    var client_height = plot_container.clientHeight;
    var client_set = client_height / new Set(data.map(d => d.frame)).size;

    var plot = Plot.plot({
        //height: 100 + new Set(data.map(d => d.frame)).size,
        height: plot_container.clientHeight,
        width: plot_container.clientWidth,
        //marginBottom: 0,
        //paddingBottom: 0,
        x: {axis: null, /*range: [0, fft.fft_size / 2]*/},
        
        y: {axis: null, 
            domain: [0, 128], 
            range: [client_set, 0]},
        
        fy: {axis: null, 
            domain: data.map(d => d.frame), 
            range: [facet_overlap, client_height]},
        
        marks: [
            Plot.lineY(data, {
                x: "index", 
                y: "value", 
                fy: "frame", 
                
                curve: "linear", 

                strokeWidth: 1, 
                stroke: d => color_scale(d.frame), 
                strokeOpacity: d => opacity_scale(d.frame),
                
                fill: d => color_scale(d.frame), 
                fillOpacity: d => opacity_scale(d.frame)}),
        ]
    })
    document.getElementById("plot-container").replaceChildren(plot);
}

var ctr = 0;
var graph_render_times = [];

function renderGraph(){
    return setInterval(() => {
        const start_time = performance.now();
        updateGraph(fft.data_frames);
        const end_time = performance.now();
        
        if(ctr > 10){
            ctr = 0;
            var sum = 0;
            for(var i=0; i<graph_render_times.length; i++){
                sum += graph_render_times[i];
            }
            var avg_render_time = sum / graph_render_times.length;
            console.log("render time: ", avg_render_time);
            graph_render_times.splice(0, graph_render_times.length);
        }
        graph_render_times.push(end_time - start_time);
        ctr++;
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

var history_length_knob = document.getElementById("history-length-knob");
history_length_knob.addEventListener("input", function(){
    fft.history_length = this.value;
    color_scale = d3.scaleLinear([0, fft.history_length], ["aquamarine", "purple"]);
    opacity_scale = d3.scaleLinear([0, fft.history_length], [1.0, 0.1]);
});

var facet_overlap_knob = document.getElementById("facet-overlap-knob");
facet_overlap_knob.addEventListener("input", function(){
    facet_overlap = this.value;
});