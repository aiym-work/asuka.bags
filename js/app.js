"use strict";

(async function main(){
    const yearEl = document.getElementById("year");
    yearEl.textContent = String(new Date().getFullYear());

    await I18N.load();
    I18N.init();

    const r = await fetch("data/site.json", { cache: "no-cache" });
    if (!r.ok) throw new Error("site_fetch_failed");
    const site = await r.json();

    const heroImg = document.getElementById("heroImg");
    const customOrderBtn = document.getElementById("customOrderBtn");
    const igLink = document.getElementById("igLink");
    const waLink = document.getElementById("waLink");
    const mailLink = document.getElementById("mailLink");
    const footerNote = document.getElementById("footerNote");

    function whatsappUrl(phone, text){
        const p = String(phone || "").replace(/[^\d]/g, "");
        const t = encodeURIComponent(String(text || ""));
        return `https://wa.me/${p}?text=${t}`;
    }

    function applySite(){
        const lang = I18N.current();

        const hero = site.hero?.[lang] || site.hero?.ru || {};
        heroImg.src = hero.image || "";
        heroImg.alt = hero.alt || "";

        const customMsg = site.whatsapp?.customOrderMessage?.[lang] || site.whatsapp?.customOrderMessage?.ru || "";
        customOrderBtn.href = whatsappUrl(site.whatsapp.phone, customMsg);

        igLink.href = site.links?.instagram || "#";
        waLink.href = whatsappUrl(site.whatsapp.phone, site.whatsapp?.genericMessage?.[lang] || site.whatsapp?.genericMessage?.ru || "");
        mailLink.href = `mailto:${site.links?.email || ""}`;
        footerNote.textContent = site.footerNote?.[lang] || site.footerNote?.ru || "";
    }

    Catalog.bind();
    Catalog.setSiteData(site);

    await Catalog.loadCatalog();

    applySite();
    Catalog.render();

    window.addEventListener("langchange", applySite, { passive: true });
})();
