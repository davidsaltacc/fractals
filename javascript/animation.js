
function isValidValue(x) {
    if (x instanceof Array) {
        return x.length == 0 ? false : (x[0] !== undefined && x[0] !== null && !isNaN(x[0]) && x[0] == "");
    }
    return (x !== undefined && x !== null && !isNaN(x) && x !== "");
}


function ifValidValue(x, thenDo) {
    isValidValue(x) ? thenDo() : "";
}
function ifValidValues(x, y, thenDo) {
    isValidValue(x) && isValidValue(y) ? thenDo() : "";
}

function lerp(a, b, t) {
    return (1 - t) * a + t * b;
}

class KeyframeGroup {

    constructor(time, easings, properties) {
        this.time = time;
        this.easings = easings;
        this.centerX = properties.centerX ?? null;
        this.centerY = properties.centerY ?? null;
        this.constantX = properties.constantX ?? null;
        this.constantY = properties.constantY ?? null;
        this.zoom = properties.zoom ?? null;
        this.radius = properties.radius ?? null;
        this.power = properties.power ?? null;
        this.colorOffset = properties.colorOffset ?? null;
        this.juliasetInterpolation = properties.juliasetInterpolation ?? null;
        this.colorfulness = properties.colorfulness ?? null;
        this.noiseSeed = properties.noiseSeed ?? null;
        this.noiseAmplitude = properties.noiseAmplitude ?? null;
        this.noiseMultiplier = properties.noiseMultiplier ?? null;
        this.maxIterations = properties.maxIterations ?? null;
        this.sampleCount = properties.sampleCount ?? null;
        this.priority = 0;
    }

    fullyValid() {
        return (
            isValidValue(this.centerX) &&
            isValidValue(this.centerY) &&
            isValidValue(this.constantX) &&
            isValidValue(this.constantY) &&
            isValidValue(this.zoom) &&
            isValidValue(this.radius) &&
            isValidValue(this.power) &&
            isValidValue(this.colorOffset) &&
            isValidValue(this.juliasetInterpolation) &&
            isValidValue(this.colorfulness) &&
            isValidValue(this.noiseSeed) &&
            isValidValue(this.noiseAmplitude) &&
            isValidValue(this.noiseMultiplier) &&
            isValidValue(this.maxIterations) &&
            isValidValue(this.sampleCount)
        );
    }

    apply(onJuliaset) {
        setCenter([ this.centerX, this.centerY ], onJuliaset, true);
        setConstantX(this.constantX, true);
        setConstantY(this.constantY, true);
        setZoom(this.zoom, onJuliaset, true);
        setRadius(this.radius, true);
        setPower(this.power, true);
        setColoroffset(this.colorOffset, true);
        setInterpolation(this.juliasetInterpolation, true);
        setColorfulness(this.colorfulness, true);
        setNoiseSeed(this.noiseSeed, true);
        setNoiseAmplitude(this.noiseAmplitude, true);
        setNoiseMultiplier(this.noiseMultiplier, true);
        setIterations(this.maxIterations, true);
        setSampleCount(this.sampleCount, true);
    }

}

class Sequence {

    constructor(length) {

        this.length = length;
        this.keyframeGroups = [];
        this.stopped = false;

    }
    
    setLength(length) {
        this.length = length;
    }

    addKeyframeGroup(kg) {
        this.keyframeGroups.push(kg);
    }

    sortKeyframes() {
        this.keyframeGroups.sort((a, b) => a.time - b.time)
        this.keyframeGroups.sort((a, b) => a.priority - b.priority);
    }

