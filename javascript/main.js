
const el = id => document.getElementById(id);

if (window.location.href.startsWith("http://127.0.0.1") || window.location.href.startsWith("http://localhost")) { // sorry
    el("sb").style.display = "none";
}

function logStatus(s, noui) {
    console.log(s);
    if (!noui) { el("statusbar").innerHTML = s };
}

logStatus("starting initialization");

var USE_WEBGPU = "gpu" in navigator && !!(await navigator.gpu.requestAdapter());
var USE_WEBGL = !USE_WEBGPU && (typeof WebGL2RenderingContext !== "undefined");
var DISABLED = !USE_WEBGPU && !USE_WEBGL;

if (DISABLED) {
    [ "statusbar", "loadingwave-center" ].forEach(i => el(i).remove());
    el("loadingscreen").style.backgroundColor = "rgb(0, 0, 0)";
    [ alert, e => { throw new Error(e) } ].forEach(f => f(translate("no_gpu_supported")));
}

var usingBackend = (USE_WEBGPU ? "WebGPU" : (USE_WEBGL ? "WebGL" : "this should not appear"));
logStatus("detected available " + usingBackend + ". using that");

var fxUrl = new URL(window.location.href);
var fxParams = fxUrl.searchParams;

if (fxParams.get("forceWebGL") == "1") {

    USE_WEBGPU = false; USE_WEBGL = true;
    usingBackend = "WebGL";
    logStatus("force overriden backend to " + usingBackend);

} else if (fxParams.get("forceWebGPU") == "1") {

    USE_WEBGPU = true; USE_WEBGL = false;
    usingBackend = "WebGPU";
    logStatus("force overriden backend to " + usingBackend);

}

el("fxversion").innerHTML = METADATA.version;
el("fxbackend").innerHTML = usingBackend;

for (var backendEl of document.getElementsByClassName("backend")) { backendEl.innerHTML = usingBackend; }

function forceEnableBackend(backend) {
    includeAnimationInPreset(true);
    includePluginsInPreset(true);
    includeCanvasSizeInPreset(true);
    includeSmoothingInPreset(true);
    var url = new URL(createUrlWithParameters());
    url.searchParams.set("force" + backend, "1");
    window.location.href = url.href;
}
function forceWebGL() { forceEnableBackend("WebGL") }
function forceWebGPU() { forceEnableBackend("WebGPU") }

if (usingBackend == "WebGPU") {
    el("fractalFunctionCode").innerHTML = "fn iterate(z: vec2&lt;f32&gt;, c: vec2&lt;f32&gt;, power: f32) -&gt; vec2&lt;f32&gt; {";
    el("colorschemeFunctionCode").innerHTML = "fn color(x: f32) -&gt; vec4&lt;f32&gt; {";
} else if (usingBackend == "WebGL") {
    el("fractalFunctionCode").innerHTML = "vec2 iterate(vec2 z, vec2 c, float power) {";
    el("colorschemeFunctionCode").innerHTML = "vec4 colorscheme(float x) {";
}

function createUiSection(titleHTML, contentHTML, defaultHidden, insertInto) {

    if (DEBUG_MODE) {
        logStatus("creating UI section " + titleHTML.trim() + ", " + (defaultHidden ? "" : "not ") + "hidden by default, inserting into " + insertInto, true);
    }

    var areaToggle = document.createElement("div");
    insertInto.appendChild(areaToggle);
    areaToggle.className = "collapsToggle";

    var areaToggleArrow = document.createElement("span");
    areaToggle.appendChild(areaToggleArrow);
    areaToggleArrow.className = "areaind";
    areaToggleArrow.innerHTML = defaultHidden ? "&#11208;" : "&#11206;";


    var areaContent = document.createElement("div");
    insertInto.appendChild(areaContent);
    areaContent.style.display = defaultHidden ? "none" : "block";
    
    areaToggle.insertAdjacentHTML("beforeend", titleHTML);
    areaContent.insertAdjacentHTML("beforeend", contentHTML);

    areaToggle.addEventListener("click",  _ => {
        if (areaContent.style.display == "none") {
            areaContent.style.display = "block";
            areaToggleArrow.innerHTML = "&#11206;";
        } else {
            areaContent.style.display = "none";
            areaToggleArrow.innerHTML = "&#11208;";
        }
    });  

    return areaContent;

}

function _createUiSection(toggleable) {

    var title = toggleable.getElementsByClassName("toggleable_title").item(0);
    var content = toggleable.getElementsByClassName("toggleable_content").item(0);
    var titleHTML = title.innerHTML;
    var contentHTML = content.innerHTML;

    var defaultHidden = toggleable.classList.contains("toggleable_default_hidden");

    title.remove();
    content.remove();

    createUiSection(titleHTML, contentHTML, defaultHidden, toggleable);

};

Array.from(document.getElementsByClassName("toggleable")).forEach(toggleable => _createUiSection(toggleable));

function _createShaderButton(name, clickHandler, buttons, item, definitions) {

    if (DEBUG_MODE) {
        logStatus("creating shader button '" + name + "' with shader '" + (definitions[item].shader_folder ?? "") + definitions[item].shader + ".frxs'", true);
    }

    var button = document.createElement("button");

    button.innerHTML = name;
    button.className = "shaderButton";
    button.onclick = clickHandler;

    buttons[item] = button;

    return button;

}

const fractalButtons = {};
const colorschemeButtons = {};
const colormethodButtons = {};
const modifierButtons = {};

function initButtons(definitions, buttons, setFunction, containerId) {

    Object.keys(definitions).forEach(item => {

        var button = _createShaderButton(translatable(definitions[item].name).outerHTML, () => setFunction(definitions[item]), buttons, item, definitions);
        el(containerId).appendChild(button);

    });

}

[
    [FRACTALS, fractalButtons, setFractal, "fractalButtons"],
    [COLORSCHEMES, colorschemeButtons, setColorscheme, "colorschemeButtons"],
    [COLOR_METHODS, colormethodButtons, setColormethod, "colormethodButtons"],
    [MODIFIERS, modifierButtons, setModifier, "modifierButtons"]
].forEach(a => initButtons(a[0], a[1], a[2], a[3]));

function parseFRXSFile(content) {

    var currentBackends = [];
    var finalShaderContent = "";

    for (var line of content.split("\n")) {

        if (line.startsWith("#")) {
            if (line.startsWith("#ifbackend")) {
                var backends = line.trim().replace("#ifbackend", "").replaceAll(" ", "").slice(1).slice(0, -1).split(",");
                currentBackends = backends[0] == "*" ? ["all"] : backends;
            } else if (line.startsWith("#endbackend")) {
                currentBackends = [];
                continue;
            }
        } else {
            if (currentBackends.length == 0) {
                continue;
            } else if ((currentBackends.includes("webgpu") && USE_WEBGPU) || (currentBackends.includes("webgl") && USE_WEBGL) || currentBackends[0] == "all") {
                finalShaderContent += line + "\n";
            }
        }

    }

    if (DEBUG_MODE) {
        logStatus("parsed .frxs file, \nINPUT:\n\n" + content + "\n\nOUTPUT:\n\n" + finalShaderContent, true);
    }

    return finalShaderContent;

}

const canvasMain = el("canvasMain");
const canvasJul = el("canvasJul");
var contextMain;
var contextJul;

wgpu_format = "rgba8unorm"; 

function getInitializedCanvasContext(canvas) {

    var context;
    
    if (USE_WEBGPU) {

        context = canvas.getContext("webgpu", { preserveDrawingBuffer: true });

        context.configure({
            device: wgpu_device,
            format: wgpu_format
        });
        
    } else if (USE_WEBGL) {
        context = canvas.getContext("webgl2", { preserveDrawingBuffer: true });
    }

    if (DEBUG_MODE) {
        logStatus("requested to initialize canvas context " + context, true);
    }

    return context;

}

var wgpu_adapter;
var wgpu_device;

