
var _loadedPlugins = [];
var _loadedPluginsURLs = [];

class FXPluginUISection {

    constructor(id, name, element) {
        this.id = id;
        this.name = name;
        this.element = element;
    }

    createButton(name, clickHandler) {

        var button = document.createElement("button");
        button.innerHTML = translatable(name).outerHTML;
        button.onclick = clickHandler;
        button.className = "shaderButton";

        this.element.appendChild(button);

        return button;

    }

    createCustomFractalButton(id) {
        var button = _createShaderButton(translatable(FRACTALS[id.toUpperCase()].name).outerHTML, () => setFractal(FRACTALS[id.toUpperCase()]), fractalButtons, id.toUpperCase(), FRACTALS);
        this.element.appendChild(button);
        return button;
    }

    createCustomColorschemeButton(id) {
        var button = _createShaderButton(translatable(COLORSCHEMES[id.toUpperCase()].name).outerHTML, () => setColorscheme(COLORSCHEMES[id.toUpperCase()]), colorschemeButtons, id.toUpperCase(), COLORSCHEMES);
        this.element.appendChild(button);
        return button;
    }

    createCustomColorMethodButton(id) {
        var button = _createShaderButton(translatable(COLOR_METHODS[id.toUpperCase()].name).outerHTML, () => setColormethod(COLOR_METHODS[id.toUpperCase()]), colormethodButtons, id.toUpperCase(), COLOR_METHODS);
        this.element.appendChild(button);
        return button;
    }

    createCustomModifierButton(id) {        
        var button = _createShaderButton(translatable(MODIFIERS[id.toUpperCase()].name).outerHTML, () => setModifiers(MODIFIERS[id.toUpperCase()]), modifierButtons, id.toUpperCase(), MODIFIERS);
        this.element.appendChild(button);
        return button;
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

    addCustomFractal(id, name, description, formula, radius) {

        FRACTALS[id.toUpperCase()] = {
            name: name,
            radius: radius,
            description: description,
            formula: formula,
            shader: id,
            shader_folder: this.shaders + "fractals/"
        };

    }

    addCustomColorscheme(id, name, description) {

        COLORSCHEMES[id.toUpperCase()] = {
            name: name,
            description: description,
            shader: id,
            shader_folder: this.shaders + "colorschemes/"
        };

    }

    addCustomColorMethod(id, name, description) {

        COLOR_METHODS[id.toUpperCase()] = {
            name: name,
            description: description,
            shader: id,
            shader_folder: this.shaders + "colormethods/"
        };

    }

    addCustomModifier(id, name, description, radius) {

        MODIFIERS[id.toUpperCase()] = {
            name: name,
            radius: radius ?? null,
            description: description,
            shader: id,
            shader_folder: this.shaders + "modifiers/"
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

    _loadedPluginsURLs.push(path);

    var translationsFolder = getFileFolderPath(path) + metadata.translations;
    for (var lang of metadata.supportedLanguages) {
        addLanguageFile(lang, (translationsFolder.endsWith("/") ? translationsFolder : translationsFolder + "/").replaceAll("//", "/") + lang + ".json");
    }

    if (translationsReady()) {
        await setLanguage(getLanguage());
    }

    var CreatePlugin = () => { return new FXPlugin(metadata.id, metadata.name, metadata.description, metadata.plugin_version, getFileFolderPath(path) + metadata.shaders); };
    eval(await (await fetch(getFileFolderPath(path) + metadata.entrypoint)).text());

}

async function loadPluginUrl(url) { await loadPluginCode(await (await fetch(url)).text(), url); }

function getLoadedPlugins() {
    return _loadedPlugins;
}

function getLoadedPluginsURLs() {
    return _loadedPluginsURLs;
}

const exports = {
    loadPluginUrl,
    loadPluginCode,
    getLoadedPlugins,
    getLoadedPluginsURLs
};
for (const [name, func] of Object.entries(exports)) { window[name] = func; }

await onPluginsInitialized();