    getSingleInterpolatedValueAtTime(time, value) {

        var nearestBeforeIndex = -1;    
        var nearestAfterIndex = -1;    
        var minTimeDiffToBefore = Infinity;     
        var minTimeDiffToAfter = Infinity; 
        var maxBeforePriority = -Infinity;
        var maxAfterPriority = -Infinity;
        var timeBefore = -1;
        var timeAfter = -1;

        for (var i = 0; i < this.keyframeGroups.length; i++) {

            var kg = this.keyframeGroups[i];
            var diff = kg.time - time;

            if (Math.sign(diff) == -1) {
                if (minTimeDiffToBefore > diff && isValidValue(kg[value]) && kg.priority >= maxBeforePriority) {
                    minTimeDiffToBefore = Math.abs(diff);
                    nearestBeforeIndex = i;
                    timeBefore = kg.time;
                    maxBeforePriority = kg.priority;
                }
            } else if (Math.sign(diff) == 1) {
                if (minTimeDiffToAfter > diff && isValidValue(kg[value]) && kg.priority >= maxAfterPriority) {
                    minTimeDiffToAfter = Math.abs(diff);
                    nearestAfterIndex = i;
                    timeAfter = kg.time;
                    maxAfterPriority = kg.priority;
                }
            } else {
                if (isValidValue(kg[value])) {
                    nearestBeforeIndex = nearestAfterIndex = i;
                }
                break;
            }
        }

        if (Math.max(nearestBeforeIndex, nearestAfterIndex) == -1) {
            return null;
        } else if (Math.min(nearestBeforeIndex, nearestAfterIndex) == -1 && Math.max(nearestBeforeIndex, nearestAfterIndex) >= 0) {
            nearestBeforeIndex = nearestAfterIndex = Math.max(nearestBeforeIndex, nearestAfterIndex);
        }
        
        var valueBefore = this.keyframeGroups[nearestBeforeIndex][value];
        var valueAfter = this.keyframeGroups[nearestAfterIndex][value];

        return nearestBeforeIndex == nearestAfterIndex ? valueBefore : lerp(valueBefore, valueAfter, this.keyframeGroups[nearestAfterIndex].easings[value]((time - timeBefore) / (timeAfter - timeBefore)));

    }

    applyAtTime(time, onJuliaset) {

        if (this.length < 0 || this.keyframeGroups.length)

        if (time < 0 || time > this.length) {
            console.warn("Tried to apply animation state out of specified time range");
            return;
        }
        
        var interpCenterX = this.getSingleInterpolatedValueAtTime(time, "centerX");
        var interpCenterY = this.getSingleInterpolatedValueAtTime(time, "centerY"); ifValidValue(interpCenterX, () => ifValidValue(interpCenterY, () => setCenter([ interpCenterX, interpCenterY ], onJuliaset, true)));
        var interpConstantX = this.getSingleInterpolatedValueAtTime(time, "constantX"); ifValidValue(interpConstantX, () => { setConstantX(interpConstantX, true); });
        var interpConstantY = this.getSingleInterpolatedValueAtTime(time, "constantY"); ifValidValue(interpConstantY, () => { setConstantY(interpConstantY, true); });
        var interpZoom = this.getSingleInterpolatedValueAtTime(time, "zoom"); ifValidValue(interpZoom, () => setZoom(interpZoom, onJuliaset, true)); 
        var interpRadius = this.getSingleInterpolatedValueAtTime(time, "radius"); ifValidValue(interpRadius, () => setRadius(interpRadius, true));
        var interpPower = this.getSingleInterpolatedValueAtTime(time, "power"); ifValidValue(interpPower, () => setPower(interpPower, true));
        var interpColorOffset = this.getSingleInterpolatedValueAtTime(time, "colorOffset"); ifValidValue(interpColorOffset, () => setColoroffset(interpColorOffset, true));
        var interpInterpolation = this.getSingleInterpolatedValueAtTime(time, "juliasetInterpolation"); ifValidValue(interpInterpolation, () => setInterpolation(interpInterpolation, true));
        var interpColorfulness = this.getSingleInterpolatedValueAtTime(time, "colorfulness"); ifValidValue(interpColorfulness, () => setColorfulness(interpColorfulness, true));
        var interpNoiseSeed = this.getSingleInterpolatedValueAtTime(time, "noiseSeed"); ifValidValue(interpNoiseSeed, () => setNoiseSeed(interpNoiseSeed, true));
        var interpNoiseAmplitude = this.getSingleInterpolatedValueAtTime(time, "noiseAmplitude"); ifValidValue(interpNoiseAmplitude, () => setNoiseAmplitude(interpNoiseAmplitude, true));
        var interpNoiseMultiplier = this.getSingleInterpolatedValueAtTime(time, "noiseMultiplier"); ifValidValue(interpNoiseMultiplier, () => setNoiseMultiplier(interpNoiseMultiplier, true));
        var interpMaxIterations = this.getSingleInterpolatedValueAtTime(time, "maxIterations"); ifValidValue(interpMaxIterations, () => setIterations(interpMaxIterations, true));
        var interpSampleCount = this.getSingleInterpolatedValueAtTime(time, "sampleCount"); ifValidValue(interpSampleCount, () => setSampleCount(interpSampleCount, true)); 

    }

