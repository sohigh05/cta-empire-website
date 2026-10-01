/* =====================================================================
   CTA EMPIRE — DUA ALIRAN PERKHIDMATAN
   Kandungan pop-up menggunakan halaman IT dan Construction yang sama.
   Maklumat hanya perlu disunting sekali dalam fail HTML bidang berkenaan.
   ===================================================================== */

"use strict";

const dialogAliran = document.querySelector("#dialog-aliran");
const ruangAliran = document.querySelector("#kandungan-aliran");
const tajukAliran = document.querySelector("#tajuk-aliran");
const simpananAliran = new Map();
let sedangMembukaAliran = false;
let pencetusAliran;

/* 01. TANDAKAN PAUTAN IT DAN CONSTRUCTION
   Pautan asli kekal tersedia bagi tab baharu dan jika JavaScript dimatikan.
   Pembukaan terus melalui fail tempatan menggunakan halaman asal.
   --------------------------------------------------------------------- */

if (window.location.protocol !== "file:" && typeof dialogAliran.showModal === "function") {
    document
        .querySelectorAll('a[href="it.html"], a[href="construction.html"]')
        .forEach(function (pautan) {
            pautan.dataset.aliran = pautan.getAttribute("href").replace(".html", "");
            pautan.setAttribute("aria-haspopup", "dialog");
            pautan.setAttribute("aria-controls", "dialog-aliran");
        });
}

/* 02. BACA KANDUNGAN DAN ELAKKAN ID BERULANG
   Hanya kandungan main daripada dua fail milik website ini digunakan.
   --------------------------------------------------------------------- */

async function bacaAliran(bidang) {
    if (simpananAliran.has(bidang)) return simpananAliran.get(bidang).cloneNode(true);

    const pengawal = new AbortController();
    const hadMasa = window.setTimeout(function () {
        pengawal.abort();
    }, 8000);
    try {
        const respons = await fetch(bidang + ".html", { signal: pengawal.signal });
        if (!respons.ok) throw new Error("Halaman tidak dapat dibaca");
        const dokumen = new DOMParser().parseFromString(await respons.text(), "text/html");
        const kandungan = dokumen.querySelector("main");
        if (!kandungan) throw new Error("Kandungan tidak tersedia");

        const fragmen = document.createDocumentFragment();
        Array.from(kandungan.childNodes).forEach(function (elemen) {
            fragmen.append(elemen);
        });
        fragmen.querySelectorAll("script").forEach(function (elemen) {
            elemen.remove();
        });
        fragmen.querySelectorAll('input[name="matlamat"]').forEach(function (elemen) {
            elemen.name = "aliran-matlamat";
        });
        fragmen.querySelectorAll("h1").forEach(function (elemen) {
            const tajuk = document.createElement("h2");
            tajuk.append(...elemen.childNodes);
            elemen.replaceWith(tajuk);
        });
        const idAsal = new Map();
        fragmen.querySelectorAll("[id]").forEach(function (elemen) {
            idAsal.set(elemen.id, "aliran-" + elemen.id);
            elemen.id = "aliran-" + elemen.id;
        });
        fragmen.querySelectorAll("*").forEach(function (elemen) {
            ["for", "aria-labelledby", "aria-describedby", "aria-controls"].forEach(
                function (atribut) {
                    if (elemen.hasAttribute(atribut)) {
                        elemen.setAttribute(
                            atribut,
                            elemen
                                .getAttribute(atribut)
                                .split(" ")
                                .map(function (id) {
                                    return idAsal.get(id) || id;
                                })
                                .join(" "),
                        );
                    }
                },
            );
            const href = elemen.getAttribute("href");
            if (href && href.startsWith("#") && idAsal.has(href.slice(1))) {
                elemen.setAttribute("href", "#" + idAsal.get(href.slice(1)));
            }
        });
        simpananAliran.set(bidang, fragmen.cloneNode(true));
        return fragmen;
    } finally {
        window.clearTimeout(hadMasa);
    }
}

/* 03. LOGO, PEMBUKAAN POP-UP DAN PEMULIHAN FOKUS
   Logo muncul dahulu, diikuti dialog yang boleh ditutup dengan Escape.
   --------------------------------------------------------------------- */

document.addEventListener("click", async function (event) {
    const pautan = event.target.closest("a[data-aliran]");
    if (
        !pautan ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
    )
        return;

    event.preventDefault();
    if (sedangMembukaAliran || sedangBerpindah) return;
    sedangMembukaAliran = true;
    pencetusAliran = pautan;
    const bidang = pautan.dataset.aliran;
    tutupMenu();
    mulaTransisi(bidang === "it" ? "Membuka CTA IT" : "Membuka CTA Construction");
    const tempohLogo = new Promise(function (selesai) {
        window.setTimeout(selesai, 1100);
    });

    try {
        const [kandungan] = await Promise.all([bacaAliran(bidang), tempohLogo]);
        ruangAliran.replaceChildren(kandungan);
    } catch {
        await tempohLogo;
        const kotak = document.createElement("div");
        kotak.className = "ralat-aliran";
        const teks = document.createElement("p");
        teks.textContent =
            "Maklumat belum dapat dimuatkan. Sila buka halaman perkhidmatan untuk meneruskan.";
        const sandaran = document.createElement("a");
        sandaran.href = bidang + ".html";
        sandaran.className = "butang butang-emas";
        sandaran.textContent = "Buka halaman perkhidmatan";
        kotak.append(teks, sandaran);
        ruangAliran.replaceChildren(kotak);
    } finally {
        tutupLoading();
        sedangMembukaAliran = false;
    }

    tajukAliran.textContent = bidang === "it" ? "CTA IT" : "CTA CONSTRUCTION";
    dialogAliran.showModal();
    document.body.classList.add("aliran-terbuka");
    ruangAliran.scrollTop = 0;
    dialogAliran.querySelector(".tutup-aliran").focus({ preventScroll: true });
});

dialogAliran.querySelector(".tutup-aliran").addEventListener("click", function () {
    dialogAliran.close();
});

dialogAliran.addEventListener("close", function () {
    document.body.classList.remove("aliran-terbuka");
    if (pencetusAliran && !sedangBerpindah) {
        const pencetusDalamMenu = pencetusAliran.closest("#menu-mudah-alih");
        (pencetusDalamMenu ? butangMenu : pencetusAliran).focus({ preventScroll: true });
    }
});

dialogAliran.addEventListener("click", function (event) {
    if (event.target !== dialogAliran) return;
    const kotak = dialogAliran.getBoundingClientRect();
    if (
        event.clientX < kotak.left ||
        event.clientX > kotak.right ||
        event.clientY < kotak.top ||
        event.clientY > kotak.bottom
    )
        dialogAliran.close();
});
