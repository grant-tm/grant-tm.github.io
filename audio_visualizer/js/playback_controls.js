var audio_source = document.getElementById('audio-source');
import { audioElement } from './audio_analysis.js';
import { audioContext } from './audio_analysis.js';

//***************************************************************************/
// PLAY BUTTON
//***************************************************************************/
var play_pause_button = document.getElementById('play-pause-button');
var play_pause_icon = document.getElementById('play-pause-icon');
play_pause_button.addEventListener('click', function() {
    // refresh audio context if it is suspendeds
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
    
    // Play or pause the audio
    if (play_pause_button.getAttribute("playing") === "false") {
        
        audioElement.play();
        
        play_pause_button.setAttribute("playing", "true");

        play_pause_icon.removeAttribute("class", "fa-solid fa-play");
        play_pause_icon.setAttribute("class", "fa-solid fa-pause");
    } 
    else if (play_pause_button.getAttribute("playing") === "true") {
        
        audioElement.pause();
        
        play_pause_button.setAttribute("playing", "false");

        play_pause_icon.removeAttribute("class", "fa-solid fa-pause");
        play_pause_icon.setAttribute("class", "fa-solid fa-play");
    }
});

//***************************************************************************/
// LOOP BUTTON
//***************************************************************************/
var loop_enable_button = document.getElementById('loop-enable-button');
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

//***************************************************************************/
// SEEK BAR
//***************************************************************************/
var seek_bar = document.getElementById('seek-bar');
audio_source.addEventListener('timeupdate', function() {
    var current_time = audio_source.currentTime;
    var duration = audio_source.duration;
    seek_bar.value = (current_time / duration) * 100;
});

seek_bar.addEventListener('input', function() {
    var seek = audio_source.duration * (seek_bar.value / 100);
    audio_source.currentTime = seek;
});