
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
    var supportedLanguages = JSON.parse(await (await fetch("/language/languages.json")).text()).supported;
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

var succeeded = 0;
for (var check of allChecks) {
    await check.validate();
    log(`check ${check.name} ${check.valid ? "succeeded" : "failed"}`, check.valid ? "#7fff7f" : "#ff7f7f");
    succeeded += check.valid ? 1 : 0;
};

log(`\n${succeeded} out of ${allChecks.length} checks finished successfully`);