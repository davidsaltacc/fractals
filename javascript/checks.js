
const el = id => document.getElementById(id);

const log = (x, color) => {
    console.log(x);
    el("log").innerHTML += `<p style="color: ${color ?? "#ffffff"}">${x.replaceAll("\n", "<br>")}</p>`;
};

var allChecks = [];

class Check {

    constructor(name, validate) {
        this.validate = async () => { 
            this.valid = await validate();
        }
        this.name = name;
        this.valid = false;
        allChecks.push(this);
    }

}

var allTranslationsPresentCheck = new Check("AllTranslationsPresent", async () => {

    var allPresent = true;
    var supportedLanguages = JSON.parse(await (await fetch("/data/languages.json")).text()).supported;
    var allKeys = Object.keys(JSON.parse(await (await fetch("/language/en.json")).text()));

    supportedLanguages.splice(supportedLanguages.indexOf("en"), 1);

    for (var lang of supportedLanguages) {
        var langKeys = Object.keys(JSON.parse(await (await fetch(`/language/${lang}.json`)).text()));
        allKeys.forEach(key => {
            if (langKeys.indexOf(key) < 0) {
                log(`missing translation for key ${key} in language ${lang}`, "#ffff7f");
                allPresent = false;
            }
        });
    }

    return allPresent;

});

var allShadersPresent = new Check("AllShadersPresent", async () => {

    var allPresent = true;

    var fractalData = JSON.parse(await (await fetch("/data/fractals.json")).text());
    var fractalShaders = [];
    Object.keys(fractalData).forEach(key => fractalShaders.push(fractalData[key].shader));

    var colorschemeData = JSON.parse(await (await fetch("/data/colorschemes.json")).text());
    var colorschemeShaders = [];
    Object.keys(colorschemeData).forEach(key => colorschemeShaders.push(colorschemeData[key].shader));

    var colorMethodData = JSON.parse(await (await fetch("/data/colormethods.json")).text());
    var colorMethodShaders = [];
    Object.keys(colorMethodData).forEach(key => colorMethodShaders.push(colorMethodData[key].shader));

    var modifierData = JSON.parse(await (await fetch("/data/modifiers.json")).text());
    var modifierShaders = [];
    Object.keys(modifierData).forEach(key => modifierShaders.push(modifierData[key].shader));

    for (var shader of fractalShaders) {
        if ((await fetch(`/shaders/fractals/${shader}.frxs`)).status == 404) {
            log(`missing shader file for fractal ${shader}`, "#ffff7f");
            allPresent = false;
        }
    }

    for (var shader of colorschemeShaders) {
        if ((await fetch(`/shaders/colorschemes/${shader}.frxs`)).status == 404) {
            log(`missing shader file for colorscheme ${shader}`, "#ffff7f");
            allPresent = false;
        }
    }

    for (var shader of colorMethodShaders) {
        if ((await fetch(`/shaders/colormethods/${shader}.frxs`)).status == 404) {
            log(`missing shader file for color method ${shader}`, "#ffff7f");
            allPresent = false;
        }
    }

    for (var shader of modifierShaders) {
        if ((await fetch(`/shaders/modifiers/${shader}.frxs`)).status == 404) {
            log(`missing shader file for modifier ${shader}`, "#ffff7f");
            allPresent = false;
        }
    }

    return allPresent;

});

var allFractalsCanUseModifierCheck = new Check("AllFractalsCanUseModifier", async () => {

    var allCanUse = true;

    var fractalData = JSON.parse(await (await fetch("/data/fractals.json")).text());
    var fractalShaders = [];
    Object.keys(fractalData).forEach(key => fractalShaders.push(fractalData[key].shader));

    for (var fractal of fractalShaders) {
        var res = await fetch(`/shaders/fractals/${fractal}.frxs`);
        if (res.status != 404) {
            var shaderContent = await res.text();
            if (shaderContent.indexOf("apply_modifier") < 0) {
                allCanUse = false;
                log(`fractal ${fractal} can't use modifiers`, "#ffff7f");
            }
        }
    }

    return allCanUse;

});