    pushArtificialKGAtBeginning(isJuliaset) {

        var linear = x => EASINGS.LINEAR.function(x, 1);

        var kg = new KeyframeGroup(0, {
            centerX: linear, 
            centerY: linear, 
            constantX: linear,
            constantY: linear, 
            zoom: linear, 
            radius: linear, 
            power: linear,
            colorOffset: linear, 
            juliasetInterpolation: linear, 
            colorfulness: linear, 
            noiseSeed: linear, 
            noiseAmplitude: linear, 
            noiseMultiplier: linear, 
            maxIterations: linear, 
            sampleCount: linear
        }, 
        {
            centerX: getCenter(isJuliaset)[0], 
            centerY: getCenter(isJuliaset)[1], 
            constantX: getConstant()[0],
            constantY: getConstant()[1], 
            zoom: getZoom(isJuliaset), 
            radius: getRadius(), 
            power: getPower(),
            colorOffset: getColorOffset(), 
            juliasetInterpolation: getInterpolation(), 
            colorfulness: getColorfulness(), 
            noiseSeed: getNoiseSeed(), 
            noiseAmplitude: getNoiseAmplitude(), 
            noiseMultiplier: getNoiseMultiplier(), 
            maxIterations: getIterations(), 
            sampleCount: getSampleCount()
        });

        kg.priority = -1;

        this.addKeyframeGroup(kg);

    }

    initAnimation(isJuliaset) {

        animationPlaying = true;
        this.stopped = false;
        this.paused = false;

        this.pushArtificialKGAtBeginning(isJuliaset);
        this.sortKeyframes();

    }
    
    _stopAnimation(isJuliaset) {

        animationPlaying = false;

        this.keyframeGroups[0].apply(isJuliaset);
        this.keyframeGroups.shift();

        renderBoth();
        updateUi();

    }

    play(onJuliaset) {

        if (animationPlaying) {
            console.warn("Tried to play animation while already playing");
            return;
        }

        this.initAnimation(onJuliaset);

        var startTime = performance.now();
        var duration = this.length * 1000;

        var fpsInterval = 1000 / FPS;
        var then = startTime;

        function frame(this_) {

            // TODO - run, pause & stop -> icons

            var now = performance.now();
            var elapsedTimeTotal = now - startTime;
            var elapsed = now - then;

            if (this_.paused) {
                startTime += elapsed;
            }
        
            if (elapsedTimeTotal < duration) {

                if (elapsed > fpsInterval) {
                    
                    then = now;

                    if (!this_.paused) {
                        
                        this_.applyAtTime(elapsedTimeTotal / 1000, onJuliaset);
                        renderBoth();
                        updateUi();

                    }

                }

                if (!this_.stopped) {
                    requestAnimationFrame(() => frame(this_));
                } else {
                    this_.stopped = false;
                    this_._stopAnimation();
                }

            } else {
                
                this_._stopAnimation(onJuliaset);

            }

        }

        requestAnimationFrame(() => frame(this));

    }

    pause() {
        this.paused = true;
    }

    unpause() {
        this.paused = false;
    }

    togglePause() {
        this.paused = !this.paused;
    }

    stop() {
        this.stopped = true;
    }

