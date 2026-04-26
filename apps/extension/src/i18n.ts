export type UILang = "en" | "es";

export const UI_LANG_STORAGE_KEY = "rummageDeepUiLang";

export interface UiStrings {
  languageLabel: string;
  subtitle: string;
  ledeSearch: string;
  labelQuery: string;
  placeholderQuery: string;
  labelMode: string;
  modeAuto: string;
  modeLiteral: string;
  modeHelpAuto: string;
  modeHelpLiteral: string;
  btnSearch: string;
  btnClear: string;
  statusEnterQuery: string;
  statusNoTab: string;
  statusSearching: string;
  statusRestricted: string;
  statusNoMatches: string;
  statusSearchFailed: string;
  statusTalkFail: string;
  statusCleared: string;
  statusClearFail: string;
  /** Line under the big number in the success banner */
  resultsBannerCaption: string;
  /** Optional note when highlights use the browser engine */
  resultsBannerNoteHighlight: string;
  /** When matches exist but highlights could not be drawn */
  resultsBannerNoteNoVisual: string;
  /** If total matches exceed what we highlight on the page */
  resultsMoreOnPage: string;
  navPrevAria: string;
  navNextAria: string;
  /** Use {{n}} and {{total}} placeholders */
  navMatchOf: string;
  versionPrefix: string;
  footerByPrefix: string;
  footerGithub: string;
  footerSupport: string;
}

const EN: UiStrings = {
  languageLabel: "Language",
  subtitle: "By AI4Context",
  ledeSearch:
    "Highlights what you search for on the open website — similar to the browser’s own search (Ctrl+F). If nothing is found, the text may be inside a part of the page this tool cannot read.",
  labelQuery: "Query",
  placeholderQuery: "Term or phrase…",
  labelMode: "Mode",
  modeAuto: "Auto",
  modeLiteral: "Exact phrase",
  modeHelpAuto:
    "Recommended for most people: ignores capital letters and accents, and tries a few smart variations so you are more likely to find a match.",
  modeHelpLiteral:
    "Looks for the exact phrase you typed (still ignoring capitals and accents). Use this when you want a precise wording, not a loose match.",
  btnSearch: "Search this page",
  btnClear: "Clear highlights",
  statusEnterQuery: "Enter a search term first.",
  statusNoTab: "No browser tab found to search. Open a website and try again.",
  statusSearching: "Searching…",
  statusRestricted:
    "This page cannot be used here (for example browser settings pages or the extension store).",
  statusNoMatches: "No matches for that text on the visible part of the page. Try another word or switch mode.",
  statusSearchFailed: "Something went wrong. Try again.",
  statusTalkFail: "Could not reach the page. Refresh the tab and try again.",
  statusCleared: "Highlights removed.",
  statusClearFail: "Could not remove highlights on this page.",
  resultsBannerCaption: "matches highlighted on the page",
  resultsBannerNoteHighlight: "Look for the colored marks in the page — same idea as the browser’s find tool.",
  resultsBannerNoteNoVisual: "Matches were found in the text, but the browser could not draw highlights here.",
  resultsMoreOnPage: "More occurrences exist on the page; only the first {{shown}} are highlighted.",
  navPrevAria: "Previous match",
  navNextAria: "Next match",
  navMatchOf: "Match {{n}} of {{total}}",
  versionPrefix: "Version",
  footerByPrefix: "by",
  footerGithub: "GitHub",
  footerSupport: "Support",
};

const ES: UiStrings = {
  languageLabel: "Idioma",
  subtitle: "Por AI4Context",
  ledeSearch:
    "Resalta en la web abierta lo que busques, parecido al buscador del propio navegador (Ctrl+F). Si no aparece nada, puede que el texto esté en una zona de la página a la que esta herramienta no llega.",
  labelQuery: "Consulta",
  placeholderQuery: "Término o frase…",
  labelMode: "Modo",
  modeAuto: "Auto",
  modeLiteral: "Frase exacta",
  modeHelpAuto:
    "Recomendado para la mayoría: ignora mayúsculas y tildes y prueba algunas variaciones para que sea más fácil encontrar el texto.",
  modeHelpLiteral:
    "Busca la frase tal como la escribes (pero sin distinguir mayúsculas ni tildes). Úsalo cuando quieras un texto concreto, no una búsqueda amplia.",
  btnSearch: "Buscar en esta página",
  btnClear: "Quitar resaltados",
  statusEnterQuery: "Escribe primero lo que quieres buscar.",
  statusNoTab: "No hay una pestaña del navegador donde buscar. Abre una web e inténtalo de nuevo.",
  statusSearching: "Buscando…",
  statusRestricted:
    "No se puede usar en esta página (por ejemplo páginas internas del navegador o la tienda de extensiones).",
  statusNoMatches:
    "No hay coincidencias en la parte visible de la página. Prueba otra palabra o cambia de modo.",
  statusSearchFailed: "Algo salió mal. Inténtalo de nuevo.",
  statusTalkFail: "No se pudo conectar con la página. Recarga la pestaña e inténtalo de nuevo.",
  statusCleared: "Resaltados quitados.",
  statusClearFail: "No se pudieron quitar los resaltados en esta página.",
  resultsBannerCaption: "coincidencias resaltadas en la página",
  resultsBannerNoteHighlight: "Mira los marcajes de color en la página — igual que con el buscador del navegador.",
  resultsBannerNoteNoVisual: "Hay coincidencias en el texto, pero el navegador no pudo mostrar resaltados aquí.",
  resultsMoreOnPage: "Hay más repeticiones en la página; solo se resaltan las primeras {{shown}}.",
  navPrevAria: "Coincidencia anterior",
  navNextAria: "Coincidencia siguiente",
  navMatchOf: "Coincidencia {{n}} de {{total}}",
  versionPrefix: "Versión",
  footerByPrefix: "por",
  footerGithub: "GitHub",
  footerSupport: "Apoyar",
};

export function stringsFor(lang: UILang): UiStrings {
  return lang === "es" ? ES : EN;
}

export async function getStoredLang(): Promise<UILang> {
  const { [UI_LANG_STORAGE_KEY]: raw } = await chrome.storage.sync.get({
    [UI_LANG_STORAGE_KEY]: "en",
  });
  return raw === "es" ? "es" : "en";
}

export async function setStoredLang(lang: UILang): Promise<void> {
  await chrome.storage.sync.set({ [UI_LANG_STORAGE_KEY]: lang });
}
