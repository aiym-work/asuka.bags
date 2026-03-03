"use strict";

const Tilt = (() => {
    function bindCard(card){
        let raf = 0;

        function set(mx, my){
            card.style.setProperty("--mx", mx + "%");
            card.style.setProperty("--my", my + "%");
        }

        function onMove(e){
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width;
            const y = (e.clientY - r.top) / r.height;

            const rx = (0.5 - y) * 10;
            const ry = (x - 0.5) * 12;

            set(x * 100, y * 100);

            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                if (card.classList.contains("is-open")){
                    card.style.transform = "translateY(-2px) scale(1.01)";
                    return;
                }
                card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
            });
        }

        function onLeave(){
            if (raf) cancelAnimationFrame(raf);
            card.style.transform = "";
            set(40, 30);
        }

        card.addEventListener("pointermove", onMove, { passive: true });
        card.addEventListener("pointerleave", onLeave, { passive: true });
        set(40, 30);
    }

    return { bindCard };
})();