    async export(ofJuliaset, fps) {

        if (animationPlaying) {
            console.warn("Tried to export animation while playing");
            return;
        }
        
        this.initAnimation(ofJuliaset);

        logStatus("preparing animation");
        showLoadingWave();

        var frameDuration = 1000 / fps; 
        var canvas = ofJuliaset ? getJuliasetCanvas() : getMainCanvas();

        logStatus("initializing muxer");

        var muxer = new WebMMuxer.Muxer({
            target: new WebMMuxer.ArrayBufferTarget(),
            video: {
                codec: videoCodec == "vp9" ? "V_VP9" : (videoCodec == "vp8" ? "V_VP8" : ""),
                width: canvas.width,
                height: canvas.height,
                frameRate: fps
            },
            type: videoContainer == "webm" ? "webm" : (videoContainer == "mkv" ? "matroska" : "")
        });

        logStatus("initializing video encoder");

        var videoEncoder = new VideoEncoder({
            output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
            error: e => console.error(e)
        });
        var videoOptions = {
            codec: videoCodec == "vp9" ? "vp09.00.10.08" : (videoCodec == "vp8" ? "vp8" : ""), 
            width: canvas.width,
            height: canvas.height,
            framerate: fps
        };
        videoEncoder.configure(videoOptions);

        logStatus("starting to render animation");

        var frameIndex = 0;
        var frameAmount = this.length * fps;

        async function addFrame() {
            var bitmap = await drawReturnImageData(ofJuliaset ? contextJul : contextMain);
            var timestamp = frameIndex * frameDuration * 1000;
            videoEncoder.encode(new VideoFrame(bitmap, { 
                timestamp, 
                codedHeight: canvas.height, 
                codedWidth: canvas.width, 
                format: "RGBA" 
            }));
        }

        for (; frameIndex < frameAmount; frameIndex++) {

            logStatus("rendering frame " + frameIndex + " / " + frameAmount);

            this.applyAtTime(frameIndex * frameDuration / 1000, ofJuliaset);
            await addFrame();

        }

        this.applyAtTime(this.length, ofJuliaset);
        await addFrame();

        logStatus("flushing encoder and finalizing muxing");

        await videoEncoder.flush(); 
        muxer.finalize(); 
        var { buffer } = muxer.target;

        logStatus("starting download");

        var blob = new Blob([ buffer ], { type: ("video/" + videoContainer) });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "animation." + videoContainer;
        a.click();
        a.remove();

        this._stopAnimation();

        logStatus("done");

        hideLoadingWave();

    }

}

var animationLength = 10;
var animation = new Sequence(animationLength);
var zoomLevel = 100;
var addedKeyframes = [];
var selectedKeyframe = null;
var animationPlaying = false;

var videoContainer = "mkv";
var videoCodec = "vp8";
var FPS = 60;

function updateEditor() {

    var vertLineContainer = document.getElementById("anim-vert-container");
    var trackContainer = document.getElementById("anim-track-container");
    var timestampContainer = document.getElementById("anim-timestamp-container");
    var editKfContainer = document.getElementById("edit-keyframe-container");

    vertLineContainer.innerHTML = "";
    timestampContainer.innerHTML = "";

    trackContainer.style.width = animationLength * zoomLevel + 80 + "px";

    for (var x = 0; x <= animationLength; x++) {

        var vertLine = document.createElement("div");
        vertLine.className = "animation-vertical-line";
        vertLine.style.left = zoomLevel * x + "px";
        vertLineContainer.appendChild(vertLine);
        
        var timestamp = document.createElement("div");
        timestamp.className = "animation-timestamp";
        timestamp.style.left = zoomLevel * x + "px";
        timestamp.innerHTML = Math.floor(x / 60) + ":" + Math.floor(x % 60).toString().padStart(2, "0");
        timestampContainer.appendChild(timestamp);

    }
    
    for (let track of trackContainer.children) {
        track.style.width = animationLength * zoomLevel + "px";
        track.innerHTML = "";
    }

    for (let keyframe of addedKeyframes) {

        var keyframeDiv = document.createElement("div");
        keyframeDiv.className = "animation-keyframe";
        if (keyframe.selected) { keyframeDiv.classList.add("selected-keyframe") }
        keyframeDiv.style.left = keyframe.time * zoomLevel + "px";
        keyframe.trackElement.appendChild(keyframeDiv);

        keyframeDiv.addEventListener("click", () => { keyframe.select(); updateEditor(); });

    }

    if (selectedKeyframe) {

        editKfContainer.style.opacity = "100%";
        editKfContainer.style.pointerEvents = "";

        document.getElementById("keyframe-time").value = selectedKeyframe.time;
        document.getElementById("keyframe-value").value = selectedKeyframe.value;
        document.getElementById("keyframe-easing-strength").value = selectedKeyframe.easingStrength;
        keyframeEasingNameSet(translatable(selectedKeyframe.easing.name).outerHTML);

    } else {
        editKfContainer.style.opacity = "40%";
        editKfContainer.style.pointerEvents = "none";
    }

}

function setAnimationLength(length) {
    length = parseFloat(length.length == 0 ? 0 : length);
    animation.setLength(length);
    animationLength = length;
    updateEditor();
}

function getAnimationLength() {
    return animationLength;
}

