/* =====================================================================
   CTA EMPIRE — INTERAKSI WEBSITE
   JavaScript biasa: tiada framework dan tiada proses binaan diperlukan.
   ===================================================================== */

"use strict";

const kurangGerakan = window.matchMedia("(prefers-reduced-motion: reduce)");
const lapisanTransisi = document.querySelector("#lapisan-transisi");
const menuMudahAlih = document.querySelector("#menu-mudah-alih");
const butangMenu = document.querySelector(".butang-menu");

/* 01. LOADING SCREEN DAN TRANSISI ANTARA HALAMAN
   Loading pembukaan hanya dipaparkan sekali bagi setiap sesi tab.
   --------------------------------------------------------------------- */

function bacaSesi(kunci) {
    try {
        return sessionStorage.getItem(kunci);
    } catch {
        return null;
    }
}

function simpanSesi(kunci, nilai) {
    try {
        sessionStorage.setItem(kunci, nilai);
    } catch {
        // Website masih berfungsi jika storan pelayar tidak tersedia.
    }
}

function tutupLoading() {
    lapisanTransisi.classList.remove("bergerak");
    lapisanTransisi.classList.add("selesai");
}

const pernahDibuka = bacaSesi("cta-pernah-dibuka");
const masaLoading = kurangGerakan.matches || pernahDibuka ? 80 : 1350;

window.setTimeout(tutupLoading, masaLoading);
simpanSesi("cta-pernah-dibuka", "ya");

/* Pelayar mungkin memulihkan halaman lama apabila butang Back digunakan. */
window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
        tutupLoading();
    }
});

document.addEventListener("click", function (event) {
    const pautan = event.target.closest("a[href]");

    if (
        !pautan ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        pautan.target === "_blank" ||
        pautan.hasAttribute("download")
    ) {
        return;
    }

    const destinasi = new URL(pautan.href, window.location.href);
    const halamanSemasa = new URL(window.location.href);

    /* Pautan luar, e-mel, WhatsApp dan pautan skrol kekal berfungsi asli. */
    if (
        destinasi.protocol !== halamanSemasa.protocol ||
        destinasi.origin !== halamanSemasa.origin ||
        !destinasi.pathname.endsWith(".html") ||
        (destinasi.pathname === halamanSemasa.pathname && destinasi.search === halamanSemasa.search)
    ) {
        return;
    }

    event.preventDefault();
    tutupMenu();

    if (kurangGerakan.matches) {
        window.location.assign(destinasi.href);
        return;
    }

    lapisanTransisi.classList.remove("selesai");
    lapisanTransisi.classList.add("bergerak");

    window.setTimeout(function () {
        window.location.assign(destinasi.href);
    }, 520);
});

/* 02. MENU TELEFON DAN TABLET
   Dialog mengurus fokus papan kekunci secara asli.
   --------------------------------------------------------------------- */

function bukaMenu() {
    if (!menuMudahAlih.open) {
        menuMudahAlih.showModal();
        document.body.classList.add("menu-terbuka");
        butangMenu.setAttribute("aria-expanded", "true");
    }
}

function tutupMenu() {
    if (menuMudahAlih.open) {
        menuMudahAlih.close();
    }

    document.body.classList.remove("menu-terbuka");
    butangMenu.setAttribute("aria-expanded", "false");
}

butangMenu.addEventListener("click", bukaMenu);
document.querySelector(".buka-kepakaran").addEventListener("click", bukaMenu);
document.querySelector(".butang-tutup").addEventListener("click", tutupMenu);
menuMudahAlih.addEventListener("close", tutupMenu);

menuMudahAlih.addEventListener("click", function (event) {
    if (event.target === menuMudahAlih) {
        const kotak = menuMudahAlih.getBoundingClientRect();

        if (event.clientX < kotak.left || event.clientX > kotak.right) {
            tutupMenu();
        }
    }
});

/* 03. PAUTAN HALAMAN SEMASA DAN TAHUN FOOTER
   --------------------------------------------------------------------- */

const namaFail = window.location.pathname.split("/").pop() || "index.html";

document.querySelectorAll("nav a[href]").forEach(function (pautan) {
    if (pautan.getAttribute("href") === namaFail) {
        pautan.setAttribute("aria-current", "page");
    }
});

document.querySelectorAll("[data-tahun]").forEach(function (elemen) {
    elemen.textContent = new Date().getFullYear();
});

/* 04. ANIMASI KEMUNCULAN SEMASA SKROL
   Kandungan kekal kelihatan jika IntersectionObserver tidak disokong.
   --------------------------------------------------------------------- */

if ("IntersectionObserver" in window && !kurangGerakan.matches) {
    document.documentElement.classList.add("animasi-aktif");

    const pemerhati = new IntersectionObserver(
        function (senarai) {
            senarai.forEach(function (item) {
                if (item.isIntersecting) {
                    item.target.classList.add("kelihatan");
                    pemerhati.unobserve(item.target);
                }
            });
        },
        {
            threshold: 0.1,
        },
    );

    document.querySelectorAll(".muncul").forEach(function (elemen) {
        pemerhati.observe(elemen);
    });
}

let skrolDijadualkan = false;

function kemasKiniKemajuan() {
    const jumlah = document.documentElement.scrollHeight - window.innerHeight;
    const kemajuan = jumlah > 0 ? window.scrollY / jumlah : 0;

    document.querySelector(".kemajuan-bacaan").style.transform =
        "scaleX(" + Math.min(1, Math.max(0, kemajuan)) + ")";

    skrolDijadualkan = false;
}

window.addEventListener(
    "scroll",
    function () {
        if (!skrolDijadualkan) {
            window.requestAnimationFrame(kemasKiniKemajuan);
            skrolDijadualkan = true;
        }
    },
    { passive: true },
);

kemasKiniKemajuan();

/* 05. TAB INTERAKTIF KEPAKARAN
   Kekunci anak panah, Home dan End turut boleh menukar pilihan.
   --------------------------------------------------------------------- */

const tabKepakaran = Array.from(document.querySelectorAll("[data-tab]"));

function pilihTab(tabDipilih) {
    tabKepakaran.forEach(function (tab) {
        const aktif = tab === tabDipilih;

        tab.setAttribute("aria-selected", String(aktif));
        tab.tabIndex = aktif ? 0 : -1;
        document.getElementById(tab.getAttribute("aria-controls")).hidden = !aktif;
    });
}

tabKepakaran.forEach(function (tab, indeks) {
    tab.addEventListener("click", function () {
        pilihTab(tab);
    });

    tab.addEventListener("keydown", function (event) {
        let indeksBaharu = indeks;

        if (event.key === "ArrowRight") indeksBaharu = (indeks + 1) % tabKepakaran.length;
        else if (event.key === "ArrowLeft")
            indeksBaharu = (indeks - 1 + tabKepakaran.length) % tabKepakaran.length;
        else if (event.key === "Home") indeksBaharu = 0;
        else if (event.key === "End") indeksBaharu = tabKepakaran.length - 1;
        else return;

        event.preventDefault();
        pilihTab(tabKepakaran[indeksBaharu]);
        tabKepakaran[indeksBaharu].focus();
    });
});