if (USE_WEBGPU) {

    logStatus("initializing WebGPU. if this takes more than a few seconds, the fractal explorer probably crashed the last time you used it. in that case, simply restart your browser. ");

    try {
        wgpu_adapter = await navigator.gpu.requestAdapter();
        wgpu_device = await wgpu_adapter.requestDevice();
    } catch {
        logStatus("failed to initialize WebGPU. ");
    }

} else if (USE_WEBGL) {
    
    logStatus("initializing WebGL");

}

contextMain = getInitializedCanvasContext(canvasMain);
contextJul = getInitializedCanvasContext(canvasJul);
    
if (contextMain == null || contextJul == null) {
    [ logStatus, s => { throw new Error(s); } ].forEach(f => f("error initializing. the fractal explorer probably crashed the last time you used it. in that case, simply restart your browser."));
}

function gpuLost() {
    renderMain();
    renderJul();
    alert(translate("gpu_lost"));
}

if (USE_WEBGPU) {
    wgpu_device.lost.then(gpuLost);
} else if (USE_WEBGL) {
    canvasMain.addEventListener("webglcontextlost", gpuLost);
}


function showLoadingWave() {
    el("loadingscreen").style.display = "block";
}

function hideLoadingWave() {
    el("loadingscreen").style.display = "none";
}

function _canvasTooBig(size) {

    var tooBig = size > (window.innerWidth - window.innerWidth / 6) / 2 || size > window.innerHeight - window.innerHeight / 4;

    if (DEBUG_MODE) {
        logStatus("checked if canvas of size " + size + " is too big for window of size " + window.innerWidth + "x" + window.innerHeight + ", result: " + tooBig, true);
    }

    return tooBig;

}
function canvasTooBig() {
    return _canvasTooBig(canvasMain.width);
}

function setCanvasesSticky(sticky) {

    el("canvasContainer").className = sticky ? "sticky" : (canvasTooBig() ? "unsticky unsticky-big" : "unsticky");
    el("descriptions").style.maxWidth = sticky ? "calc(100vw - 1100px)" : ""; 

}

function stickyCanvasesIfFit() {
    setCanvasesSticky(!canvasTooBig());
}

var customFractal = false;
var customCs = false;

var centerMain;
var zoomMain;
var centerJul;
var zoomJul;
var maxIterations;
var radius;
var power;
var colorOffset;
var fractalType;
var colorscheme;
var colorMethod;
var modifier;
var juliasetConstant;
var juliasetInterpolation;
var colorfulness;
var sampleCount;
var noiseSeed ;
var noiseAmplitude;
var noiseMultiplier;

function reset(noCompile) {

    centerMain = [0, 0];
    centerJul = [0, 0];
    zoomMain = 1 / 2.5;
    zoomJul = 1 / 2.5;
    maxIterations = 200;
    radius = 100000;
    power = 2;
    colorOffset = 0;
    fractalType = FRACTALS.MANDELBROT;
    colorscheme = COLORSCHEMES.CLASSIC;
    colorMethod = COLOR_METHODS.SMOOTH;
    modifier = MODIFIERS.NONE;
    juliasetConstant = [0, 0];
    juliasetInterpolation = 1;
    colorfulness = 1;
    sampleCount = 16;
    noiseSeed = 33333;
    noiseAmplitude = 0;
    noiseMultiplier = 0.8;

    if (!noCompile) {
        compileAndRender();
    }

}

function resetNoCompile() {
    reset(true);
}

function randomize() {

    resetNoCompile();

    radius = [10, 50, 400, 1000, 10000000][Math.floor(Math.random() * 5)];
    power = (1 + Math.floor(Math.random() * 6)) * (Math.random() > 0.7 ? -1 : 1);
    colorOffset = Math.random() * 2;
    colorfulness = Math.random() * 2 + 0.1;
    var fractalKeys = Object.keys(FRACTALS);
    fractalType =  FRACTALS[fractalKeys[ Math.floor(fractalKeys.length * Math.random()) ]];
    var colorschemeKeys = Object.keys(COLORSCHEMES);
    colorscheme =  COLORSCHEMES[colorschemeKeys[ Math.floor(colorschemeKeys.length * Math.random()) ]];
    var colorMethodKeys = Object.keys(COLOR_METHODS);
    colorMethod =  COLOR_METHODS[colorMethodKeys[ Math.floor(colorMethodKeys.length * Math.random()) ]];
    if (Math.random() > 0.65) {
        var modifierKeys = Object.keys(MODIFIERS);
        modifier =  MODIFIERS[modifierKeys[ Math.floor(modifierKeys.length * Math.random()) ]];
        if ([MODIFIERS.TANH, MODIFIERS.LOG, MODIFIERS.ATAN, MODIFIERS.ASIN, MODIFIERS.ASINH, MODIFIERS.ACOS, MODIFIERS.ACOSH, MODIFIERS.ATANH].includes(modifier)) 
            { colorMethod = [COLOR_METHODS.INTERIOR, COLOR_METHODS.INTERIOR_2, COLOR_METHODS.INTERIOR_STRIPES, COLOR_METHODS.INTERIOR_STRIPES][Math.floor(Math.random() * 4)] }
    }
    juliasetInterpolation = Math.random() > 0.25 ? 1 : 1 - Math.pow(Math.random(), 2);

    compileAndRender();

}

var skipNextCompilation = false;

var wgpu_pipeline;
var wgpu_bindGroup;
var wgpu_uniformBuffer;
var wgpu_format;

var wgl_programMain;
var wgl_programJul;

if (USE_WEBGPU) {

    logStatus("setting up WebGPU uniform buffers");

    var uniformBufferSize = Math.ceil((
        + 2 * Float32Array.BYTES_PER_ELEMENT // center: vec2<f32>
        + 2 * Float32Array.BYTES_PER_ELEMENT // juliasetConstant: vec2<f32>
        + 2 * Float32Array.BYTES_PER_ELEMENT // canvasDimensions: vec2<f32>
        + Float32Array.BYTES_PER_ELEMENT // zoom: f32
        + Float32Array.BYTES_PER_ELEMENT // radius: f32
        + Float32Array.BYTES_PER_ELEMENT // power: f32
        + Float32Array.BYTES_PER_ELEMENT // colorOffset: f32
        + Float32Array.BYTES_PER_ELEMENT // juliasetInterpolation: f32
        + Float32Array.BYTES_PER_ELEMENT // colorfulness: f32
        + Float32Array.BYTES_PER_ELEMENT // noiseSeed: f32
        + Float32Array.BYTES_PER_ELEMENT // noiseAmplitude: f32
        + Float32Array.BYTES_PER_ELEMENT // noiseMultiplier: f32
        + Uint32Array.BYTES_PER_ELEMENT // maxIterations: u32
        + Uint32Array.BYTES_PER_ELEMENT // sampleCount: u32
        + Uint32Array.BYTES_PER_ELEMENT // chunkerFinalSize: u32
        + Uint32Array.BYTES_PER_ELEMENT // chunkerChunkSize: u32
        + 2 * Uint32Array.BYTES_PER_ELEMENT // chunkerPos: vec2<u32>
        + Uint32Array.BYTES_PER_ELEMENT // flags: u32
    ) / 8) * 8;

    if (DEBUG_MODE) {
        logStatus("webgpu uniform buffer size is " + uniformBufferSize, true);
    }

    wgpu_uniformBuffer = wgpu_device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

}

function insertCustomShaders(code, cmethod, cscheme, fractal, postf) {
    code = code.replace("///POST_FUNC", postf);
    code = code.replace("///ITER_FUNC", fractal);
    code = code.replace("///COLORSCHEME", cscheme);
    code = code.replace("///COLORING_METHOD", cmethod);
    return code;
}