function increaseAnimZoom() {
    zoomLevel = Math.min(1000, zoomLevel + 10);
    updateEditor();
}

function decreaseAnimZoom() {
    zoomLevel = Math.max(40, zoomLevel - 10);
    updateEditor();
}

function setKeyframeTime(value) {
    if (selectedKeyframe) {
        selectedKeyframe.time = parseFloat(value);
    }
    updateEditor();
}

function setKeyframeValue(value) {
    if (selectedKeyframe) {
        selectedKeyframe.value = parseFloat(value);
    }
}

function setKeyframeEasing(easing) {
    if (selectedKeyframe) {
        selectedKeyframe.easing = easing;
    }
}

function setKeyframeEasingStrength(strength) {
    if (selectedKeyframe) {
        selectedKeyframe.easingStrength = strength;
    }
}

function removeKeyframe() {
    addedKeyframes.splice(addedKeyframes.indexOf(selectedKeyframe), 1);
    selectedKeyframe.unselect();
    updateEditor();
}

function deselectKeyframe() {
    selectedKeyframe.unselect();
    updateEditor();
}

class UIKeyframe {

    constructor(trackElement, time, property, value) {
        this.trackElement = trackElement;
        this.time = time;
        this.property = property;
        this.value = value ?? "";
        this.selected = false;
        this.easing = EASINGS.LINEAR;
        this.easingStrength = 2;
    }

    setValue(value) {
        this.value = value;
    }

    select() {
        addedKeyframes.forEach(kf => kf.unselect());
        selectedKeyframe = this;
        this.selected = true;
    }

    unselect() {
        selectedKeyframe = null;
        this.selected = false;
    }

}

function addAnimationTrack(id, name, property) {

    document.getElementById(id).style.display = "none";

    var trackLabelDiv = document.createElement("div");
    trackLabelDiv.className = "track-label";
    trackLabelDiv.innerHTML = name;
    document.getElementById("anim-track-labels").appendChild(trackLabelDiv);

    var trackRemoveButton = document.createElement("button");
    trackRemoveButton.className = "remove-track";
    trackLabelDiv.appendChild(trackRemoveButton);

    var trackDiv = document.createElement("div");
    trackDiv.className = "animation-track";
    trackDiv.id = "track-" + property;
    document.getElementById("anim-track-container").appendChild(trackDiv);

    trackRemoveButton.onclick = evt => {

        document.getElementById(id).style.display = "block";

        var newKeyframes = [];

        if (selectedKeyframe && selectedKeyframe.property == property) {
            selectedKeyframe.unselect();
        }

        for (var keyframe of addedKeyframes) {
            if (trackDiv != keyframe.trackElement) {
                newKeyframes.push(keyframe);
            }
        }

        addedKeyframes = newKeyframes;

        trackDiv.remove();
        trackLabelDiv.remove();

        updateEditor();

    };

    trackDiv.onclick = evt => {

        if (evt.target != trackDiv) {
            return;
        }

        var time = evt.offsetX / zoomLevel;

        if (Math.abs(time - Math.round(time)) < 0.05) {
            time = Math.round(time);
        }

        for (let kf of addedKeyframes) {
            if (kf.time == time && kf.trackElement == trackDiv) {
                return;
            }
        }

        var kf = new UIKeyframe(trackDiv, time, property);

        addedKeyframes.push(kf);
        kf.select();
        updateEditor();

    };

    updateEditor();

}

Object.keys(EASINGS).forEach(easing => {

    var a = document.createElement("a");
    a.id = easing.toLowerCase() + "-animEasing";
    a.innerHTML = translatable(EASINGS[easing].name).outerHTML;
    a.onclick = () => {
        setKeyframeEasing(EASINGS[easing]);
        toggleAnimEasingDropdown();
        keyframeEasingNameSet(a.innerHTML);
    };
    document.getElementById("animEasingDropdownContent").appendChild(a);

});

var properties = {
    centerX: translatable("anim_center_x").outerHTML,
    centerY: translatable("anim_center_y").outerHTML,
    zoom: translatable("anim_zoom").outerHTML,
    constantX: translatable("anim_constant_x").outerHTML,
    constantY: translatable("anim_constant_y").outerHTML,
    radius: translatable("anim_radius").outerHTML,
    power: translatable("anim_power").outerHTML,
    maxIterations: translatable("anim_max_iterations").outerHTML,
    sampleCount: translatable("anim_sample_count").outerHTML,
    colorOffset: translatable("anim_color_offset").outerHTML,
    colorfulness: translatable("anim_colorfulness").outerHTML,
    juliasetInterpolation: translatable("anim_juliaset_interpolation").outerHTML,
    noiseSeed: translatable("anim_noise_seed").outerHTML,
    noiseAmplitude: translatable("anim_noise_amp").outerHTML,
    noiseMultiplier: translatable("anim_noise_multiplier").outerHTML
};

