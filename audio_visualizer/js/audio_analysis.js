import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";

// Create an AudioContext instance
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Create an AnalyserNode to extract frequency data
const analyser = audioContext.createAnalyser();
analyser.fftSize = 512;

// Connect the AnalyserNode to the audio source
const audioElement = document.getElementById('audio-source');
const source = audioContext.createMediaElementSource(audioElement);
source.connect(analyser);
analyser.connect(audioContext.destination);

// Create a Uint8Array to store the frequency data
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

var timer = 0;

// Function to update the FFT data
function updateFFT() {
    analyser.getByteFrequencyData(dataArray);
    var data = storeFFTFrame(dataArray);

    timer += 1;
    if(timer > 4){
        updateGraph(data, history);
        timer = 0;
    }
    
    requestAnimationFrame(updateFFT);
}
updateFFT();

function storeFFTFrame(dataArray) {
    var frame = [];
    var datalength = dataArray.length;
    for (let i = 0; i < datalength; i++) {
        frame.push({
            index: i, 
            value: Math.max(0, dataArray[i] - (96 / (0.1 * (i+1))))
        });
    }
    return frame;
}

function updateGraph(data){
    if(!data){return;}
    if(document.getElementById("plot-container").firstChild){
        document.getElementById("plot-container").removeChild(document.getElementById("plot-container").firstChild);
    }
    var plot = Plot.plot({
        x: {domain: [0, data.length * 0.8]},
        y: {domain: [0, 256]},
        marks: [
            Plot.axisY({fill: "#1E1E1E",
                        tickSize: 0,
            }),
            Plot.axisX({fill: "#1E1E1E",
                        tickSize: 0,
            }),
            Plot.ruleY([0]),
            Plot.lineY(data, {
                x: "index", 
                y: "value", 
                stroke: "steelblue", 
                fillOpacity: 0.2, 
                fill: "steelblue"
            })
        ]
    })
    document.getElementById("plot-container").appendChild(plot);
}

export { audioElement }
export { audioContext }