async function _compileShaders(cmethod, cscheme, fractal, postf) {

    if (DEBUG_MODE) {
        logStatus("starting to compile shaders", true);
    }

    if (USE_WEBGPU) {

        var code = await (await fetch("shaders/core/webgpu/main.wgsl")).text();

        code = insertCustomShaders(code, cmethod, cscheme, fractal, postf);
        
        const cshaderModule = wgpu_device.createShaderModule({ code: code });

        try {

            wgpu_device.pushErrorScope("validation");
            
            var cpipeline = await wgpu_device.createRenderPipelineAsync({
                layout: wgpu_device.createPipelineLayout({
                    bindGroupLayouts: [ 
                        wgpu_device.createBindGroupLayout({
                            entries: [
                                { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: {} }
                            ]
                        })
                    ]
                }),
                vertex: {
                    module: cshaderModule,
                    entryPoint: "vertex",
                },
                fragment: {
                    module: cshaderModule,
                    entryPoint: "fragment",
                    targets: [{ format: wgpu_format }],
                },
                primitive: {
                    topology: "triangle-strip",
                }
            });

            const cbindGroup = wgpu_device.createBindGroup({
                layout: cpipeline.getBindGroupLayout(0),
                entries: [
                    { binding: 0, resource: { buffer: wgpu_uniformBuffer }}
                ]
            });

            wgpu_pipeline = cpipeline;
            wgpu_bindGroup = cbindGroup; 

            var error = await wgpu_device.popErrorScope();

            if (error) {
                throw new Error(error.message);
            }

        } catch (e) {

            var messages = (await cshaderModule.getCompilationInfo()).messages;
            var errormsg = "";
            errormsg += "Error compiling shader: " + e;
            messages.forEach(m => {
                errormsg += "\n\n:" + m.lineNum + ":" + m.linePos + " error: " + m.message;
                errormsg += "\n...\n";
                errormsg += "line " + (m.lineNum - 1) + ": " + code.split("\n")[m.lineNum - 2] + "\n";
                errormsg += "line " + m.lineNum + ": " + code.split("\n")[m.lineNum - 1] + "\n";
                errormsg += "line " + (m.lineNum + 1) + ": " + code.split("\n")[m.lineNum] + "\n";
                errormsg += "\n...";
            });
            
            return errormsg;

        }

    } else if (USE_WEBGL) {

        var vertCode = await (await fetch("shaders/core/webgl/main.vert")).text();
        var fragCode = await (await fetch("shaders/core/webgl/main.frag")).text();
        
        fragCode = insertCustomShaders(fragCode, cmethod, cscheme, fractal, postf);

        var programs = [];

        var returnValue;

        [ contextMain, contextJul ].forEach(glCtx => {

            glCtx.viewport(0, 0, glCtx.drawingBufferWidth, glCtx.drawingBufferHeight);
            
            glCtx.clearColor(0., 0., 0., 1.);
            glCtx.clear(glCtx.COLOR_BUFFER_BIT);

            
            var vertexShader = glCtx.createShader(glCtx.VERTEX_SHADER);
            glCtx.shaderSource(vertexShader, vertCode);
            glCtx.compileShader(vertexShader);
            var vertShaderLog = glCtx.getShaderInfoLog(vertexShader);
            
            var fragmentShader = glCtx.createShader(glCtx.FRAGMENT_SHADER);
            glCtx.shaderSource(fragmentShader, fragCode);
            glCtx.compileShader(fragmentShader);
            var fragShaderLog = glCtx.getShaderInfoLog(fragmentShader);

            var program = glCtx.createProgram();
            glCtx.attachShader(program, vertexShader);
            glCtx.attachShader(program, fragmentShader);
            glCtx.linkProgram(program);

            glCtx.detachShader(program, vertexShader);
            glCtx.detachShader(program, fragmentShader);
            glCtx.deleteShader(vertexShader);
            glCtx.deleteShader(fragmentShader);

            if (!glCtx.getProgramParameter(program, glCtx.LINK_STATUS)) {
                var log = glCtx.getProgramInfoLog(program);
                console.error(log);
                console.error(vertShaderLog);
                console.error(fragShaderLog);
                returnValue = log;
            }

            var vertexArray = new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]);
            var vertexBuffer = glCtx.createBuffer();
            glCtx.bindBuffer(glCtx.ARRAY_BUFFER, vertexBuffer);
            glCtx.bufferData(glCtx.ARRAY_BUFFER, vertexArray, glCtx.STATIC_DRAW);
            glCtx.bindBuffer(glCtx.ARRAY_BUFFER, vertexBuffer);
            var aVertexPosition = glCtx.getAttribLocation(program, "position");
            glCtx.enableVertexAttribArray(aVertexPosition);
            glCtx.vertexAttribPointer(aVertexPosition, 2, glCtx.FLOAT, false, 0, 0);

            glCtx.useProgram(program);

            programs.push(program);

        });

        [wgl_programMain, wgl_programJul] = programs;

        if (returnValue) {
            return returnValue;
        }

    }

    return "success";

}

async function fetchSubCode(object, type, customCode) {
    if (DEBUG_MODE) {
        logStatus("fetching " + type + " shader code", true);
    }
    if (customCode) {
        if (DEBUG_MODE) {
            logStatus("custom shader code for " + type + " specified, not fetching", true);
        }
        return customCode;
    }
    try {
        var path = object.shader_folder ? object.shader_folder + object.shader + ".frxs" : "/shaders/" + type + "/" + object.shader + ".frxs";
        return parseFRXSFile(await (await fetch(path)).text());
    } catch (e) {
        logStatus("Failed to fetch shader. ");
        throw e;
    }
}

async function compileShaders(cmethod, cscheme, fractal, postf) {

    if (skipNextCompilation) {
        skipNextCompilation = false;
        return;
    }

    showLoadingWave();
    logStatus("compiling shader");

    var result = await _compileShaders(
        await fetchSubCode(cmethod, "colormethods"),
        customCs ? el("cscodei").value : await fetchSubCode(cscheme, "colorschemes"),
        customFractal ? el("fcodei").value : await fetchSubCode(fractal, "fractals"),
        await fetchSubCode(postf, "modifiers")
    );

    logStatus("finished compiling shader");
    hideLoadingWave();

    updateUi();

    return result;
}

async function importToCustomCode(type) {
    switch (type) {
        case "fractal": 
            var code = await fetchSubCode(fractalType, "fractals"); 
            el("fcodei").innerHTML = code;
            el("fcodei").oninput();
            break;
        case "colorscheme": 
            var code = await fetchSubCode(colorscheme, "colorschemes"); 
            el("cscodei").innerHTML = code;
            el("cscodei").oninput();
            break;
    }
} 

function setUniforms(context, wgl_program, juliaset, chunked, chunkerPos, overrideSampleCount) {

    if (DEBUG_MODE) {
        logStatus("setting uniforms (juliaset canvas: " + juliaset + ", for chunked rendering: " + (chunked ?? false) + (chunked ? (", chunk position: " + chunkerPos) : "") + ")" , true);
    }
    
    if (USE_WEBGL) {

        context.uniform2fv(context.getUniformLocation(wgl_program, "center"), !juliaset ? centerMain : centerJul);
        context.uniform2fv(context.getUniformLocation(wgl_program, "juliasetConstant"), juliasetConstant);
        context.uniform2fv(context.getUniformLocation(wgl_program, "canvasDimensions"), [ canvasMain.width, canvasMain.height ]);
        context.uniform1f(context.getUniformLocation(wgl_program, "zoom"), !juliaset ? zoomMain : zoomJul);
        context.uniform1f(context.getUniformLocation(wgl_program, "radius"), radius);
        context.uniform1f(context.getUniformLocation(wgl_program, "power"), power);
        context.uniform1f(context.getUniformLocation(wgl_program, "colorOffset"), colorOffset);
        context.uniform1f(context.getUniformLocation(wgl_program, "juliasetInterpolation"), juliasetInterpolation);
        context.uniform1f(context.getUniformLocation(wgl_program, "colorfulness"), colorfulness);
        context.uniform1f(context.getUniformLocation(wgl_program, "noiseSeed"), noiseSeed);
        context.uniform1f(context.getUniformLocation(wgl_program, "noiseAmplitude"), noiseAmplitude);
        context.uniform1f(context.getUniformLocation(wgl_program, "noiseMultiplier"), noiseMultiplier);
        context.uniform1ui(context.getUniformLocation(wgl_program, "maxIterations"), maxIterations);
        context.uniform1ui(context.getUniformLocation(wgl_program, "sampleCount"), overrideSampleCount ?? sampleCount);
        context.uniform1ui(context.getUniformLocation(wgl_program, "chunkerFinalSize"), chunked ? chunkerFinalSize : 0);
        context.uniform1ui(context.getUniformLocation(wgl_program, "chunkerChunkSize"), chunked ? chunkerChunkSize : 0);
        context.uniform1ui(context.getUniformLocation(wgl_program, "chunkerX"), chunked ? chunkerPos[0] : 0);
        context.uniform1ui(context.getUniformLocation(wgl_program, "chunkerY"), chunked ? chunkerPos[1] : 0);
        context.uniform1ui(context.getUniformLocation(wgl_program, "flags"), juliaset | ((chunked ?? 0) << 1));

    } else if (USE_WEBGPU) {

        const arrayBuffer = new ArrayBuffer(uniformBufferSize);
        new Float32Array(arrayBuffer, 0).set([
            !juliaset ? centerMain[0] : centerJul[0],
            !juliaset ? centerMain[1] : centerJul[1],
            juliasetConstant[0],
            juliasetConstant[1],
            canvasMain.width, 
            canvasMain.height,
            !juliaset ? zoomMain : zoomJul,
            radius,
            power, 
            colorOffset,
            juliasetInterpolation,
            colorfulness,
            noiseSeed,
            noiseAmplitude,
            noiseMultiplier
        ]);

        new Uint32Array(arrayBuffer, 15 * Float32Array.BYTES_PER_ELEMENT).set([
            maxIterations,
            overrideSampleCount ?? sampleCount,
            chunked ? chunkerFinalSize : 0, 
            chunked ? chunkerChunkSize : 0, 
            chunked ? chunkerPos[0] : 0,
            chunked ? chunkerPos[1] : 0,
            juliaset | ((chunked ?? 0) << 1)
        ]);

        wgpu_device.queue.writeBuffer(wgpu_uniformBuffer, 0, arrayBuffer);

    }

}