Object.keys(properties).forEach(property => {

    var a = document.createElement("a");
    a.id = property + "-addAnimTrack";
    a.innerHTML = properties[property];
    a.onclick = _ => {
        addAnimationTrack(a.id, properties[property], property);
        toggleAddTrackDropdown();
    };

    document.getElementById("addTrackDropdownContent").appendChild(a);

})

function regenerateAnimation() {

    animation = new Sequence(animationLength);

    var groupedKeyframes = {};

    addedKeyframes.forEach(kf => {
        if (!groupedKeyframes[kf.time]) {
            groupedKeyframes[kf.time] = [];
        }
        groupedKeyframes[kf.time].push(kf);
    });

    function keyframeForProperty(keyframes, property) {
        for (var kf of keyframes) {
            if (kf.property == property) {
                return kf;
            }
        }
        return { value: null, easing: null };
    }
    function keyframeValueForProperty(keyframes, property) {
        return keyframeForProperty(keyframes, property).value;
    }
    function keyframeEasingForProperty(keyframes, property) {
        var kf = keyframeForProperty(keyframes, property);
        return x => kf.easing.function(x, kf.easingStrength);
    }
    

    Object.keys(groupedKeyframes).forEach(time => {

        if (parseFloat(time) > animationLength) {
            return;
        } 

        var keyframes = groupedKeyframes[time];
    
        animation.addKeyframeGroup(new KeyframeGroup(parseFloat(time), {
            centerX: keyframeEasingForProperty(keyframes, "centerX"), 
            centerY: keyframeEasingForProperty(keyframes, "centerY"), 
            constantX: keyframeEasingForProperty(keyframes, "constantX"),
            constantY: keyframeEasingForProperty(keyframes, "constantY"),
            zoom: keyframeEasingForProperty(keyframes, "zoom"),
            radius: keyframeEasingForProperty(keyframes, "radius"),
            power: keyframeEasingForProperty(keyframes, "power"),
            colorOffset: keyframeEasingForProperty(keyframes, "colorOffset"),
            juliasetInterpolation: keyframeEasingForProperty(keyframes, "juliasetInterpolation"),
            colorfulness: keyframeEasingForProperty(keyframes, "colorfulness"),
            noiseSeed: keyframeEasingForProperty(keyframes, "noiseSeed"),
            noiseAmplitude: keyframeEasingForProperty(keyframes, "noiseAmplitude"),
            noiseMultiplier: keyframeEasingForProperty(keyframes, "noiseMultiplier"),
            maxIterations: keyframeEasingForProperty(keyframes, "maxIterations"),
            sampleCount: keyframeEasingForProperty(keyframes, "sampleCount")
        }, 
        {
            centerX: keyframeValueForProperty(keyframes, "centerX"), 
            centerY: keyframeValueForProperty(keyframes, "centerY"), 
            constantX: keyframeValueForProperty(keyframes, "constantX"),
            constantY: keyframeValueForProperty(keyframes, "constantY"),
            zoom: keyframeValueForProperty(keyframes, "zoom"),
            radius: keyframeValueForProperty(keyframes, "radius"),
            power: keyframeValueForProperty(keyframes, "power"),
            colorOffset: keyframeValueForProperty(keyframes, "colorOffset"),
            juliasetInterpolation: keyframeValueForProperty(keyframes, "juliasetInterpolation"),
            colorfulness: keyframeValueForProperty(keyframes, "colorfulness"),
            noiseSeed: keyframeValueForProperty(keyframes, "noiseSeed"),
            noiseAmplitude: keyframeValueForProperty(keyframes, "noiseAmplitude"),
            noiseMultiplier: keyframeValueForProperty(keyframes, "noiseMultiplier"),
            maxIterations: keyframeValueForProperty(keyframes, "maxIterations"),
            sampleCount: keyframeValueForProperty(keyframes, "sampleCount")
        }));
    });

}

