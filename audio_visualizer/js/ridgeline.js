/* visualizer parameters */
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";
import {audioContext, audioSource, FFT} from "./audio_analysis.js";

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

var colors = ["#000004","#010005","#010106","#010108","#02010a","#02020c","#02020e","#030210","#040312","#040314","#050417","#060419","#07051b","#08051d","#09061f","#0a0722","#0b0724","#0c0826","#0d0829","#0e092b","#10092d","#110a30","#120a32","#140b34","#150b37","#160b39","#180c3c","#190c3e","#1b0c41","#1c0c43","#1e0c45","#1f0c48","#210c4a","#230c4c","#240c4f","#260c51","#280b53","#290b55","#2b0b57","#2d0b59","#2f0a5b","#310a5c","#320a5e","#340a5f","#360961","#380962","#390963","#3b0964","#3d0965","#3e0966","#400a67","#420a68","#440a68","#450a69","#470b6a","#490b6a","#4a0c6b","#4c0c6b","#4d0d6c","#4f0d6c","#510e6c","#520e6d","#540f6d","#550f6d","#57106e","#59106e","#5a116e","#5c126e","#5d126e","#5f136e","#61136e","#62146e","#64156e","#65156e","#67166e","#69166e","#6a176e","#6c186e","#6d186e","#6f196e","#71196e","#721a6e","#741a6e","#751b6e","#771c6d","#781c6d","#7a1d6d","#7c1d6d","#7d1e6d","#7f1e6c","#801f6c","#82206c","#84206b","#85216b","#87216b","#88226a","#8a226a","#8c2369","#8d2369","#8f2469","#902568","#922568","#932667","#952667","#972766","#982766","#9a2865","#9b2964","#9d2964","#9f2a63","#a02a63","#a22b62","#a32c61","#a52c60","#a62d60","#a82e5f","#a92e5e","#ab2f5e","#ad305d","#ae305c","#b0315b","#b1325a","#b3325a","#b43359","#b63458","#b73557","#b93556","#ba3655","#bc3754","#bd3853","#bf3952","#c03a51","#c13a50","#c33b4f","#c43c4e","#c63d4d","#c73e4c","#c83f4b","#ca404a","#cb4149","#cc4248","#ce4347","#cf4446","#d04545","#d24644","#d34743","#d44842","#d54a41","#d74b3f","#d84c3e","#d94d3d","#da4e3c","#db503b","#dd513a","#de5238","#df5337","#e05536","#e15635","#e25734","#e35933","#e45a31","#e55c30","#e65d2f","#e75e2e","#e8602d","#e9612b","#ea632a","#eb6429","#eb6628","#ec6726","#ed6925","#ee6a24","#ef6c23","#ef6e21","#f06f20","#f1711f","#f1731d","#f2741c","#f3761b","#f37819","#f47918","#f57b17","#f57d15","#f67e14","#f68013","#f78212","#f78410","#f8850f","#f8870e","#f8890c","#f98b0b","#f98c0a","#f98e09","#fa9008","#fa9207","#fa9407","#fb9606","#fb9706","#fb9906","#fb9b06","#fb9d07","#fc9f07","#fca108","#fca309","#fca50a","#fca60c","#fca80d","#fcaa0f","#fcac11","#fcae12","#fcb014","#fcb216","#fcb418","#fbb61a","#fbb81d","#fbba1f","#fbbc21","#fbbe23","#fac026","#fac228","#fac42a","#fac62d","#f9c72f","#f9c932","#f9cb35","#f8cd37","#f8cf3a","#f7d13d","#f7d340","#f6d543","#f6d746","#f5d949","#f5db4c","#f4dd4f","#f4df53","#f4e156","#f3e35a","#f3e55d","#f2e661","#f2e865","#f2ea69","#f1ec6d","#f1ed71","#f1ef75","#f1f179","#f2f27d","#f2f482","#f3f586","#f3f68a","#f4f88e","#f5f992","#f6fa96","#f8fb9a","#f9fc9d","#fafda1","#fcffa4"];

function selectColor(value){
    var index = Math.floor(colors.length / (value+1));
    return colors[index];
}

var scale = d3.scaleLinear([0, fft.history_length], ["orange", "purple"]);
var opacityScale = d3.scaleLinear([0, fft.history_length], [1.0, 0.1]);

//****************************************************************************
// DATA VISUALIZATION
//****************************************************************************
function updateGraph(data){
    if(!data){return;}
    if(document.getElementById("plot-container").firstChild){
        document.getElementById("plot-container").removeChild(document.getElementById("plot-container").firstChild);
    }
    var plot = Plot.plot({
        height: 1 + new Set(data.map(d => d.frame)).size,
        marginBottom: 0,
        paddingBottom: 0,
        x: {axis: null, range: [0, fft.fft_size]},
        y: {axis: null, range:  [200, 50]},
        fy: {axis: null, domain: data.map(d => d.frame)},
        marks: [
            //Plot.areaY(data, {x: "index", y: "value", fy: "frame", curve: "natural", fill: d => scale(d.frame), fillOpacity: 1.0}),
            Plot.lineY(data, {
                x: "index", 
                y: "value", 
                fy: "frame", 
                curve: "basis", 
                strokeWidth: 1, 
                stroke: d => scale(d.frame), 
                strokeOpacity: d => opacityScale(d.frame),
                fill: d => scale(d.frame), 
                fillOpacity: d => opacityScale(d.frame)}),
        ]
    })
    document.getElementById("plot-container").appendChild(plot);
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
/*
chart = 
*/