function draw(context, juliaset, overrideSampleCount) {

    if (DEBUG_MODE) {
        console.log(`draw call made from \n${new Error().stack}`);
    }

    if (USE_WEBGPU) {

        setUniforms(null, null, juliaset, null, null, overrideSampleCount);

        const encoder = wgpu_device.createCommandEncoder();
        const renderPass = encoder.beginRenderPass({
            colorAttachments: [{
                view: context.getCurrentTexture().createView(),
                loadOp: "clear",
                clearValue: [0, 0, 0, 1],
                storeOp: "store"
            }]
        });

        renderPass.setPipeline(wgpu_pipeline);
        renderPass.setBindGroup(0, wgpu_bindGroup);
        renderPass.draw(4);
        renderPass.end();

        wgpu_device.queue.submit([ encoder.finish() ]);

    } else if (USE_WEBGL) {
        
        const gl = context;

        setUniforms(gl, !juliaset ? wgl_programMain : wgl_programJul, juliaset, null, null, overrideSampleCount);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    }

}

async function drawReturnImageData(context, juliaset, chunked, chunkerPos) {

    var width = !juliaset ? canvasMain.width : canvasJul.width;
    var height = !juliaset ? canvasMain.height : canvasJul.height;
    
    if (USE_WEBGPU) {

        setUniforms(null, null, juliaset, chunked, chunked ? chunkerPos : null);

        const texture = wgpu_device.createTexture({
            size: [width, height, 1],
            format: wgpu_format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
        });

        const encoder = wgpu_device.createCommandEncoder();
        const renderPass = encoder.beginRenderPass({
            colorAttachments: [{
                view: texture.createView(),
                loadOp: "clear",
                clearValue: [0, 0, 0, 1],
                storeOp: "store"
            }]
        });

        renderPass.setPipeline(wgpu_pipeline);
        renderPass.setBindGroup(0, wgpu_bindGroup);
        renderPass.draw(4);
        renderPass.end();

        const bytesPerRowUnaligned = width * 4;
        const bytesPerRow = Math.ceil(bytesPerRowUnaligned / 256) * 256;

        const bufferSize = bytesPerRow * height * 4; 
        const outputBuffer = wgpu_device.createBuffer({
            size: bufferSize,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });

        encoder.copyTextureToBuffer(
            { texture: texture },
            { buffer: outputBuffer, bytesPerRow: bytesPerRow },
            [ width, height, 1 ]
        );

        wgpu_device.queue.submit([ encoder.finish() ]);

        await outputBuffer.mapAsync(GPUMapMode.READ);
        const arrayBuffer = outputBuffer.getMappedRange();
        const rawPixels = new Uint8Array(arrayBuffer);

        const pixels = new Uint8Array(width * height * 4);

        for (var row = 0; row < height; row++) {
            const srcOffset = row * bytesPerRow;
            const dstOffset = row * width * 4;
            pixels.set(rawPixels.slice(srcOffset, srcOffset + width * 4), dstOffset);
        }

        return pixels;

    } else if (USE_WEBGL) {
        
        var gl = context;

        setUniforms(gl, !juliaset ? wgl_programMain : wgl_programJul, juliaset, chunked, chunked ? chunkerPos : null);

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        gl.viewport(0, 0, width, height);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

        const pixels = new Uint8Array(width * height * 4);

        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return pixels;

    }

}

function renderMain(overrideSampleCount) {
    return draw(contextMain, 0, overrideSampleCount);
}

function renderJul(overrideSampleCount) {
    return draw(contextJul, 1, overrideSampleCount);
}

function renderBoth(overrideSampleCount) {
    renderMain(overrideSampleCount);
    renderJul(overrideSampleCount);
}

async function compileAndRender() {
    if (skipNextCompilation) {
        skipNextCompilation = false;
        return;
    }
    await compileShaders(colorMethod, colorscheme, fractalType, modifier);
    renderBoth();
}


var chunkerFinalSize = 2000;
var chunkerChunkSize = 400;

async function _renderAndExportChunked(isMain) {

    if (chunkerFinalSize % chunkerChunkSize != 0) {
        alert(translate("chunker_size_indivisible"));
        return;
    }

    logStatus("rendering chunked image");
    showLoadingWave();
    
    var originalCanvasSize = canvasMain.width;
    setCanvasSize(chunkerChunkSize);

    var bigCanvas = document.createElement("canvas");
    bigCanvas.width = bigCanvas.height = chunkerFinalSize;

    var bigContext = bigCanvas.getContext("2d");
    
    logStatus("rendering chunked image 0%");

    try {
        for (var y = 0; y < chunkerFinalSize; y += chunkerChunkSize) {
            for (var x = 0; x < chunkerFinalSize; x += chunkerChunkSize) {
                bigContext.putImageData(new ImageData(new Uint8ClampedArray(await drawReturnImageData(isMain ? contextMain : contextJul, !isMain, true, [x, y])), chunkerChunkSize, chunkerChunkSize), x, USE_WEBGL ? (chunkerFinalSize - y - chunkerChunkSize) : y);
                logStatus("rendering chunked image " + Math.floor(((y / chunkerFinalSize) + (x / chunkerFinalSize) / (chunkerFinalSize / chunkerChunkSize)) * 100) + "%");
            }
        }
    } catch {
        alert(translate("chunking_failed"));
        return;
    }
    
    logStatus("rendering chunked image 100%");

    setCanvasSize(originalCanvasSize);
    renderBoth();

    _export(bigCanvas);

    bigCanvas.remove(); 
    hideLoadingWave();

}

function renderAndExportChunkedMain() { _renderAndExportChunked(true); }
function renderAndExportChunkedJuliaset() { _renderAndExportChunked(false); }

var targetXMain = 0;
var targetYMain = 0;
var targetZMain = 0.4;
var smoothingMainRunning = false;

var targetXJul = 0;
var targetYJul = 0;
var targetZJul = 0.4;
var smoothingJulRunning = false;

var smoothing = 0.7;
var smoothingEnabled = true;

var zoomSpeed = 2;

var smoothingFps = 60;
var smoothFpsInterval = 1000 / smoothingFps;

var smoothThenMain = new Date();
var smoothThenJul = new Date();

var dynamicSampleCount = true;
var dynamicSampleCountLow = 4;