function playAnimation(onJuliaset) {
    regenerateAnimation();
    animation.play(onJuliaset);
}

function toggleAnimationPaused() {
    animation.togglePause();
}

function stopAnimation() {
    animation.stop();
}

function exportAnimation(ofJuliaset) {
    regenerateAnimation();
    animation.export(ofJuliaset, FPS); 
}

function setAnimationFPS(fps) {
    FPS = Math.max(1, parseFloat(fps));
}

function setAnimationVideoContainer(container) {
    if (container == "mkv" || container == "webm") {
        videoContainer = container;
    } else {
        console.warn("Tried to set invalid video container.");
        return;
    }

    if (container == "mkv") {
        document.getElementById("mkv-btn").className = "button-highlight";
        document.getElementById("webm-btn").className = "";
    } else if (container == "webm") {
        document.getElementById("mkv-btn").className = "";
        document.getElementById("webm-btn").className = "button-highlight";
    }
}

async function codecSupported(codec) {
    return (await (VideoEncoder.isConfigSupported({ codec: codec, width: 500, height: 500 }))).supported;
}

async function setAnimationVideoCodec(codec) {
    if (codec == "vp8" || codec == "vp9") {
        if (codec == "vp8" && !(await codecSupported("vp8"))) {
            [ console.warn, alert ].forEach(f => f(translate("vcodec_not_supported", "VP8")));
            return;
        } 
        if (codec == "vp9" && !(await codecSupported("vp09.00.10.08"))) {
            [ console.warn, alert ].forEach(f => f(translate("vcodec_not_supported", "VP9")));
            return;
        } 
        videoCodec = codec;
    } else {
        console.warn("Tried to set invalid video codec.");
        return;
    }

    if (codec == "vp8") {
        document.getElementById("vp8-btn").className = "button-highlight";
        document.getElementById("vp9-btn").className = "";
    } else if (codec == "vp9") {
        document.getElementById("vp8-btn").className = "";
        document.getElementById("vp9-btn").className = "button-highlight";
    }

}

function getAnimationData() {

    return {
        l: animationLength,
        kfs: addedKeyframes.map(kf => { 
            return { 
                t: kf.time, 
                p: kf.property,
                v: kf.value,
                e: Object.keys(EASINGS).find(e => EASINGS[e] == kf.easing),
                es: 2
            };
        })
    };

}

function applyAnimationData(data) {

    animation.setLength(data.l);
    animationLength = data.l;

    for (var btn of document.getElementsByClassName("remove-track")) {
        btn.onclick();
    }

    var addedAnimTracks = [];

    data.kfs.forEach(kf => {

        if (!addedAnimTracks.includes(kf.p)) {
            addedAnimTracks.push(kf.p);
            addAnimationTrack(kf.p + "-addAnimTrack", properties[kf.p], kf.p);
        }

        var keyframe = new UIKeyframe(document.getElementById("track-" + kf.p), kf.t, kf.p, kf.v);
        keyframe.value = kf.v;
        keyframe.easing = EASINGS[kf.e];
        keyframe.easingStrength = kf.es;

        addedKeyframes.push(keyframe);

    });

    updateEditor();

}

function getAnimation() {
    return animation;
}

addAnimationTrack("zoom-addAnimTrack", translatable("anim_zoom").outerHTML, "zoom");
updateEditor();

keyframeEasingNameSet(translatable(EASINGS.LINEAR.name).outerHTML);

setAnimationVideoCodec((await codecSupported("vp9")) ? "vp9" : "vp8");
setAnimationVideoContainer("mkv");

const exports = {
    KeyframeGroup,
    Sequence,
    addAnimationTrack,
    setAnimationLength,
    getAnimationLength,
    playAnimation,
    updateEditor,
    increaseAnimZoom, 
    decreaseAnimZoom,
    setKeyframeTime,
    setKeyframeValue,
    setKeyframeEasingStrength,
    regenerateAnimation,
    removeKeyframe,
    stopAnimation,
    exportAnimation,
    setAnimationFPS,
    setAnimationVideoContainer,
    setAnimationVideoCodec,
    getAnimationData,
    applyAnimationData,
    getAnimation,
    deselectKeyframe,
    toggleAnimationPaused
};
for (const [name, func] of Object.entries(exports)) { window[name] = func; }

onAnimationsInitialized();