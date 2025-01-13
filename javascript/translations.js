
var language;
var translations;

await setLanguage("en_US", true);

async function setLanguage(lang, doNotReload) {

    language = lang;

    try {
        translations = JSON.parse(await (await fetch("/language/" + language + ".json")).text());
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
    var t = document.createElement("fxp-translate");
    t.setAttribute("key", key);
    for (var i = 0; i < insertions.length; i++) {
        insertions[i].id = key + "_insertion_" + i;
        unusedInsertions.appendChild(insertions[i]);
        t.setAttribute("insert" + i, insertions[i].id)
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

        var allInsertions = this.getAttributeNames().filter(s => s.match(/insert\d+/g));
        allInsertions.forEach(i => {
            var element = document.getElementById(this.getAttribute(i));
            if (element) {
                unusedInsertions.appendChild(element);
            }
        });

        var translation = translate(this.getAttribute("key") ?? "_").trim();
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

customElements.define("fxp-translate", Translatable);

const exports = {
    Translatable,
    translate,
    translatable,
    reloadTranslations,
    setLanguage
};
for (const [name, func] of Object.entries(exports)) { window[name] = func; }