function setSmoothingFPS(fps) {
    smoothingFps = parseFloat(fps);
    smoothFpsInterval = 1000 / smoothingFps;
}

function prepareSmoothingAnimation(main) {
    if (main && !smoothingMainRunning) {
        targetXMain = centerMain[0];
        targetYMain = centerMain[1];
        targetZMain = zoomMain;
    }
    if (!main && !smoothingJulRunning) {
        targetXJul = centerJul[0];
        targetYJul = centerJul[1];
        targetZJul = zoomJul;
    }
} 

function startSmoothingAnimation(main) {
    
    if (main && !smoothingMainRunning) {
        if (smoothingEnabled && !(
            Math.abs(targetXMain - centerMain[0]) > 0.0001 / zoomMain ||
            Math.abs(targetYMain - centerMain[1]) > 0.0001 / zoomMain ||
            Math.abs(targetZMain - zoomMain) > 0.0001
        )) {
            return;
        }
        smoothThenMain = Date.now();
        requestAnimationFrame(animateSmoothingMain);
    }

    if (!main && !smoothingJulRunning) {
        if (smoothingEnabled && !(
            Math.abs(targetXJul - centerJul[0]) > 0.0001 / zoomJul ||
            Math.abs(targetYJul - centerJul[1]) > 0.0001 / zoomJul ||
            Math.abs(targetZJul - zoomJul) > 0.0001
        )) {
            return;
        }
        smoothThenJul = Date.now();
        requestAnimationFrame(animateSmoothingJul);
    }

}

function endSmoothingAnimation() {
    if (smoothingEnabled && dynamicSampleCount) {
        renderBoth();
    }
}

function useDynamicSampleCount(value) {
    dynamicSampleCount = value;
}

function setDynamicSampleCountLow(value) {
    dynamicSampleCountLow = value;
}

canvasMain.onmousedown = evt => {
    if (evt.button == 0) { 
        juliasetConstant = [
            (2 * (evt.offsetX / canvasMain.width) - 1) / zoomMain + centerMain[0], 
            (2 * (evt.offsetY / canvasMain.height) - 1) / zoomMain - centerMain[1]
        ]; 
        renderJul(); 
        updateJsetConstants(); 
    }
};

canvasMain.onmousemove = evt => {
    if (evt.buttons & 2) {
        prepareSmoothingAnimation(true);
        targetXMain += -2 * evt.movementX / canvasMain.width / zoomMain;
        targetYMain += 2 * evt.movementY / canvasMain.height / zoomMain;
        startSmoothingAnimation(true);
    }
    if (evt.buttons & 1) {
        juliasetConstant = [
            (2 * (evt.offsetX / canvasMain.width) - 1) / zoomMain + centerMain[0], 
            (2 * (evt.offsetY / canvasMain.height) - 1) / zoomMain - centerMain[1]
        ]; 
        renderJul(dynamicSampleCount ? dynamicSampleCountLow : null); 
        updateJsetConstants(); 
    }
};

canvasMain.onwheel = evt => {
    evt.preventDefault();
    var z = Math.pow(zoomSpeed, -evt.deltaY / 200);
    prepareSmoothingAnimation(true);
    targetXMain = (2 * (evt.offsetX / canvasMain.width) - 1) / targetZMain + targetXMain - (2 * (evt.offsetX / canvasMain.width) - 1) / (zoomMain * z);
    targetYMain = -(2 * (evt.offsetY / canvasMain.height) - 1) / targetZMain + targetYMain + (2 * (evt.offsetY / canvasMain.height) - 1) / (zoomMain * z);
    targetZMain = zoomMain * z;
    startSmoothingAnimation(true);
};

canvasMain.onmouseup = evt => {
    if (dynamicSampleCount) {
        renderBoth();
    }
};

function animateSmoothingMain() {

    if (!smoothingEnabled) {
        smoothingMainRunning = false;
        endSmoothingAnimation();
        var dynSampleCountDisabled = zoomMain != targetZMain;
        centerMain[0] = targetXMain;
        centerMain[1] = targetYMain;
        zoomMain = targetZMain;
        renderMain(dynSampleCountDisabled ? null : (dynamicSampleCount ? dynamicSampleCountLow : null));
        return;
    }
    if (smoothingMainRunning && !(
        Math.abs(targetXMain - centerMain[0]) > 0.001 / zoomMain ||
        Math.abs(targetYMain - centerMain[1]) > 0.001 / zoomMain ||
        Math.abs(targetZMain - zoomMain) > 0.001
    )) {
        smoothingMainRunning = false;
        endSmoothingAnimation();
        return;
    }

    smoothingMainRunning = true;

    requestAnimationFrame(animateSmoothingMain);

    var now = Date.now();
    var elapsed = now - smoothThenMain;

    if (elapsed < smoothFpsInterval) {
        return;
    }

    smoothThenMain = now - (elapsed % smoothFpsInterval);
    centerMain[0] = (1 - smoothing) * targetXMain + smoothing * centerMain[0];
    centerMain[1] = (1 - smoothing) * targetYMain + smoothing * centerMain[1];
    zoomMain = (1 - smoothing) * targetZMain + smoothing * zoomMain;

    if (dynamicSampleCount) {
        renderMain(dynamicSampleCountLow);
    }
    
}

canvasJul.onmousemove = evt => {
    if (evt.buttons & 2) {
        prepareSmoothingAnimation(false);
        targetXJul += -2 * evt.movementX / canvasJul.width / zoomJul;
        targetYJul += 2 * evt.movementY / canvasJul.height / zoomJul;
        startSmoothingAnimation(false);
    }
};

canvasJul.onwheel = evt => {
    evt.preventDefault();
    var z = Math.pow(zoomSpeed, -evt.deltaY / 200);
    prepareSmoothingAnimation(false);
    targetXJul = (2 * (evt.offsetX / canvasJul.width) - 1) / targetZJul + targetXJul - (2 * (evt.offsetX / canvasJul.width) - 1) / (zoomJul * z);
    targetYJul = -(2 * (evt.offsetY / canvasJul.height) - 1) / targetZJul + targetYJul + (2 * (evt.offsetY / canvasJul.height) - 1) / (zoomJul * z);
    targetZJul = zoomJul * z;
    startSmoothingAnimation(false);
};

canvasJul.onmouseup = evt => {
    if (dynamicSampleCount) {
        renderBoth();
    }
};

function animateSmoothingJul() {

    if (!smoothingEnabled) {
        smoothingJulRunning = false;
        endSmoothingAnimation();
        var dynSampleCountDisabled = zoomMain != targetZMain;
        centerJul[0] = targetXJul;
        centerJul[1] = targetYJul;
        zoomJul = targetZJul;
        renderJul(dynSampleCountDisabled ? null : (dynamicSampleCount ? dynamicSampleCountLow : null));
        return;
    }
    if (smoothingJulRunning && !(
        Math.abs(targetXJul - centerJul[0]) > 0.001 / zoomJul ||
        Math.abs(targetYJul - centerJul[1]) > 0.001 / zoomJul ||
        Math.abs(targetZJul - zoomJul) > 0.001
    )) {
        smoothingJulRunning = false;
        endSmoothingAnimation();
        return;
    }

    smoothingJulRunning = true;

    requestAnimationFrame(animateSmoothingJul);

    var now = Date.now();
    var elapsed = now - smoothThenJul;

    if (elapsed < smoothFpsInterval) {
        return;
    }

    smoothThenJul = now - (elapsed % smoothFpsInterval);
    centerJul[0] = (1 - smoothing) * targetXJul + smoothing * centerJul[0];
    centerJul[1] = (1 - smoothing) * targetYJul + smoothing * centerJul[1];
    zoomJul = (1 - smoothing) * targetZJul + smoothing * zoomJul;

    if (dynamicSampleCount) {
        renderJul(dynamicSampleCountLow);
    }
    
}

canvasMain.oncontextmenu = evt => evt.preventDefault();
canvasJul.oncontextmenu = evt => evt.preventDefault();


