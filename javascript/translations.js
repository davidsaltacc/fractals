
var language;
var translations;
var translationsInitialized = false;

language = "en";

var languageFiles = {};

function addLanguageFile(lang, path) {
    if (!languageFiles[lang]) { languageFiles[lang] = []; }
    languageFiles[lang].push(path);
}

function getLanguageFiles() {
    return languageFiles;
}

var supported = JSON.parse(await (await fetch("/data/languages.json")).text()).supported;

supported.forEach(lang => {

    addLanguageFile(lang, `/language/${lang}.json`);

});

function getSupportedLanguages() {
    return supported;
}

function updateSelectionUi(lang) {
    document.getElementById("lang").innerHTML = translatable(`lang_${lang}`).outerHTML;

    var langDropdownCont = document.getElementById("languageDropdownContent");
    langDropdownCont.childNodes.forEach(c => {
        c.classList.remove("lang-dropdown-selected");
    });
    document.getElementById(`lang_change_${lang}`)?.classList.add("lang-dropdown-selected");
    langDropdownCont.classList.remove("show-dropdown");
}

async function setLanguage(lang, doNotReload) { 

    localStorage.setItem("language", lang);
    language = lang;
    updateSelectionUi(lang);

    try {

        if (lang == "en") {

            translations = {};

            for (var file of languageFiles[lang]) {
                var t = JSON.parse(await (await fetch(file)).text());
                for (var key of Object.keys(t)) {
                    translations[key] = t[key];
                }
            }

        } else {

            translations = {};

            var englTranslations = {};
            var langTranslations = {};
    
            for (var file of languageFiles["en"]) {
                var t = JSON.parse(await (await fetch(file)).text());
                for (var key of Object.keys(t)) {
                    englTranslations[key] = t[key];
                }
            }
    
            for (var file of languageFiles[lang]) {
                var t = JSON.parse(await (await fetch(file)).text());
                for (var key of Object.keys(t)) {
                    langTranslations[key] = t[key];
                }
            }

            var allKeys = [];
            allKeys.push(...Object.keys(englTranslations));
            allKeys.push(...Object.keys(langTranslations).filter(x => allKeys.indexOf(x) < 0));

            for (var key of allKeys) {
                var value = null;
                if (langTranslations[key]) {
                    value = langTranslations[key];
                } else if (englTranslations[key]) {
                    value = englTranslations[key];
                }
                if (!value) {
                    translations[key] = "[error]";
                } else {
                    translations[key] = value;
                }
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

language = localStorage.getItem("language") ?? language;

await setLanguage(language, true);
translationsInitialized = true;
reloadTranslations();
document.getElementById("lang").innerHTML = translatable(`lang_${language}`).outerHTML;

supported.forEach(lang => {

    var langDropdownCont = document.getElementById("languageDropdownContent");

    var langChangeEl = document.createElement("a");
    langChangeEl.innerHTML = translatable(`lang_${lang}`).outerHTML;
    langChangeEl.id = `lang_change_${lang}`;
    langChangeEl.onclick = () => {
        setLanguage(lang);
    };
    langDropdownCont.appendChild(langChangeEl);

});

updateSelectionUi(language);

const exports = {
    Translatable,
    translate,
    translatable,
    reloadTranslations,
    setLanguage,
    addLanguageFile,
    getLanguage,
    getLanguageFiles,
    translationsReady,
    getSupportedLanguages
};
for (const [name, func] of Object.entries(exports)) { window[name] = func; }