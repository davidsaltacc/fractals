
window["exportF"] = exports => {
    for (const [name, func] of Object.entries(exports)) { window[name] = func; }
}

await import("/javascript/overlays.js");
await import("/javascript/definitions.js");
await import("/javascript/translations.js");
await import("/javascript/main.js");
await import("/javascript/plugins.js");
await import("/javascript/animation.js");