function buttonPressed(otherButtons, definitions, type) {
    
    Object.keys(otherButtons).forEach(button => otherButtons[button].classList.remove("button-highlight"));
    otherButtons[Object.keys(definitions).find(name => definitions[name] == type)].classList.add("button-highlight");

}

function updateJsetConstants() {
    el("constantRe").value = juliasetConstant[0];
    el("constantIm").value = juliasetConstant[1];
}

function updateUi() {
    
    el("fractalName").innerHTML = translatable("desc_title_fractal", translatable(fractalType.name)).outerHTML;
    el("colorschemeName").innerHTML = translatable("desc_title_colorscheme", translatable(colorscheme.name)).outerHTML;
    el("colorMethodName").innerHTML = translatable("desc_title_colormethod", translatable(colorMethod.name)).outerHTML;
    el("modifierName").innerHTML = translatable("desc_title_modifier", translatable(modifier.name)).outerHTML;

    el("frdesc").innerHTML = translatable(fractalType.description).outerHTML;
    el("csdesc").innerHTML = translatable(colorscheme.description).outerHTML;
    el("cmdesc").innerHTML = translatable(colorMethod.description).outerHTML;
    el("fmdesc").innerHTML = translatable(modifier.description).outerHTML;

    el("radius").value = radius;
    el("iterations").value = maxIterations;
    el("power").value = power;
    el("nji").value = juliasetInterpolation;
    el("canvasSize").value = canvasMain.width;
    el("coloroffset").value = colorOffset;
    el("colorfulness").value = colorfulness;
    el("sampleCount").value = sampleCount;

    updateJsetConstants();

    el("noiseSeed").value = noiseSeed;
    el("noiseAmplitude").value = noiseAmplitude;
    el("noiseMultiplier").value = noiseMultiplier;

    el("frfm").innerHTML = fractalType.formula.replaceAll("POWER", power);
    
    buttonPressed(fractalButtons, FRACTALS, fractalType);
    buttonPressed(colorschemeButtons, COLORSCHEMES, colorscheme);
    buttonPressed(colormethodButtons, COLOR_METHODS, colorMethod);
    buttonPressed(modifierButtons, MODIFIERS, modifier);

    if (window["getAnimationLength"]) {
        el("animation-length").value = getAnimationLength();
    }

}

function setCenter(center, isJuliaset, dontRerender) {
    if (isJuliaset) {
        centerJul = center;
    } else {
        centerMain = center;
    }
    if (!dontRerender) { (isJuliaset ? renderJul : renderMain )(); }
}

function setCenterX(x, isJuliaset, dontRerender) {
    if (isJuliaset) {
        centerJul[0] = parseFloat(x);
    } else {
        centerMain[0] = parseFloat(x);
    }
    if (!dontRerender) { (isJuliaset ? renderJul : renderMain )(); }
}

function setCenterY(y, isJuliaset, dontRerender) {
    if (isJuliaset) {
        centerJul[1] = parseFloat(y);
    } else {
        centerMain[1] = parseFloat(y);
    }
    if (!dontRerender) { (isJuliaset ? renderJul : renderMain )(); }
}

function getCenter(juliaset) { return juliaset ? centerJul : centerMain; }

function setZoom(zoom, isJuliaset, dontRerender) {
    if (isJuliaset) {
        zoomJul = parseFloat(zoom);
    } else {
        zoomMain = parseFloat(zoom);
    }
    if (!dontRerender) { (isJuliaset ? renderJul : renderMain )(); }
}

function getZoom(juliaset) { return juliaset ? zoomJul : zoomMain; }

async function setFractal(fractal, dontRecompile) {

    fractalType = fractal;

    if (modifier == MODIFIERS.NONE) {
        radius = fractalType.radius;
    } else if (modifier.radius != null) {
        radius = modifier.radius;
    }

    if (!dontRecompile) { await compileAndRender(); }

}

async function setColorscheme(scheme, dontRecompile) {
    colorscheme = scheme;
    if (!dontRecompile) { await compileAndRender(); }
}

async function setColormethod(method, dontRecompile) {
    colorMethod = method;
    if (!dontRecompile) { await compileAndRender(); }
}

async function setModifier(func, dontRecompile) {

    modifier = func;

    if (func.radius != null) {
        radius = func.radius;
    } else {
        radius = fractalType.radius;
    }

    if (!dontRecompile) { await compileAndRender(); }

}


function setCanvasSize(size, doNotRender) {

    if (DEBUG_MODE) {
        logStatus("set canvas size to " + size, true);
    }

    canvasMain.width = canvasMain.height = size;
    canvasJul.width = canvasJul.height = size;

    if (USE_WEBGL) {   
        [ contextMain, contextJul ].forEach(gl => gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight));
    }

    setCanvasesSticky(!_canvasTooBig(size))
    
    if (!doNotRender) { renderBoth(); }

}

function setRadius(value, dontRerender) { radius = parseInt(value); if (!dontRerender) { renderBoth(); } }
function setIterations(value, dontRerender) { maxIterations = parseInt(value); if (!dontRerender) { renderBoth(); } }
function setPower(value, dontRerender) { power = parseFloat(value); if (!dontRerender) { renderBoth(); } updateUi(); }
function setConstantX(value, dontRerender) { juliasetConstant[0] = parseFloat(value); if (!dontRerender) { renderBoth(); } } 
function setConstantY(value, dontRerender) { juliasetConstant[1] = parseFloat(value); if (!dontRerender) { renderBoth(); } }
function setInterpolation(value, dontRerender) { juliasetInterpolation = parseFloat(value); if (!dontRerender) { renderBoth(); } }
function setColoroffset(value, dontRerender) { colorOffset = parseFloat(value); if (!dontRerender) { renderBoth(); } }
function setColorfulness(value, dontRerender) { colorfulness = parseFloat(value); if (!dontRerender) { renderBoth(); } }
function setSampleCount(value, dontRerender) { sampleCount = parseInt(value); if (!dontRerender) { renderBoth(); } }
function setNoiseSeed(value, dontRerender) { noiseSeed = parseInt(value); if (!dontRerender) { renderBoth(); } }
function setNoiseAmplitude(value, dontRerender) { noiseAmplitude = parseFloat(value); if (!dontRerender) { renderBoth(); } }
function setNoiseMultiplier(value, dontRerender) { noiseMultiplier = parseFloat(value); if (!dontRerender) { renderBoth(); } }
function setChunkerFinalSize(value) { chunkerFinalSize = parseInt(value); }
function setChunkerChunkSize(value) { chunkerChunkSize = parseInt(value); }
function setSmoothing(value) { smoothingEnabled = value; }
function setSmoothingValue(value) { smoothing = parseFloat(value); }
function setZoomSpeed(value) { zoomSpeed = Math.max(parseFloat(value), 0) + 1; }

function getRadius() { return radius; }
function getIterations() { return maxIterations; }
function getPower() { return power; }
function getConstant() { return juliasetConstant; }
function getInterpolation() { return juliasetInterpolation; }
function getColorOffset() { return colorOffset; }
function getColorfulness() { return colorfulness; }
function getSampleCount() { return sampleCount; }
function getNoiseSeed() { return noiseSeed; }
function getNoiseAmplitude() { return noiseAmplitude; }
function getNoiseMultiplier() { return noiseMultiplier; }

function getMainCanvas() { return canvasMain };
function getJuliasetCanvas() { return canvasJul };

var presetIncludesAnimation = true;
var presetIncludesPlugins = true;
var presetIncludesCanvasSize = false;
var presetIncludesSmoothing = false;

function includeAnimationInPreset(value) {
    presetIncludesAnimation = value;
}

function includePluginsInPreset(value) {
    presetIncludesPlugins = value;
}

function includeCanvasSizeInPreset(value) {
    presetIncludesCanvasSize = value;
}

function includeSmoothingInPreset(value) {
    presetIncludesSmoothing = value;
}

