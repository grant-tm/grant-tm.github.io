var audio_source = document.getElementById('audio-source');
import { audioElement } from './audio_analysis.js';
import { audioContext } from './audio_analysis.js';

var play_pause_button = document.getElementById('play-pause-button');
var loop_enable_button = document.getElementById('loop-enable-button');
var seek_bar = document.getElementById('seek-bar');

var is_playing = false;
var loop_enabled = false;

play_pause_button.addEventListener('click', function() {
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
    
    // Play/Pause Logic
    if (play_pause_button.getAttribute("playing") === "false") {
        audioElement.play();
        play_pause_button.setAttribute("playing", "true");
    } 
    else if (play_pause_button.getAttribute("playing") === "true") {
        audioElement.pause();
        play_pause_button.setAttribute("playing", "false");
    }
});

loop_enable_button.addEventListener('click', function() {
    if (loop_enabled) {
        audio_source.loop = false;
        loop_enable_button.setAttribute('class', 'loop_disabled');
    } else {
        audio_source.loop = true;
        loop_enable_button.setAttribute('class', 'loop_enabled');
    }
    loop_enabled = !loop_enabled;
});

audio_source.addEventListener('timeupdate', function() {
    var current_time = audio_source.currentTime;
    var duration = audio_source.duration;
    seek_bar.value = (current_time / duration) * 100;
});

seek_bar.addEventListener('input', function() {
    var seek = audio_source.duration * (seek_bar.value / 100);
    audio_source.current_time = seek;
});