var allShadersCompileWithoutIssues = new Check("AllShadersCompileWithoutIssues", async () => {

    async function checkShaders(shaders, use_webgpu, use_webgl) {

        if (Array.isArray(shaders)) {
            return Promise.all(shaders.map(s => checkShaders(s[2], s[0], s[1])));
        }

        if (use_webgpu) {

            if (!navigator.gpu) {
                return "WebGPU not supported"; 
            }

            try {
                
                var adapter = await navigator.gpu.requestAdapter();
                if (!adapter) {
                    return "Failed to get GPU adapter";
                }
                var device = await adapter.requestDevice();
          
                var module = device.createShaderModule({ code: shaders });
                var compilationInfo = await module.getCompilationInfo();
          
                var errors = compilationInfo.messages.filter(msg => msg.type == "error");

                if (errors.length > 0) {
                    return errors.map(err => err.message).join("\n");
                }

                return null;

            } catch (e) {
                return e.message;
            }

        } else if (use_webgl) {

            var canvas = document.createElement("canvas");
            var gl = canvas.getContext("webgl2");

            if (!gl) {
                return "WebGL not supported";
            }

            var shader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(shader, shaders);
            gl.compileShader(shader);
            
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                var errMsg = gl.getShaderInfoLog(shader);
                return errMsg || "Unknown WebGL shader compile error";
            }
            return null;

        }

    }

    function parseFRXSFile(content, use_webgpu, use_webgl) {

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
                } else if ((currentBackends.includes("webgpu") && use_webgpu) || (currentBackends.includes("webgl") && use_webgl) || currentBackends[0] == "all") {
                    finalShaderContent += line + "\n";
                }
            }
    
        }
    
        return finalShaderContent;
    
    }

    var minimalWebGPUShader = await (await fetch("/shaders/checks/main_minimal.wgsl")).text();
    var minimalWebGLShader = await (await fetch("/shaders/checks/main_minimal.frag")).text();

    function fullShader(f, cs, cm, m, use_webgpu, use_webgl) {
        return (use_webgpu ? minimalWebGPUShader : (use_webgl ? minimalWebGLShader : ""))
            .replaceAll("///ITER_FUNC", f)
            .replaceAll("///COLORSCHEME", cs)
            .replaceAll("///COLORING_METHOD", cm)
            .replaceAll("///POST_FUNC", m);
    }
    
    var allShaders = [];

    var fractalData = JSON.parse(await (await fetch("/data/fractals.json")).text());
    for (var key of Object.keys(fractalData)) {
        var frxs = await (await fetch(`/shaders/fractals/${fractalData[key].shader}.frxs`)).text();
        allShaders.push([ "fractal", `${fractalData[key].shader}.frxs`, true, false, parseFRXSFile(frxs, true, false) ]);
        allShaders.push([ "fractal", `${fractalData[key].shader}.frxs`, false, true, parseFRXSFile(frxs, false, true) ]);
    }

    var colorschemeData = JSON.parse(await (await fetch("/data/colorschemes.json")).text());
    for (var key of Object.keys(colorschemeData)) {
        var frxs = await (await fetch(`/shaders/colorschemes/${colorschemeData[key].shader}.frxs`)).text();
        allShaders.push([ "colorscheme", `${colorschemeData[key].shader}.frxs`, true, false, parseFRXSFile(frxs, true, false) ]);
        allShaders.push([ "colorscheme", `${colorschemeData[key].shader}.frxs`, false, true, parseFRXSFile(frxs, false, true) ]);
    }

    var colormethodData = JSON.parse(await (await fetch("/data/colormethods.json")).text());
    for (var key of Object.keys(colormethodData)) {
        var frxs = await (await fetch(`/shaders/colormethods/${colormethodData[key].shader}.frxs`)).text();
        allShaders.push([ "colormethod", `${colormethodData[key].shader}.frxs`, true, false, parseFRXSFile(frxs, true, false) ]);
        allShaders.push([ "colormethod", `${colormethodData[key].shader}.frxs`, false, true, parseFRXSFile(frxs, false, true) ]);
    }

    var modifierData = JSON.parse(await (await fetch("/data/modifiers.json")).text());
    for (var key of Object.keys(modifierData)) {
        var frxs = await (await fetch(`/shaders/modifiers/${modifierData[key].shader}.frxs`)).text();
        allShaders.push([ "modifier", `${modifierData[key].shader}.frxs`, true, false, parseFRXSFile(frxs, true, false) ]);
        allShaders.push([ "modifier", `${modifierData[key].shader}.frxs`, false, true, parseFRXSFile(frxs, false, true) ]);
    }

    var allFullShaders = [];

    for (var shader of allShaders) {
        allFullShaders.push([ 
            shader[2], shader[3], 
            fullShader(
                shader[0] == "fractal" ? shader[4] : "return vec2(0.);",
                shader[0] == "colorscheme" ? shader[4] : "return vec4(0.);",
                shader[0] == "colormethod" ? shader[4] : "",
                shader[0] == "modifer" ? shader[4] : "return vec2(0.);",
                shader[2], shader[3]
            )
        ]);
    }

    var results = await checkShaders(allFullShaders); 
    for (var i = 0; i < results.length; i++) {
        if (results[i]) {
            var info = allShaders[i];
            log(`could not compile ${info[0]} shader ${info[1]} (${info[2] ? "WebGPU" : (info[3] ? "WebGL" : "unknown")}): ${results[i]}`, "#ffff7f");
            allCompile = false;
        }
    }

    var allCompile = true;

    return allCompile;

});

var succeeded = 0;
for (var check of allChecks) {
    await check.validate();
    log(`check ${check.name} ${check.valid ? "succeeded" : "failed"}`, check.valid ? "#7fff7f" : "#ff7f7f");
    succeeded += check.valid ? 1 : 0;
};

log(`\n${succeeded} out of ${allChecks.length} checks finished successfully`);