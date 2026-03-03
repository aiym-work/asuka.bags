"use strict";

const Catalog = (() => {
    let site = null;
    let items = [];

    const els = {
        grid: null,
        empty: null,
        modal: null,
        modalImg: null,
        modalTitle: null,
        modalPrice: null,
        modalDesc: null,
        modalBuy: null
    };

    let active = null;

    function esc(s){
        return String(s).replace(/[&<>"']/g, c => (
            c === "&" ? "&amp;" :
            c === "<" ? "&lt;" :
            c === ">" ? "&gt;" :
            c === '"' ? "&quot;" : "&#39;"
        ));
    }

    function whatsappUrl(phone, text){
        const p = String(phone || "").replace(/[^\d]/g, "");
        const t = encodeURIComponent(String(text || ""));
        return `https://wa.me/${p}?text=${t}`;
    }

    function cardHTML(it){
        const title = esc(it.title || "");
        const price = esc(it.price || "");
        const img = esc(it.image || "");
        const src = img ? `assets/catalog/${img}` : "";

        return `
        <article class="card" role="button" tabindex="0" data-id="${esc(it.id || "")}">
        ${src
            ? `<img class="card__img" loading="lazy" decoding="async" src="${src}" alt="${title}">`
            : `<div class="card__img" role="img" aria-label="${title}"></div>`
        }
        <div class="card__body">
        <h3 class="card__title">${title}</h3>
        <span class="card__price">${price}</span>
        </div>
        </article>
        `.trim();
    }

    function render(){
        if (!items.length){
            els.grid.innerHTML = "";
            els.empty.hidden = false;
            return;
        }
        els.empty.hidden = true;

        let html = "";
        for (let i = 0; i < items.length; i++) html += cardHTML(items[i]);
        els.grid.innerHTML = html;

        els.grid.querySelectorAll(".card").forEach(card => Tilt.bindCard(card));
    }

    function openModal(it){
        active = it;

        const lang = I18N.current();
        const desc = (it.description && (it.description[lang] || it.description.ru)) || "";

        els.modalImg.src = it.image ? `assets/catalog/${it.image}` : "";
        els.modalImg.alt = it.title || "";
        els.modalTitle.textContent = it.title || "";
        els.modalPrice.textContent = it.price || "";
        els.modalDesc.textContent = desc;
        els.modalBuy.textContent = I18N.t("catalog.buy") || "Buy";

        els.modal.hidden = false;
        els.modal.setAttribute("aria-hidden", "false");
        document.documentElement.style.overflow = "hidden";
    }

    function closeModal(){
        els.modal.hidden = true;
        els.modal.setAttribute("aria-hidden", "true");
        document.documentElement.style.overflow = "";
        active = null;
    }

    function onGridClick(e){
        const card = e.target && e.target.closest && e.target.closest(".card");
        if (!card) return;
        const id = card.dataset.id;
        const it = items.find(x => String(x.id) === String(id));
        if (!it) return;
        openModal(it);
    }

    function onGridKey(e){
        if (e.key !== "Enter" && e.key !== " ") return;
        const card = e.target && e.target.closest && e.target.closest(".card");
        if (!card) return;
        e.preventDefault();
        const id = card.dataset.id;
        const it = items.find(x => String(x.id) === String(id));
        if (!it) return;
        openModal(it);
    }

    function onModalClick(e){
        const close = e.target && e.target.closest && e.target.closest("[data-modal-close]");
        if (close) closeModal();
    }

    function onModalKey(e){
        if (e.key === "Escape") closeModal();
    }

    function onBuy(){
        if (!active || !site) return;

        const lang = I18N.current();
        const tpl = site.whatsapp?.buyMessage?.[lang] || site.whatsapp?.buyMessage?.ru || "";
        const msg = tpl
        .replace("{title}", active.title || "")
        .replace("{price}", active.price || "");

        window.open(whatsappUrl(site.whatsapp.phone, msg), "_blank", "noopener");
    }

    async function loadCatalog(){
        const r = await fetch("data/catalog.json", { cache: "no-cache" });
        if (!r.ok) throw new Error("catalog_fetch_failed");
        const j = await r.json();
        if (!j || !Array.isArray(j.items)) throw new Error("catalog_invalid");
        items = j.items;
    }

    function bind(){
        els.grid = document.getElementById("grid");
        els.empty = document.getElementById("empty");

        els.modal = document.getElementById("modal");
        els.modalImg = document.getElementById("modalImg");
        els.modalTitle = document.getElementById("modalTitle");
        els.modalPrice = document.getElementById("modalPrice");
        els.modalDesc = document.getElementById("modalDesc");
        els.modalBuy = document.getElementById("modalBuy");

        els.grid.addEventListener("click", onGridClick);
        els.grid.addEventListener("keydown", onGridKey);

        els.modal.addEventListener("click", onModalClick);
        document.addEventListener("keydown", onModalKey);

        els.modalBuy.addEventListener("click", onBuy);

        window.addEventListener("langchange", () => {
            if (active) openModal(active);
        }, { passive: true });
    }

    function setSiteData(siteData){
        site = siteData;
    }

    return { bind, loadCatalog, render, setSiteData };
})();
