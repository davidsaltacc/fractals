
const el = id => document.getElementById(id);

if (window.location.href.startsWith("http://127.0.0.1")) { // sorry
    el("sb").style.display = "none";
}

function logStatus(s) {
    console.log(s);
    el("statusbar").innerHTML = s;
}

var USE_WEBGPU = "gpu" in navigator;
var USE_WEBGL = !USE_WEBGPU && (typeof WebGL2RenderingContext !== "undefined");
var DISABLED = !USE_WEBGPU && !USE_WEBGL;

if (DISABLED) {
    [ "statusbar", "loadingwave-center" ].forEach(i => el(i).remove());
    el("loadingscreen").style.backgroundColor = "rgb(0, 0, 0)";
    [ alert, e => { throw new Error(e) } ].forEach(f => f("Neither WebGPU nor WebGL are supported in your browser. "));
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

    return finalShaderContent;

}


logStatus("starting initialization");

const canvasMain = document.getElementById("canvasMain");
const canvasJul = el("canvasJul");
var contextMain;
var contextJul;

if (USE_WEBGPU) {

    logStatus("initializing WebGPU. if this takes more than a few seconds, the fractal explorer probably crashed the last time you used it. in that case, simply restart your browser. ");

    var wgpu_adapter = await navigator.gpu.requestAdapter();
    var wgpu_device = await wgpu_adapter.requestDevice();

    contextMain = canvasMain.getContext("webgpu", { preserveDrawingBuffer: true });
    contextJul = canvasJul.getContext("webgpu", { preserveDrawingBuffer: true });

} else if (USE_WEBGL) {
    
    logStatus("initializing WebGL");
  
    contextMain = canvasMain.getContext("webgl2", { preserveDrawingBuffer: true });
    contextJul = canvasJul.getContext("webgl2", { preserveDrawingBuffer: true });

    if (contextMain == null || contextJul == null) {
        logStatus("error initializing webgl. the fractal explorer probably crashed the last time you used it. in that case, simply restart your browser.");
        throw new Error();
    }

}

