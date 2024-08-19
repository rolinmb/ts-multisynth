"use strict";
var audioCtx = undefined;
var masterComp = undefined;
var masterGain = undefined;
var masterDist = undefined;
var sinGain;
var sqrGain;
var sawGain;
var triGain;
var customGain;
var customWave = undefined;
var muted = true;
function getDistortionCurve(amount) {
    const k = typeof amount === "number" ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; i++) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
}
var c4 = { name: 'C4', frequency: 261.63,
    sinOsc: undefined, sqrOsc: undefined, sawOsc: undefined, triOsc: undefined, customOsc: undefined };
var cs4 = { name: 'C#4/Db4', frequency: 277.18,
    sinOsc: undefined, sqrOsc: undefined, sawOsc: undefined, triOsc: undefined, customOsc: undefined };
var d4 = { name: 'D4', frequency: 293.66,
    sinOsc: undefined, sqrOsc: undefined, sawOsc: undefined, triOsc: undefined, customOsc: undefined };
var ds4 = { name: 'D#4/Eb4', frequency: 311.13,
    sinOsc: undefined, sqrOsc: undefined, sawOsc: undefined, triOsc: undefined, customOsc: undefined };
var e4 = { name: 'E4', frequency: 329.63,
    sinOsc: undefined, sqrOsc: undefined, sawOsc: undefined, triOsc: undefined, customOsc: undefined };
var f4 = { name: 'F4', frequency: 349.23,
    sinOsc: undefined, sqrOsc: undefined, sawOsc: undefined, triOsc: undefined, customOsc: undefined };
var fs4 = { name: 'F#4/Gb4', frequency: 369.99,
    sinOsc: undefined, sqrOsc: undefined, sawOsc: undefined, triOsc: undefined, customOsc: undefined };
var g4 = { name: 'G4', frequency: 392.0,
    sinOsc: undefined, sqrOsc: undefined, sawOsc: undefined, triOsc: undefined, customOsc: undefined };
var gs4 = { name: 'G#4/Ab4', frequency: 415.3,
    sinOsc: undefined, sqrOsc: undefined, sawOsc: undefined, triOsc: undefined, customOsc: undefined };
var a4 = { name: 'A4', frequency: 440.0,
    sinOsc: undefined, sqrOsc: undefined, sawOsc: undefined, triOsc: undefined, customOsc: undefined };
var as4 = { name: 'A#4/Bb4', frequency: 466.16,
    sinOsc: undefined, sqrOsc: undefined, sawOsc: undefined, triOsc: undefined, customOsc: undefined };
var b4 = { name: 'B4', frequency: 493.88,
    sinOsc: undefined, sqrOsc: undefined, sawOsc: undefined, triOsc: undefined, customOsc: undefined };
var c5 = { name: 'C5', frequency: 523.25,
    sinOsc: undefined, sqrOsc: undefined, sawOsc: undefined, triOsc: undefined, customOsc: undefined };
var cs5 = { name: 'C#5/Db5', frequency: 554.37,
    sinOsc: undefined, sqrOsc: undefined, sawOsc: undefined, triOsc: undefined, customOsc: undefined };
var d5 = { name: 'D5', frequency: 587.33,
    sinOsc: undefined, sqrOsc: undefined, sawOsc: undefined, triOsc: undefined, customOsc: undefined };
var ds5 = { name: 'D#5/Eb5', frequency: 622.25,
    sinOsc: undefined, sqrOsc: undefined, sawOsc: undefined, triOsc: undefined, customOsc: undefined };
var e5 = { name: 'E5', frequency: 659.25,
    sinOsc: undefined, sqrOsc: undefined, sawOsc: undefined, triOsc: undefined, customOsc: undefined };