function createUrlWithParameters() {

    var url = new URL(window.location.origin + window.location.pathname); 
    var params = url.searchParams;
    
    params.delete("forceWebGPU");
    params.delete("forceWebGL");

    params.append("cxm", centerMain[0]);
    params.append("cym", centerMain[1]);
    params.append("cxj", centerJul[0]);
    params.append("cyj", centerJul[1]);
    params.append("cx", juliasetConstant[0]);
    params.append("cy", juliasetConstant[1]);
    params.append("zm", zoomMain);
    params.append("zj", zoomJul);
    params.append("r", radius);
    params.append("i", maxIterations);
    params.append("co", colorOffset);
    params.append("cf", colorfulness);
    params.append("sc", sampleCount);
    params.append("nji", juliasetInterpolation);
    params.append("p", power);
    params.append("csd", noiseSeed);
    params.append("cam", noiseAmplitude);
    params.append("cml", noiseMultiplier); 
    
    params.append("f", Object.keys(FRACTALS).find(key => FRACTALS[key] === fractalType));
    params.append("cm", Object.keys(COLOR_METHODS).find(key => COLOR_METHODS[key] === colorMethod));
    params.append("cs", Object.keys(COLORSCHEMES).find(key => COLORSCHEMES[key] === colorscheme));
    params.append("pf", Object.keys(MODIFIERS).find(key => MODIFIERS[key] === modifier));

    params.append("ccs", customCs);
    params.append("cfr", customFractal);
    params.append("ccsc", customCs ? el("cscodei").value : "");
    params.append("cfrc", customFractal ? el("fcodei").value : "");

    params.append("scb", usingBackend);

    if (presetIncludesPlugins) { params.append("pgns", JSON.stringify(getLoadedPluginsURLs())); }
    if (presetIncludesAnimation) { params.append("an", JSON.stringify(getAnimationData())); }
    if (presetIncludesCanvasSize) { params.append("csz", canvasMain.width); }
    if (presetIncludesSmoothing) { 
        params.append("se", smoothingEnabled); 
        params.append("si", smoothing); 
        params.append("sf", smoothingFps); 
    }

    if (DEBUG_MODE) {
        logStatus("creating parameter URL, encoded parameters: " + params.toString(), true);
    }

    return window.location.origin + window.location.pathname + "?fxp=" + btoa(params.toString());

}

var _pluginsToLoad = [];
var _actualShadersToBeLoaded = {};
var _animationToBeLoaded = {};

function _applyUrlWithParameters(url) {

    if (DEBUG_MODE) {
        logStatus("loading parameter URL " + url);
    }

    if (new URL(url).searchParams.size == 0) {
        if (DEBUG_MODE) {
            logStatus("no parameters found in url");
        }
        return;
    }

    var params = new URL(window.location.origin + window.location.pathname + "?" + atob(new URL(url).searchParams.get("fxp") ?? "")).searchParams;

    if (params.size == 0) {
        params = new URL(url).searchParams;
        if (params.size - (params.get("forceWebGL") == "1" || params.get("forceWebGPU") == "1") ? 1 : 0 >= 1) { // v4 url
            if (DEBUG_MODE) {
                logStatus("detected v4-2 url"); 
            }
            params.set("f", params.get("f").toUpperCase());
            params.set("cm", params.get("cm").toUpperCase());
            params.set("cs", params.get("cs").toUpperCase());
            params.set("pf", params.get("pf").toUpperCase());
        } else {
            return;
        }
    }

    centerMain[0] = parseFloat(params.get("cxm") ?? centerMain[0]);
    centerMain[1] = parseFloat(params.get("cym") ?? centerMain[1]);
    centerJul[0] = parseFloat(params.get("cxj") ?? centerJul[0]);
    centerJul[1] = parseFloat(params.get("cyj") ?? centerJul[1]);
    juliasetConstant[0] = parseFloat(params.get("cx") ?? juliasetConstant[0]);
    juliasetConstant[1] = parseFloat(params.get("cy") ?? juliasetConstant[1]);
    zoomMain = parseFloat(params.get("zm") ?? zoomMain);
    zoomJul = parseFloat(params.get("zj") ?? zoomJul);
    radius = parseFloat(params.get("r") ?? radius);
    maxIterations = parseFloat(params.get("i") ?? maxIterations);
    colorOffset = parseFloat(params.get("co") ?? colorOffset);
    colorfulness = parseFloat(params.get("cf") ?? colorfulness);
    sampleCount = parseInt(params.get("sc") ?? sampleCount);
    juliasetInterpolation = parseFloat(params.get("nji") ?? juliasetInterpolation);
    power = parseFloat(params.get("p") ?? power);
    noiseSeed = parseFloat(params.get("csd") ?? noiseSeed);
    noiseAmplitude = parseFloat(params.get("cam") ?? noiseAmplitude);
    noiseMultiplier = parseFloat(params.get("cml") ?? noiseMultiplier);
    
    fractalType = params.get("f") ? (FRACTALS[params.get("f")] ?? fractalType) : fractalType;
    colorscheme = params.get("cs") ? (COLORSCHEMES[params.get("cs")] ?? colorscheme) : colorscheme;
    colorMethod = params.get("cm") ? (COLOR_METHODS[params.get("cm")] ?? colorMethod) : colorMethod;
    modifier = params.get("pf") ? (MODIFIERS[params.get("pf")] ?? modifier) : modifier;

    _actualShadersToBeLoaded = {};

    if (!FRACTALS[params.get("f")]) { _actualShadersToBeLoaded.fractal = params.get("f"); skipNextCompilation = true; }
    if (!COLORSCHEMES[params.get("cs")]) { _actualShadersToBeLoaded.colorscheme = params.get("cs"); skipNextCompilation = true; }
    if (!COLOR_METHODS[params.get("cm")]) { _actualShadersToBeLoaded.colorMethod = params.get("cm"); skipNextCompilation = true; }
    if (!MODIFIERS[params.get("pf")]) { _actualShadersToBeLoaded.modifier = params.get("pf"); skipNextCompilation = true; }

    if (params.get("scb") && params.get("scb") != usingBackend && (params.get("ccs") == "true" || params.get("cfr") == "true")) {
        [ console.error, alert ].forEach(f => f(translate("preset_shader_not_loaded", usingBackend, params.get("scb"))));
    } else {
        if (params.get("ccs") == "true") { toggleCustomShader(el("tgshdcs"), "cs"); } 
        if (params.get("cfr") == "true") { toggleCustomShader(el("tgshdf"), "f"); } 
        customFractal = params.get("cfr") == "true"; 
        var cscc = params.get("ccsc"); if (cscc) { var cscodei = el("cscodei"); cscodei.value = cscc; cscodei.style.height = cscc.split("\n").length * 16 + "px"; }
        var cfrc = params.get("cfrc"); if (cfrc) { var fcodei = el("fcodei"); fcodei.value = cfrc; fcodei.style.height = cfrc.split("\n").length * 16 + "px"; }
    }
    
    if (params.get("pgns")) {
        _pluginsToLoad = JSON.parse(params.get("pgns"));
    }

    _animationToBeLoaded = JSON.parse(params.get("an")) ?? {};

    setCanvasSize(params.get("csz") ?? canvasMain.width, true);
    setSmoothing(params.get("se") ?? smoothingEnabled);
    setSmoothingValue(params.get("si") ?? smoothing);
    setSmoothingFPS(params.get("sf") ?? smoothingFps);

}

async function onPluginsInitialized() {
    
    if (DEBUG_MODE) {
        logStatus("initializing any plugins contained in preset url");
    }

    await Promise.all(_pluginsToLoad.map(url => { return loadPluginUrl(url); }));

    if (Object.keys(_actualShadersToBeLoaded).length == 0) {
        return;
    }

    if (_actualShadersToBeLoaded.fractal) { fractalType = FRACTALS[_actualShadersToBeLoaded.fractal]; }
    if (_actualShadersToBeLoaded.colorscheme) { colorscheme = COLORSCHEMES[_actualShadersToBeLoaded.colorscheme]; }
    if (_actualShadersToBeLoaded.colorMethod) { colorMethod = COLOR_METHODS[_actualShadersToBeLoaded.colorMethod]; }
    if (_actualShadersToBeLoaded.modifier) { modifier = MODIFIERS[_actualShadersToBeLoaded.modifier]; }

    if (DEBUG_MODE) {
        logStatus("done initializing preset plugins");
    }

    await compileAndRender();

}

