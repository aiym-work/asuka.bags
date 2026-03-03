"use strict";

const I18N = (() => {
    const SUPPORTED = ["en", "ru", "kz"];
    let dict = null;
    let lang = "ru";

    function pickSystemLang(){
        const ls = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
        for (let i = 0; i < ls.length; i++){
            const v = String(ls[i] || "").toLowerCase();
            const base = v.split("-")[0];
            if (SUPPORTED.includes(base)) return base;
        }
        return "ru";
    }

    function getSavedLang(){
        try{
            const v = localStorage.getItem("lang");
            if (v && SUPPORTED.includes(v)) return v;
        }catch(_){}
        return null;
    }

    async function load(){
        if (dict) return;
        const r = await fetch("data/i18n.json", { cache: "no-cache" });
        if (!r.ok) throw new Error("i18n_fetch_failed");
        dict = await r.json();
    }

    function t(key){
        const a = dict?.[lang];
        if (!a) return "";
        const v = a[key];
        if (typeof v === "string") return v;
        return "";
    }

    function apply(){
        document.querySelectorAll("[data-i18n]").forEach(el => {
            el.textContent = t(el.dataset.i18n);
        });

        document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
            el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
        });
    }

    function setLang(next){
        if (!SUPPORTED.includes(next)) next = "ru";
        lang = next;
        try{ localStorage.setItem("lang", lang); }catch(_){}
        document.documentElement.lang = lang;
        document.querySelectorAll(".lang__btn").forEach(b => {
            b.classList.toggle("is-active", b.dataset.lang === lang);
        });
        apply();
        return lang;
    }

    function init(){
        const saved = getSavedLang();
        const chosen = saved || pickSystemLang() || "ru";
        setLang(chosen);

        document.addEventListener("click", (e) => {
            const b = e.target && e.target.closest && e.target.closest(".lang__btn");
            if (!b) return;
            setLang(b.dataset.lang);
            window.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
        }, { passive: true });
    }

    function current(){ return lang; }

    return { load, init, t, setLang, current };
})();