const noteMap = {
    'Q': c4,
    '2': cs4,
    'W': d4,
    '3': ds4,
    'E': e4,
    'R': f4,
    '5': fs4,
    'T': g4,
    '6': gs4,
    'Y': a4,
    '7': as4,
    'U': b4,
    'I': c5,
    '9': cs5,
    'O': d5,
    '0': ds5,
    'P': e5,
};
var pressedKeyMap = {};
var pressedNoteMap = {};
document.onkeydown = (e) => {
    let keyLabel = String(e.key).toUpperCase();
    pressedKeyMap[keyLabel] = true;
    document.getElementById('key-view').innerHTML = JSON.stringify(pressedKeyMap);
    if (keyLabel in noteMap) {
        let noteName = noteMap[keyLabel].name;
        if (!pressedNoteMap[noteName]) {
            pressedNoteMap[noteName] = true;
            const freq = noteMap[keyLabel].frequency;
            let sine = audioCtx.createOscillator();
            sine.type = "sine";
            sine.frequency.setValueAtTime(freq, audioCtx.currentTime);
            sine.connect(sinGain).connect(masterDist).connect(masterComp);
            let square = audioCtx.createOscillator();
            square.type = "square";
            square.frequency.setValueAtTime(freq, audioCtx.currentTime);
            square.connect(sqrGain).connect(masterDist).connect(masterComp);
            let sawtooth = audioCtx.createOscillator();
            sawtooth.type = "sawtooth";
            sawtooth.frequency.setValueAtTime(freq, audioCtx.currentTime);
            sawtooth.connect(sawGain).connect(masterDist).connect(masterComp);
            let triangle = audioCtx.createOscillator();
            triangle.type = "triangle";
            triangle.frequency.setValueAtTime(freq, audioCtx.currentTime);
            triangle.connect(triGain).connect(masterDist).connect(masterComp);
            let custom = audioCtx.createOscillator();
            custom.setPeriodicWave(customWave);
            custom.frequency.setValueAtTime(freq, audioCtx.currentTime);
            custom.connect(triGain).connect(masterDist).connect(masterComp);
            masterComp.connect(masterGain).connect(audioCtx.destination);
            if (!muted) {
                sine.start();
                square.start();
                sawtooth.start();
                triangle.start();
                custom.start();
            }
            noteMap[keyLabel].sinOsc = sine;
            noteMap[keyLabel].sqrOsc = square;
            noteMap[keyLabel].sawOsc = sawtooth;
            noteMap[keyLabel].triOsc = triangle;
            noteMap[keyLabel].customOsc = custom;
        }
    }
    document.getElementById('note-press-view').innerHTML = JSON.stringify(pressedNoteMap);
};
document.onkeyup = (e) => {
    let keyLabel = String(e.key).toUpperCase();
    pressedKeyMap[keyLabel] = false;
    document.getElementById('key-view').innerHTML = JSON.stringify(pressedKeyMap);
    if (keyLabel in noteMap) {
        let noteName = noteMap[keyLabel].name;
        pressedNoteMap[noteName] = false;
        try {
            noteMap[keyLabel].sinOsc.stop();
            noteMap[keyLabel].sqrOsc.stop();
            noteMap[keyLabel].sawOsc.stop();
            noteMap[keyLabel].triOsc.stop();
            noteMap[keyLabel].customOsc.stop();
        }
        catch (_a) { }
        noteMap[keyLabel].sinOsc = undefined;
        noteMap[keyLabel].sqrOsc = undefined;
        noteMap[keyLabel].sawOsc = undefined;
        noteMap[keyLabel].triOsc = undefined;
        noteMap[keyLabel].customOsc = undefined;
    }
    document.getElementById('note-press-view').innerHTML = JSON.stringify(pressedNoteMap);
};
document.getElementById('mute-unmute-btn').addEventListener('click', function () {
    muted = !muted;
    if (muted) {
        document.getElementById('mute-unmute-btn').innerHTML = 'click to unmute';
    }
    else {
        document.getElementById('mute-unmute-btn').innerHTML = 'click to mute';
    }
    for (const key in noteMap) {
        if (noteMap[key].sinOsc) {
            noteMap[key].sinOsc.stop();
            noteMap[key].sqrOsc.stop();
            noteMap[key].sawOsc.stop();
            noteMap[key].triOsc.stop();
            noteMap[key].customOsc.stop();
        }
        noteMap[key].sinOsc = undefined;
        noteMap[key].sqrOsc = undefined;
        noteMap[key].sawOsc = undefined;
        noteMap[key].triOsc = undefined;
        noteMap[key].customOsc = undefined;
    }
});
document.getElementById('master-gain-slider').addEventListener('input', function () {
    let slider = document.getElementById('master-gain-slider');
    let val = slider.valueAsNumber;
    masterGain.gain.setValueAtTime(val, audioCtx.currentTime);
    document.getElementById('master-gain-view').innerHTML = val.toString();
});
document.getElementById('master-threshold-slider').addEventListener('input', function () {
    let slider = document.getElementById('master-threshold-slider');
    let val = slider.valueAsNumber;
    masterComp.threshold.setValueAtTime(val, audioCtx.currentTime);
    document.getElementById('master-threshold-view').innerHTML = val.toString();
});
document.getElementById('master-knee-slider').addEventListener('input', function () {
    let slider = document.getElementById('master-knee-slider');
    let val = slider.valueAsNumber;
    masterComp.knee.setValueAtTime(val, audioCtx.currentTime);
    document.getElementById('master-knee-slider').innerHTML = val.toString();
});
document.getElementById('master-ratio-slider').addEventListener('input', function () {
    let slider = document.getElementById('master-ratio-slider');
    let val = slider.valueAsNumber;
    masterComp.ratio.setValueAtTime(val, audioCtx.currentTime);
    document.getElementById('master-ratio-view').innerHTML = val.toString();
});
document.getElementById('master-attack-slider').addEventListener('input', function () {
    let slider = document.getElementById('master-attack-slider');
    let val = slider.valueAsNumber;
    masterComp.attack.setValueAtTime(val, audioCtx.currentTime);
    document.getElementById('master-attack-view').innerHTML = val.toString();
});
document.getElementById('master-release-slider').addEventListener('input', function () {
    let slider = document.getElementById('master-release-slider');
    let val = slider.valueAsNumber;
    masterComp.release.setValueAtTime(val, audioCtx.currentTime);
    document.getElementById('master-release-view').innerHTML = val.toString();
});
document.getElementById('master-distortion-slider').addEventListener('input', function () {
    let slider = document.getElementById('master-distortion-slider');
    let val = slider.valueAsNumber;
    masterDist.curve = getDistortionCurve(val);
    document.getElementById('master-distortion-view').innerHTML = val.toString();
});
document.getElementById('sine-gain-slider').addEventListener('input', function () {
    let slider = document.getElementById('sine-gain-slider');
    let val = slider.valueAsNumber;
    sinGain.gain.setValueAtTime(val, audioCtx.currentTime);
    document.getElementById('sine-gain-view').innerHTML = val.toString();
});
document.getElementById('square-gain-slider').addEventListener('input', function () {
    let slider = document.getElementById('square-gain-slider');
    let val = slider.valueAsNumber;
    sqrGain.gain.setValueAtTime(val, audioCtx.currentTime);
    document.getElementById('square-gain-view').innerHTML = val.toString();
});
document.getElementById('sawtooth-gain-slider').addEventListener('input', function () {
    let slider = document.getElementById('sawtooth-gain-slider');
    let val = slider.valueAsNumber;
    sawGain.gain.setValueAtTime(val, audioCtx.currentTime);
    document.getElementById('sawtooth-gain-view').innerHTML = val.toString();
});
document.getElementById('triangle-gain-slider').addEventListener('input', function () {
    let slider = document.getElementById('triangle-gain-slider');
    let val = slider.valueAsNumber;
    triGain.gain.setValueAtTime(val, audioCtx.currentTime);
    document.getElementById('triangle-gain-view').innerHTML = val.toString();
});
document.getElementById('custom-gain-slider').addEventListener('input', function () {
    let slider = document.getElementById('custom-gain-slider');
    let val = slider.valueAsNumber;
    customGain.gain.setValueAtTime(val, audioCtx.currentTime);
    document.getElementById('custom-gain-view').innerHTML = val.toString();
});
document.getElementById('custom-harmonics-slider').addEventListener('input', function () {
    let slider = document.getElementById('custom-harmonics-slider');
    let val = slider.valueAsNumber;
    document.getElementById('custom-harmonics-view').innerHTML = val.toString();
});
function paintWaveform(real, imag) {
    let canvas = document.getElementById('custom-waveform-canvas');
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) {
        console.error("Error; <canvas> context not available.");
        return;
    }
    const width = canvas.width;
    const height = canvas.height;
    canvasCtx.clearRect(0, 0, width, height);
    canvasCtx.beginPath();
    for (let i = 0; i < width; i++) {
        const x = (i / width) * 2 - 1;
        const y = real.reduce((sum, a, n) => sum + a * Math.cos(n * Math.PI * x), 0) +
            imag.reduce((sum, b, n) => sum + b * Math.sin(n * Math.PI * x), 0);
        const yPos = (y / 2 + 0.5) * height;
        if (i === 0) {
            canvasCtx.moveTo(i, yPos);
        }
        else {
            canvasCtx.lineTo(i, yPos);
        }
    }
    canvasCtx.strokeStyle = 'blue';
    canvasCtx.lineWidth = 2;
    canvasCtx.stroke();
}
document.getElementById('gen-custom-wave-btn').addEventListener('click', function () {
    let slider = document.getElementById('custom-harmonics-slider');
    const numHarmonics = slider.valueAsNumber;
    let real = [];
    let imag = [];
    for (let i = 1; i <= numHarmonics; i++) {
        real.push(0);
        if (i % 2 === 1) {
            imag.push(1 / i);
        }
        else {
            imag.push(0);
        }
    }
    customWave = audioCtx.createPeriodicWave(real, imag);
    paintWaveform(real, imag);
});
window.addEventListener('load', function () {
    try {
        audioCtx = new AudioContext();
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.125, audioCtx.currentTime);
        let masterGainSlider = document.getElementById('master-gain-slider');
        masterGainSlider.value = String(0.125);
        masterComp = audioCtx.createDynamicsCompressor();
        masterComp.threshold.setValueAtTime(-50, audioCtx.currentTime);
        masterComp.knee.setValueAtTime(40, audioCtx.currentTime);
        masterComp.ratio.setValueAtTime(12, audioCtx.currentTime);
        masterComp.attack.setValueAtTime(0, audioCtx.currentTime);
        masterComp.release.setValueAtTime(0.25, audioCtx.currentTime);
        let compressorThresholdSlider = document.getElementById('master-threshold-slider');
        compressorThresholdSlider.value = String(-50);
        let compressorKneeSlider = document.getElementById('master-knee-slider');
        compressorKneeSlider.value = String(40);
        let compressorRatioSlider = document.getElementById('master-ratio-slider');
        compressorRatioSlider.value = String(12);
        let compressorAttackSlider = document.getElementById('master-attack-slider');
        compressorAttackSlider.value = String(0);
        let compressorReleaseSlider = document.getElementById('master-release-slider');
        compressorReleaseSlider.value = String(0.25);
        masterDist = audioCtx.createWaveShaper();
        masterDist.curve = getDistortionCurve(0);
        masterDist.oversample = '2x';
        let masterDistortionSlider = document.getElementById('master-distortion-slider');
        masterDistortionSlider.value = String(0);
        sinGain = audioCtx.createGain();
        sinGain.gain.setValueAtTime(0.125, audioCtx.currentTime);
        sqrGain = audioCtx.createGain();
        sqrGain.gain.setValueAtTime(0.125, audioCtx.currentTime);
        sawGain = audioCtx.createGain();
        sawGain.gain.setValueAtTime(0.125, audioCtx.currentTime);
        triGain = audioCtx.createGain();
        triGain.gain.setValueAtTime(0.125, audioCtx.currentTime);
        let waveformSliders = document.getElementsByClassName('waveform-slider');
        for (let i = 0; i < waveformSliders.length; i++) {
            let slider = waveformSliders[i];
            slider.value = String(0.125);
        }
        customGain = audioCtx.createGain();
        customGain.gain.setValueAtTime(0, audioCtx.currentTime);
        let customGainSlider = document.getElementById('custom-gain-slider');
        customGainSlider.value = String(0);
        let real = [];
        let imag = [];
        for (let i = 1; i <= 4; i++) {
            real.push(0);
            if (i % 2 === 1) {
                imag.push(1 / i);
            }
            else {
                imag.push(0);
            }
        }
        customWave = audioCtx.createPeriodicWave(real, imag);
        paintWaveform(real, imag);
        let customHarmonicsSlider = document.getElementById('custom-harmonics-slider');
        customHarmonicsSlider.value = String(4);
    }
    catch (error) {
        alert("The JavaScript Web Audio API is not supported by this browser.");
    }
});
