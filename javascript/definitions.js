
var DEBUG_MODE = false;

async function loadData(file, mod) {
    
    var data = null;

    try {
        data = JSON.parse(await (await fetch("/data/" + file + ".json")).text(), mod);
    } catch (error) {
        data = {};
        console.error(error);
    }

    return data;

}

const METADATA = await loadData("meta");
const FRACTALS = await loadData("fractals");
const COLOR_METHODS = await loadData("color_methods");
const COLORSCHEMES = await loadData("colorschemes");
const MODIFIERS = await loadData("modifiers");
const EASINGS = await loadData("easings", (key, value) => {
    if (key == "function") { return eval(`(${value})`); }
    return value;
});

const exports = {
    METADATA, 
    FRACTALS, 
    COLORSCHEMES,
    COLOR_METHODS,
    MODIFIERS, 
    EASINGS,
    DEBUG_MODE
};
for (const [name, func] of Object.entries(exports)) { window[name] = func; }