function gpuLost() {
    renderMain();
    renderJul();
    alert("Lost contact to your GPU. Please reload this page, and if neccessary, restart your browser. You also have the option to copy the link from the export section to avoid data loss. In case you experience black flashes on your screen after, please restart your PC.");
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

function canvasTooBig() {
    return canvasMain.width > (window.innerWidth - window.innerWidth / 6) / 2 || canvasMain.width > window.innerHeight - window.innerHeight / 4;
}

function setCanvasesSticky(sticky) {
    el("canvasContainer").className = sticky ? "sticky" : (canvasTooBig() ? "unsticky unsticky-big" : "unsticky");
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
var postFracFunc;
var juliasetConstant;
var juliasetInterpolation;
var colorfulness;
var sampleCount;
var cloudSeed ;
var cloudAmplitude;
var cloudMultiplier;

function reset() {

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
    postFracFunc = MODIFIERS.NONE;
    juliasetConstant = [0, 0];
    juliasetInterpolation = 1;
    colorfulness = 1;
    sampleCount = 4;
    cloudSeed = 33333;
    cloudAmplitude = 0;
    cloudMultiplier = 0.8;

    compileAndRender();

}

function randomize() {

    radius = [ 10, 50, 400, 1000, 10000000 ][Math.floor(Math.random() * 5)];
    power = 1 + Math.floor(Math.random() * 7);
    colorOffset = Math.random();
    colorfulness = Math.random() * 2;
    var fractalKeys = Object.keys(FRACTALS);
    fractalType =  FRACTALS[fractalKeys[ Math.floor(fractalKeys.length * Math.random()) ]];
    var colorschemeKeys = Object.keys(COLORSCHEMES);
    colorscheme =  COLORSCHEMES[colorschemeKeys[ Math.floor(colorschemeKeys.length * Math.random()) ]];
    var colorMethodKeys = Object.keys(COLOR_METHODS);
    colorMethod =  COLOR_METHODS[colorMethodKeys[ Math.floor(colorMethodKeys.length * Math.random()) ]];
    juliasetInterpolation = Math.random() > 0.5 ? 1 : 1 - Math.pow(Math.random(), 2);
    
    compileAndRender();

}

var wgpu_pipeline;
var wgpu_bindGroup;
var wgpu_uniformBuffer;

var wgl_programMain;
var wgl_programJul;

if (USE_WEBGPU) {
    var format = navigator.gpu.getPreferredCanvasFormat();
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
        + Float32Array.BYTES_PER_ELEMENT // cloudSeed: f32
        + Float32Array.BYTES_PER_ELEMENT // cloudAmplitude: f32
        + Float32Array.BYTES_PER_ELEMENT // cloudMultiplier: f32
        + Uint32Array.BYTES_PER_ELEMENT // maxIterations: u32
        + Uint32Array.BYTES_PER_ELEMENT // sampleCount: u32
        + Uint32Array.BYTES_PER_ELEMENT // juliaset: u32
    ) / 8) * 8;

    wgpu_uniformBuffer = wgpu_device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    contextMain.configure({
        device: wgpu_device,
        format: format
    });
    contextJul.configure({
        device: wgpu_device,
        format: format
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

    if (USE_WEBGPU) {

        var code = await (await fetch("shaders/core/webgpu/main.wgsl")).text();

        code = insertCustomShaders(code, cmethod, cscheme, fractal, postf);
        
        const cshaderModule = wgpu_device.createShaderModule({ code: code });

        try {

            wgpu_device.pushErrorScope("validation");
            
            var format = navigator.gpu.getPreferredCanvasFormat();

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
                    targets: [{ format: format }],
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

            var vertexArray = new Float32Array([-1., -1., 1., -1., 1., 1., -1., 1.]);
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
    if (customCode) {
        return customCode;
    }
    var path = object.shader_folder ? object.shader_folder + object.shader + ".frxs" : "/shaders/" + type + "/" + object.shader + ".frxs"
    return parseFRXSFile(await (await fetch(path)).text());
}

async function compileShaders(cmethod, cscheme, fractal, postf) {

    showLoadingWave();
    logStatus("compiling shader");

    var result = await _compileShaders(
        await fetchSubCode(cmethod, "colormethods"),
        customCs ? document.getElementById("cscodei").value : await fetchSubCode(cscheme, "colorschemes"), //customCs ? el("cscodei").value : await fetchSubCode(cscheme, "colorschemes", pluginCs),
        customFractal ? document.getElementById("fcodei").value : await fetchSubCode(fractal, "fractals"), //customFractal ? el("fcodei").value : await fetchSubCode(fractal, "fractals", pluginFractal),
        await fetchSubCode(postf, "post_functions")
    );

    logStatus("finished compiling shader");
    hideLoadingWave();

    updateUi();

    return result;
}

function wgl_setUniforms(gl, program, juliaset) {
    
    gl.uniform2fv(gl.getUniformLocation(program, "center"), !juliaset ? centerMain : centerJul);
    gl.uniform2fv(gl.getUniformLocation(program, "juliasetConstant"), juliasetConstant);
    gl.uniform2fv(gl.getUniformLocation(program, "canvasDimensions"), [ canvasMain.width, canvasMain.height ]);
    gl.uniform1f(gl.getUniformLocation(program, "zoom"), !juliaset ? zoomMain : zoomJul);
    gl.uniform1f(gl.getUniformLocation(program, "radius"), radius);
    gl.uniform1f(gl.getUniformLocation(program, "power"), power);
    gl.uniform1f(gl.getUniformLocation(program, "colorOffset"), colorOffset);
    gl.uniform1f(gl.getUniformLocation(program, "juliasetInterpolation"), juliasetInterpolation);
    gl.uniform1f(gl.getUniformLocation(program, "colorfulness"), colorfulness);
    gl.uniform1f(gl.getUniformLocation(program, "cloudSeed"), cloudSeed);
    gl.uniform1f(gl.getUniformLocation(program, "cloudAmplitude"), cloudAmplitude);
    gl.uniform1f(gl.getUniformLocation(program, "cloudMultiplier"), cloudMultiplier);
    gl.uniform1ui(gl.getUniformLocation(program, "maxIterations"), maxIterations);
    gl.uniform1ui(gl.getUniformLocation(program, "sampleCount"), sampleCount);
    gl.uniform1ui(gl.getUniformLocation(program, "juliaset"), juliaset);

}

function draw(context, juliaset, center, zoom) {

    if (USE_WEBGPU) {
        const arrayBuffer = new ArrayBuffer(uniformBufferSize);
        new Float32Array(arrayBuffer, 0).set([
            center[0],
            center[1],
            juliasetConstant[0],
            juliasetConstant[1],
            canvasMain.width, 
            canvasMain.height,
            zoom,
            radius,
            power, 
            colorOffset,
            juliasetInterpolation,
            colorfulness,
            cloudSeed,
            cloudAmplitude,
            cloudMultiplier
        ]);
        new Uint32Array(arrayBuffer, 15 * Float32Array.BYTES_PER_ELEMENT).set([
            maxIterations,
            sampleCount,
            juliaset
        ]);
        wgpu_device.queue.writeBuffer(wgpu_uniformBuffer, 0, arrayBuffer);

        const encoder = wgpu_device.createCommandEncoder();
        const renderPass = encoder.beginRenderPass({
            colorAttachments: [{
                view: context.getCurrentTexture().createView(),
                loadOp: "clear",
                clearValue: [0, 0, 0, 1],
                storeOp: "store",
            }],
        });

        renderPass.setPipeline(wgpu_pipeline);
        renderPass.setBindGroup(0, wgpu_bindGroup);
        renderPass.draw(4);
        renderPass.end();

        wgpu_device.queue.submit([ encoder.finish() ]);

    } else if (USE_WEBGL) {

        wgl_setUniforms(context, !juliaset ? wgl_programMain : wgl_programJul, juliaset);
        context.drawArrays(context.TRIANGLE_FAN, 0, 4);

    }

}

function renderMain() {
    draw(contextMain, 0, centerMain, zoomMain);
}

function renderJul() {
    draw(contextJul, 1, centerJul, zoomJul);
}
function renderBoth() {
    renderMain();
    renderJul();
}

async function compileAndRender() {
    await compileShaders(colorMethod, colorscheme, fractalType, postFracFunc);
    renderBoth();
}


var mouseMainX = 0;
var mouseMainY = 0;
var mouseClickedMain = false;
var mouseClickedRightMain = false;

var mouseJulX = 0;
var mouseJulY = 0;
var mouseClickedJul = false;
var mouseClickedRightJul = false;

var zoomSpeed = 1 / 500;

function updateMouseCoords(event, canvas, zoom, center) {
    var rect = event.target.getBoundingClientRect();
    var x = (2 * (event.clientX - rect.left) - canvas.clientWidth) / Math.min(canvas.clientWidth, canvas.clientHeight);
    var y = -1 * (2 * (event.clientY - rect.top) - canvas.clientHeight) / Math.min(canvas.clientWidth, canvas.clientHeight);
    return [x / zoom + center[0], y / zoom + center[1]];
}

function updateMouseCoordsMain(event) { [mouseMainX, mouseMainY] = updateMouseCoords(event, canvasMain, zoomMain, centerMain); }
function updateMouseCoordsJul(event)  { [mouseJulX, mouseJulY] = updateMouseCoords(event, canvasJul, zoomJul, centerJul);      }

canvasMain.onmousemove = event => {

    if (mouseClickedRightMain) {

        var oldX = mouseMainX;
        var oldY = mouseMainY;
        updateMouseCoordsMain(event);
        centerMain[0] += oldX - mouseMainX;
        centerMain[1] += oldY - mouseMainY;
        updateMouseCoordsMain(event);
        renderMain();

    } else if (mouseClickedMain) {

        updateMouseCoordsMain(event);
        juliasetConstant[0] = mouseMainX;
        juliasetConstant[1] = mouseMainY;
        renderJul();

    }

};

canvasMain.onmousedown = event => {

    if (event.button == 0) {

        mouseClickedMain = true;
        juliasetConstant[0] = mouseMainX;
        juliasetConstant[1] = mouseMainY;
        renderJul();

    } else if (event.button == 2) {
        mouseClickedRightMain = true;
    }
    
    updateMouseCoordsMain(event);
};

canvasMain.onmouseup = event => {

    if (event.button == 0) {
        mouseClickedMain = false;
    } else if (event.button == 2) {
        mouseClickedRightMain = false;
    }

};

canvasMain.onwheel = event => {

    event.preventDefault();
    var z = Math.exp(-event.deltaY * zoomSpeed);
    updateMouseCoordsMain(event);
    centerMain[0] = mouseMainX + (centerMain[0] - mouseMainX) / z;
    centerMain[1] = mouseMainY + (centerMain[1] - mouseMainY) / z;
    zoomMain *= z;
    renderMain();

};

canvasMain.oncontextmenu = event => event.preventDefault();


canvasJul.onmousemove = event => {

    if (mouseClickedRightJul) {

        var oldX = mouseJulX;
        var oldY = mouseJulY;
        updateMouseCoordsJul(event);
        centerJul[0] += oldX - mouseJulX;
        centerJul[1] += oldY - mouseJulY;
        updateMouseCoordsJul(event);
        renderJul();

    }

};

canvasJul.onmousedown = event => {

    if (event.button == 2) {
        mouseClickedRightJul = true;
    }
    updateMouseCoordsJul(event);

};

canvasJul.onmouseup = event => {

    if (event.button == 2) {
        mouseClickedRightJul = false;
    }

};

canvasJul.onwheel = event => {

    event.preventDefault();
    var z = Math.exp(-event.deltaY * zoomSpeed);
    updateMouseCoordsJul(event);
    centerJul[0] = mouseJulX + (centerJul[0] - mouseJulX) / z;
    centerJul[1] = mouseJulY + (centerJul[1] - mouseJulY) / z;
    zoomJul *= z;
    renderJul();

};


canvasJul.oncontextmenu = event => event.preventDefault();


function buttonPressed(type) {

    var buttons = document.querySelectorAll("button");
    var targetType = type;
    var button = null;

    buttons.forEach(b => {
        var onclickAttr = b.getAttribute("onclick");
        if (onclickAttr && onclickAttr.includes(targetType)) {
            button = b;
        }
    });

    button.parentElement.childNodes.forEach(child => child.className = "");
    button.className = "button-highlight";

}

function updateUi() {
    
    el("frdesc").innerHTML = fractalType.description;
    el("csdesc").innerHTML = colorscheme.description;
    el("cmdesc").innerHTML = colorMethod.description;
    el("fmdesc").innerHTML = postFracFunc.description;

    el("radius").value = radius;
    el("iterations").value = maxIterations;
    el("power").value = power;
    el("constantRe").value = juliasetConstant[0];
    el("constantIm").value = juliasetConstant[1];
    el("nji").value = juliasetInterpolation;
    el("canvasSize").value = canvasMain.width;
    el("coloroffset").value = colorOffset;
    el("colorfulness").value = colorfulness;
    el("sampleCount").value = sampleCount;

    el("cloudSeed").value = cloudSeed;
    el("cloudAmplitude").value = cloudAmplitude;
    el("cloudMultiplier").value = cloudMultiplier;

    el("frfm").innerHTML = fractalType.formula.replaceAll("POWER", power);
    
    // worst code ever, i know. tho don't judge, it works
    try { buttonPressed("FRACTALS." + Object.keys(FRACTALS).find(key => FRACTALS[key] == fractalType) + ")"); } catch { /* button not present */ }
    try { buttonPressed("COLORSCHEMES." + Object.keys(COLORSCHEMES).find(key => COLORSCHEMES[key] == colorscheme) + ")"); } catch { /* button not present */ }
    try { buttonPressed("COLOR_METHODS." + Object.keys(COLOR_METHODS).find(key => COLOR_METHODS[key] == colorMethod) + ")"); } catch { /* button not present */ }
    try { buttonPressed("MODIFIERS." + Object.keys(MODIFIERS).find(key => MODIFIERS[key] == postFracFunc) + ")"); } catch { /* button not present */ }
    

}


function setFractal(fractal) {

    fractalType = fractal;

    if (postFracFunc == MODIFIERS.NONE) {
        radius = fractalType.radius;
    } else if (postFracFunc.radius != null) {
        radius = postFracFunc.radius;
    }

    compileAndRender();

}

function setColorscheme(scheme) {
    colorscheme = scheme;
    compileAndRender();
}

function setColormethod(method) {
    colorMethod = method;
    compileAndRender();
}

function setPostFunction(func) {

    postFracFunc = func;

    if (func.radius != null) {
        radius = func.radius;
    } else {
        radius = fractalType.radius;
    }

    compileAndRender();

}


function setCanvasSize(size) {

    canvasMain.width = canvasMain.height = size;
    canvasJul.width = canvasJul.height = size;

    if (USE_WEBGL) {   
        [ contextMain, contextJul ].forEach(gl => gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight));
    }

    if (size > (window.innerWidth - window.innerWidth / 6) / 2 && size > window.innerHeight - window.innerHeight / 4) {
        setCanvasesSticky(false);
    } else {
        setCanvasesSticky(true);
    }
    
    renderBoth();
}

function setRadius(value) { radius = value; renderBoth(); }
function setIterations(value) { maxIterations = value; renderBoth(); }
function setPower(value) { power = value; renderBoth(); }
function setConstantX(value) { juliasetConstant[0] = value; renderBoth(); }
function setConstantY(value) { juliasetConstant[1] = value; renderBoth(); }
function setInterpolation(value) { juliasetInterpolation = value; renderBoth(); }
function setColoroffset(value) { colorOffset = value; renderBoth(); }
function setColorfulness(value) { colorfulness = value; renderBoth(); }
function setSampleCount(value) { sampleCount = value; renderBoth(); }
function setCloudSeed(value) { cloudSeed = value; renderBoth(); }
function setCloudAmplitude(value) { cloudAmplitude = value; renderBoth(); }
function setCloudMultiplier(value) { cloudMultiplier = value; renderBoth(); }


function createUrlWithParameters() {

    var url = new URL(window.location.origin + window.location.pathname); 
    var params = url.searchParams;

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
    params.append("f", Object.keys(FRACTALS).find(key => FRACTALS[key] === fractalType));
    params.append("cm", Object.keys(COLOR_METHODS).find(key => COLOR_METHODS[key] === colorMethod));
    params.append("cs", Object.keys(COLORSCHEMES).find(key => COLORSCHEMES[key] === colorscheme));
    params.append("pf", Object.keys(MODIFIERS).find(key => MODIFIERS[key] === postFracFunc));
    params.append("co", colorOffset);
    params.append("cf", colorfulness);
    params.append("sc", sampleCount);
    params.append("nji", juliasetInterpolation);
    params.append("p", power);
    params.append("csd", cloudSeed);
    params.append("cam", cloudAmplitude);
    params.append("cml", cloudMultiplier);

    params.delete("forceWebGPU");
    params.delete("forceWebGL");

    return window.location.origin + window.location.pathname + "?fxp=" + btoa(params.toString());

}

function _applyUrlWithParameters(url) {


    if (new URL(window.location.href).searchParams.size == 0) {
        return;
    }

    var params = new URL(window.location.origin + window.location.pathname + "?" + atob(new URL(url).searchParams.get("fxp") ?? "")).searchParams;

    if (params.size == 0) {
        params = new URL(url).searchParams;
        if (params.size - (params.get("forceWebGL") == "1" || params.get("forceWebGPU") == "1") ? 1 : 0 >= 1) { // v4 url
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
    fractalType = params.get("f") ? FRACTALS[params.get("f")] : fractalType;
    colorMethod = params.get("cm") ? COLOR_METHODS[params.get("cm")] : colorMethod;
    colorscheme = params.get("cs") ? COLORSCHEMES[params.get("cs")] : colorscheme;
    postFracFunc = params.get("pf") ? MODIFIERS[params.get("pf")] : postFracFunc;
    colorOffset = parseFloat(params.get("co") ?? colorOffset);
    colorfulness = parseFloat(params.get("cf") ?? colorfulness);
    sampleCount = parseInt(params.get("sc") ?? sampleCount);
    juliasetInterpolation = parseFloat(params.get("nji") ?? juliasetInterpolation);
    power = parseFloat(params.get("p") ?? power);
    cloudSeed = parseFloat(params.get("csd") ?? cloudSeed);
    cloudAmplitude = parseFloat(params.get("cam") ?? cloudAmplitude);
    cloudMultiplier = parseFloat(params.get("cml") ?? cloudMultiplier);

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

function _export(dURL) {
    var pURL = createUrlWithParameters();
    var s = dURL.split(",");
     
    var a = document.createElement("a");  
    a.href = s[0] + "," + btoa(atob(s[1]) + "FXURL::" + pURL);
    a.download = "fractal.png";
    a.click();
    a.remove();
}
function exportMain() {
    renderMain();
    var data = canvasMain.toDataURL("image/png");
    _export(data);
}
function exportJul() {
    renderJul();
    var data = canvasJul.toDataURL("image/png");
    _export(data);
}

function loadParamsFromFile() {
    var input = document.createElement("input");
    input.type = "file";
    input.onchange = e => { 
        var file = e.target.files[0]; 
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
                    _applyUrlWithParameters(split[split.length - 1]);
                    compileAndRender();
                } else {
                    alert("No URL could be found in the uploaded image.");
                }
            }
        }
        input.remove();
    }

    input.click();
}

async function toggleCustomShader(b, t) {
    if (t == "f") {
        customFractal = !customFractal;
    }
    if (t == "cs") {
        customCs = !customCs;
    }
    var returnv = await compileShaders(colorMethod, colorscheme, fractalType, postFracFunc);
    if (returnv == "success") {
        document.getElementById(t + "compileout").innerHTML = "successfully compiled and loaded new shader";
        if (t == "f") {
            b.innerHTML = (customFractal ? "Disable" : "Enable") + " Custom Fractal Shader";
        }
        if (t == "cs") {
            b.innerHTML = (customCs ? "Disable" : "Enable") + " Custom Colorscheme Shader";
        }
        renderBoth();
        updateUi();
    } else {
        document.getElementById(t + "compileout").innerHTML = returnv;
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
    var returnv = await compileShaders(colorMethod, colorscheme, fractalType, postFracFunc);
    customFractal = cfo;
    customCs = ccso;
    if (returnv == "success") {
        document.getElementById(t + "compileout").innerHTML = "successfully compiled and loaded new shader";
        renderBoth();
        customFractal = t == "f";
        customCs = t == "cs";
        if (t == "f") {
            document.getElementById("tgshdf").innerHTML = "Disable Custom Fractal Shader";
        }
        if (t == "cs") {
            document.getElementById("tgshdcs").innerHTML = "Disable Custom Colorscheme Shader";
        }
    } else {
        document.getElementById(t + "compileout").innerHTML = returnv;
        if (t == "f") {
            document.getElementById("tgshdf").innerHTML = "Enable Custom Fractal Shader"; 
            customFractal = false;
        }
        if (t == "cs") {
            document.getElementById("tgshdcs").innerHTML = "Enable Custom Colorscheme Shader";
            customCs = false;
        }
        compileAndRender();
    }
}

reset();
applyUrlWithParameters();
stickyCanvasesIfFit();
compileAndRender();


const exports = {
    renderMain,
    renderJul,
    renderBoth,
    setCanvasesSticky,
    logStatus,
    setFractal,
    setColorscheme,
    setColormethod,
    setPostFunction,
    setRadius,
    setIterations,
    setPower,
    setConstantX,
    setConstantY,
    setInterpolation,
    setCanvasSize,
    setColoroffset,
    setColorfulness,
    setSampleCount,
    setCloudSeed,
    setCloudAmplitude,
    setCloudMultiplier,
    exportMain,
    exportJul,
    applyUrlWithParameters,
    _applyUrlWithParameters,
    createUrlWithParameters,
    loadParamsFromFile,
    createAndOpenUrl,
    createAndCopyUrl,
    reset,
    randomize,
    forceWebGL,
    forceWebGPU,
    toggleCustomShader,
    updateShader,
    createUiSection
}; 
for (const [name, func] of Object.entries(exports)) { window[name] = func; }