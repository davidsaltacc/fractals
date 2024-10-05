
var _loadedPlugins = [];

class FXPluginUISection {

    constructor(id, name, element) {
        this.id = id;
        this.name = name;
        this.element = element;
    }

    createButton(name, clickHandler) {

        var button = document.createElement("button");
        button.innerHTML = name;
        button.onclick = clickHandler;
        button.className = "pluginButton";

        this.element.appendChild(button);

        return button;

    }

    createCustomFractalButton(id, name) {
        return this.createButton(name, () => setFractal(FRACTALS[id.toUpperCase()]));
    }

    createCustomColorschemeButton(id, name) {
        return this.createButton(name, () => setColorscheme(COLORSCHEMES[id.toUpperCase()]));
    }

    createCustomColorMethodButton(id, name) {
        return this.createButton(name, () => setColormethod(COLOR_METHODS[id.toUpperCase()]));
    }

    createCustomPostFunctionButton(id, name) {
        return this.createButton(name, () => setPostFunction(MODIFIERS[id.toUpperCase()]));
    }

}

function getFileFolderPath(path) {
    return path.substring(0, path.lastIndexOf("/") + 1);
}

class FXPlugin {

    constructor(id, name, description, version, shaders) {

        this.id = id;
        this.name = name;
        this.description = description;
        this.version = version;
        this.shaders = (shaders.endsWith("/") ? shaders : shaders + "/").replaceAll("//", "/");

        _loadedPlugins.forEach(p => {
            if (p.id == id) {
                throw new Error("A plugin with id " + id + " already exists.");
            }
        });
    
        _loadedPlugins.push(this);

    }

    createUiSection(defaultHidden) {
        
        var d = document.createElement("div");
        d.className = "toggleable";

        var content = createUiSection("<h3>" + this.name + "</h3>", "<p>" + this.description + "</p>", defaultHidden, d);

        this._html = d;

        document.getElementById("pluginContainer").appendChild(d);

        return new FXPluginUISection(this.id, this.name, content);

    }

    addCustomFractal(id, description, formula, radius) {

        FRACTALS[id.toUpperCase()] = {
            radius: radius,
            description: description,
            formula: formula,
            shader: id,
            shader_folder: this.shaders + "fractals/"
        };

    }

    addCustomColorscheme(id, description) {

        COLORSCHEMES[id.toUpperCase()] = {
            description: description,
            shader: id,
            shader_folder: this.shaders + "colorschemes/"
        };

    }

    addCustomColorMethod(id, description) {

        COLOR_METHODS[id.toUpperCase()] = {
            description: description,
            shader: id,
            shader_folder: this.shaders + "colormethods/"
        };

    }

    addCustomPostFunction(id, description, radius) {

        MODIFIERS[id.toUpperCase()] = {
            radius: radius ?? null,
            description: description,
            shader: id,
            shader_folder: this.shaders + "post_functions/"
        };

    }

}

async function loadPluginCode(json, path) { 

    var metadata;

    try {
        metadata = JSON.parse(json);
    } catch {
        alert("Invalid plugin");
        return;
    }

    if (metadata.metadata_version != METADATA.plugin_version) {
        alert("Plugin for wrong version of fractal explorer");
        return;
    }

    var CreatePlugin = () => { return new FXPlugin(metadata.id, metadata.name, metadata.description, metadata.plugin_version, getFileFolderPath(path) + metadata.shaders); };
    eval(await (await fetch(getFileFolderPath(path) + metadata.entrypoint)).text());

}

async function loadPluginUrl(url) { await loadPluginCode(await (await fetch(url)).text(), url); }

const exports = {
    loadPluginUrl,
    loadPluginCode
};
for (const [name, func] of Object.entries(exports)) { window[name] = func; }