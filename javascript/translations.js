
var language;
var translations;
var translationsInitialized = false;

language = "en_US";

var languageFiles = {};

function addLanguageFile(lang, path) {
    if (!languageFiles[lang]) { languageFiles[lang] = []; }
    languageFiles[lang].push(path);
}

function getLanguageFiles() {
    return languageFiles;
}

addLanguageFile("en_US", "/language/en_US.json");
addLanguageFile("de_DE", "/language/de_DE.json");

async function setLanguage(lang, doNotReload) {

    language = lang;

    try {
        translations = {};
        for (var file of languageFiles[lang]) {
            var t = JSON.parse(await (await fetch(file)).text());
            for (var key of Object.keys(t)) {
                translations[key] = t[key];
            }
        }
    } catch (e) {
        console.error("failed to load translations:", e);
        translations = { "_": "[error]" }
    }

    if (!doNotReload) {
        reloadTranslations();
    }

}

function reloadTranslations() {
    for (var x of document.getElementsByTagName("fxp-translate")) {
        if (!(x instanceof Translatable)) {
            customElements.upgrade(x); // why does one have to do this?
        }
        x.loadTranslation();
    }
}

function translate(input, ...insertions) {
    if (!translationsInitialized) {
        return "";
    }
    var translation = translations[input];
    if (!translation) {
        console.warn("missing translation for " + input + " in language " + language);
    }
    for (var i = 0; i < insertions.length; i++) {
        translation = translation.replaceAll(`{${i}}`, insertions[i]);
    }
    return translation ?? translations["_"];
}

function translatable(key, ...insertions) {
    if (!translationsInitialized) {
        return "";
    }
    var t = document.createElement("fxp-translate");
    t.setAttribute("key", key);
    for (var i = 0; i < insertions.length; i++) {
        insertions[i].id = key + "_insertion_" + i;
        unusedInsertions.appendChild(insertions[i]);
        t.setAttribute("insert" + i, insertions[i].id);
    }
    return t;
}

var unusedInsertions = document.createElement("div"); 
unusedInsertions.id = "unusedTranslationInsertions";
document.body.appendChild(unusedInsertions);

class Translatable extends HTMLElement {

    constructor() {
        super();
    }

    loadTranslation() {

        if (!translationsInitialized) {
            return;
        }

        var allInsertions = this.getAttributeNames().filter(s => s.match(/insert\d+/g));
        allInsertions.forEach(i => {
            var element = document.getElementById(this.getAttribute(i));
            if (element) {
                unusedInsertions.appendChild(element);
            }
        });

        var translation = translate(this.getAttribute("key") ?? "_");
        var toInsert = translation.match(/\{\d+\}/g) ?? [];

        toInsert.forEach(n => {
            var insertElement = document.getElementById(this.getAttribute("insert" + n.substring(1, n.length - 1)));
            translation = translation.replaceAll(n, insertElement.outerHTML);
            insertElement.remove();
        });

        this.innerHTML = translation.replaceAll("\n", "<br>");
        
    }

    connectedCallback() {
        this.loadTranslation();
    }

    adoptedCallback() {
        this.loadTranslation();
    }

}

function getLanguage() {
    return language;
}

function translationsReady() {
    return translationsInitialized;
}

customElements.define("fxp-translate", Translatable);

await setLanguage(language, false);
translationsInitialized = true;
reloadTranslations();

const exports = {
    Translatable,
    translate,
    translatable,
    reloadTranslations,
    setLanguage,
    addLanguageFile,
    getLanguage,
    getLanguageFiles,
    translationsReady
};
for (const [name, func] of Object.entries(exports)) { window[name] = func; }