async function onAnimationsInitialized() {

    if (DEBUG_MODE) {
        logStatus("loading animation data contained in preset url");
    }
    
    if (Object.keys(_animationToBeLoaded).length != 0) {
        applyAnimationData(_animationToBeLoaded);
    }

    el("animation-length").value = getAnimationLength();

}

function applyUrlWithParameters() {
    return _applyUrlWithParameters(window.location.href);
}

function createAndOpenUrl() {
    window.open(createUrlWithParameters());
}

function createAndCopyUrl() {
    navigator.clipboard.writeText(createUrlWithParameters());
}

async function _export(canvas) {

    if (DEBUG_MODE) {
        logStatus("exporting canvas " + canvas + " to png");
    }

    var paramUrl = createUrlWithParameters();

    var encoder = new TextEncoder();
    var urlBlob = new Blob([encoder.encode("FXURL::" + paramUrl)], { type: "text/plain" });

    var canvasBlob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));

    var finalBlob = new Blob([canvasBlob, urlBlob], { type: "image/png" });

    var a = document.createElement("a");  
    var url = URL.createObjectURL(finalBlob);

    a.href = url;
    a.download = "fractal.png";
    a.click();

    URL.revokeObjectURL(url); 
    a.remove();

}

function exportMain() {
    renderMain();
    _export(canvasMain);
}

function exportJul() {
    renderJul();
    _export(canvasJul);
}

function _loadParamsFromFileInput(input) {
    if (DEBUG_MODE) {
        logStatus("loading parameter url from input file");
    }
    var file = input.files[0]; 
    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = readerEvent => {
        var content = readerEvent.target.result;
        var split = content.split("FXURL::");
        if (split.length >= 2) {
            _applyUrlWithParameters(split[split.length - 1]);
            compileAndRender();
        } else {
            split = content.split("301210301210301210_FRACTALEXPLORERPARAMETERURL:"); // v4 code. not proud of it
            if (split.length >= 2) {
                if (DEBUG_MODE) {
                    logStatus("v4 url detected in input file");
                }
                _applyUrlWithParameters(split[split.length - 1]);
                compileAndRender();
            } else {
                alert(translate("no_url_found_image"));
            }
        }
    }
}

function loadParamsFromFile() {
    var input = document.createElement("input");
    input.type = "file";
    input.onchange = e => { 
        _loadParamsFromFileInput(e.target);
        input.remove();
    }
    input.click();
}

function objectDropped(evt) {
    
    evt.preventDefault();
    el("drop-screen").style.display = "none";

    var files = evt.dataTransfer.files;

    if (files.length) {

        var input = document.createElement("input");
        input.type = "file";
        input.files = files;
        _loadParamsFromFileInput(input);
        input.remove();

    } else {
        evt.dataTransfer.items[0].getAsString(async text => {
            if (text.startsWith("http")) {
                _applyUrlWithParameters(text);
                compileAndRender();
            }
        });
    }

}

window.ondragenter = event => {
    event.preventDefault();
    el("drop-screen").style.display = "flex";
};

window.ondragover = event => {
    event.preventDefault();
};

window.ondragleave = event => {
    if (event.target == document.body || event.clientY <= 0) {
        el("drop-screen").style.display = "none";
    }
};

window.ondrop = objectDropped;

async function toggleCustomShader(b, t) {
    if (t == "f") {
        customFractal = !customFractal;
        if (DEBUG_MODE) {
            logStatus("try toggling custom fractal shader " + customFractal ? "on" : "off");
        }
    }
    if (t == "cs") {
        customCs = !customCs;
        if (DEBUG_MODE) {
            logStatus("try toggling custom fractal shader " + customCs ? "on" : "off");
        }
    }
    var returnv = await compileShaders(colorMethod, colorscheme, fractalType, modifier);
    if (returnv == "success") {
        el(t + "compileout").innerHTML = "&#10003;";
        if (t == "f") {
            b.innerHTML = translatable((customFractal ? "disable" : "enable") + "_custom_fractal_shader").outerHTML;
        }
        if (t == "cs") {
            b.innerHTML = translatable((customCs ? "disable" : "enable") + "_custom_colorscheme_shader").outerHTML;
        }
        renderBoth();
        updateUi();
    } else {
        el(t + "compileout").innerHTML = returnv;
        if (t == "f") {
            customFractal = false;
        }
        if (t == "cs") {
            customCs = false;
        }
        compileAndRender();
    }
}

async function updateShader(t) {
    var cfo = customFractal;
    var ccso = customCs;
    customFractal = t == "f";
    customCs = t == "cs";
    var returnv = await compileShaders(colorMethod, colorscheme, fractalType, modifier);
    customFractal = cfo;
    customCs = ccso;
    if (returnv == "success") {
        el(t + "compileout").innerHTML = "&#10003;";
        renderBoth();
        customFractal = t == "f";
        customCs = t == "cs";
        if (t == "f") {
            el("tgshdf").innerHTML = translatable("disable_custom_fractal_shader").outerHTML;
        }
        if (t == "cs") {
            el("tgshdcs").innerHTML = translatable("disable_custom_colorscheme_shader").outerHTML;
        }
    } else {
        el(t + "compileout").innerHTML = returnv;
        if (t == "f") {
            el("tgshdf").innerHTML = translatable("enable_custom_fractal_shader").outerHTML;
            customFractal = false;
        }
        if (t == "cs") {
            el("tgshdcs").innerHTML = translatable("enable_custom_colorschemes_shader").outerHTML;
            customCs = false;
        }
        compileAndRender();
    }
}

async function init() {
    if (DEBUG_MODE) {
        logStatus("beginning final initialization");
    }
    window.addEventListener("resize", () => setCanvasesSticky(!canvasTooBig()));
    resetNoCompile();
    applyUrlWithParameters();
    stickyCanvasesIfFit();
    await compileAndRender();
    if (DEBUG_MODE) {
        logStatus("fully finished intializing main part of fractal explorer v" + METADATA.version);
    }
}

await init();

const exports = {
    renderMain, renderJul, renderBoth,
    setCanvasesSticky,
    logStatus,
    setFractal,
    setColorscheme,
    setColormethod,
    setModifier,
    setRadius, getRadius,
    setIterations, getIterations,
    setPower, getPower,
    setConstantX, setConstantY, getConstant,
    setInterpolation, getInterpolation,
    setCanvasSize,
    setColoroffset, getColorOffset,
    setColorfulness, getColorfulness,
    setSampleCount, getSampleCount,
    setNoiseSeed, getNoiseSeed,
    setNoiseAmplitude, getNoiseAmplitude,
    setNoiseMultiplier, getNoiseMultiplier,
    exportMain, exportJul,
    applyUrlWithParameters,
    _applyUrlWithParameters,
    createUrlWithParameters,
    loadParamsFromFile,
    createAndOpenUrl, createAndCopyUrl,
    reset,
    randomize,
    forceWebGL, forceWebGPU,
    toggleCustomShader,
    updateShader,
    createUiSection,
    contextMain, contextJul,
    setChunkerFinalSize, setChunkerChunkSize,
    renderAndExportChunkedMain, renderAndExportChunkedJuliaset,
    compileAndRender,
    compileShaders,
    _createShaderButton,
    fractalButtons,
    colorschemeButtons,
    colormethodButtons,
    modifierButtons,
    importToCustomCode,
    setCenter, getCenter,
    setCenterX, setCenterY,
    setZoom, getZoom, 
    updateUi,
    getMainCanvas, getJuliasetCanvas,
    showLoadingWave, hideLoadingWave,
    onPluginsInitialized,
    onAnimationsInitialized,
    setSmoothing,
    setSmoothingValue,
    includeAnimationInPreset,
    includePluginsInPreset,
    drawReturnImageData,
    setZoomSpeed,
    setSmoothingFPS,
    includeCanvasSizeInPreset,
    includeSmoothingInPreset,
    useDynamicSampleCount,
    setDynamicSampleCountLow
}; 
for (const [name, func] of Object.entries(exports)) { window[name] = func; }