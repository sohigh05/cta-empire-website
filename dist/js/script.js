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
   Pembukaan sentiasa mempunyai loading; pertukaran halaman melalui logo.
   Pemasa pembukaan dibatalkan apabila transisi baharu bermula.
   --------------------------------------------------------------------- */

let pemasaLoading;
let sedangBerpindah = false;
const kandunganAsas = document.querySelectorAll(
    "#kandungan, .header-utama, .bar-telefon, .footer-utama",
);

function kunciKandungan(kunci) {
    kandunganAsas.forEach(function (elemen) {
        elemen.inert = kunci;
    });
}

function tutupLoading() {
    window.clearTimeout(pemasaLoading);
    lapisanTransisi.classList.remove("bergerak");
    lapisanTransisi.classList.add("selesai");
    lapisanTransisi.setAttribute("aria-hidden", "true");
    kunciKandungan(false);
}

function mulaTransisi(teks) {
    window.clearTimeout(pemasaLoading);
    lapisanTransisi.querySelector(".teks-loading").textContent = teks;
    lapisanTransisi.classList.remove("selesai");
    lapisanTransisi.classList.add("dikawal", "bergerak");
    lapisanTransisi.setAttribute("aria-hidden", "false");
    kunciKandungan(true);
}

/* Storan hanya membezakan ketibaan transisi daripada pembukaan biasa.
   Ia tidak lagi menyembunyikan loading pada lawatan seterusnya. */
let tibaDaripadaTransisi = false;
try {
    const rekod = JSON.parse(sessionStorage.getItem("cta-destinasi") || "null");
    tibaDaripadaTransisi = Boolean(
        rekod && rekod.url === window.location.href && Date.now() - rekod.masa < 15000,
    );
    sessionStorage.removeItem("cta-destinasi");
} catch {
    // Jika storan disekat, loading biasa digunakan.
}

lapisanTransisi.classList.add("dikawal");
lapisanTransisi.setAttribute("aria-hidden", "false");
kunciKandungan(true);
/* Kurang gerakan mematikan animasi CSS, bukan memendekkan paparan logo. */
const masaLoading = tibaDaripadaTransisi ? 400 : 1800;
pemasaLoading = window.setTimeout(tutupLoading, masaLoading);

window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
        sedangBerpindah = false;
        tutupLoading();
    }
});

function namaHalaman(url) {
    /* Alamat folder GitHub Pages berakhir dengan / dan merujuk halaman utama. */
    const nama = url.pathname.split("/").pop() || "index";
    return nama.replace(/\.html$/, "");
}

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
        pautan.hasAttribute("download") ||
        pautan.hasAttribute("data-aliran")
    )
        return;

    const destinasi = new URL(pautan.href, window.location.href);
    const semasa = new URL(window.location.href);
    const halamanDikenali = ["index", "tentang", "it", "construction", "projek", "hubungi"];
    const halamanSama =
        namaHalaman(destinasi) === namaHalaman(semasa) && destinasi.search === semasa.search;

    /* Pautan ke sijil pada halaman semasa turut menutup pop-up dahulu. */
    if (destinasi.origin === semasa.origin && halamanSama) {
        const dialogSemasa = document.querySelector("#dialog-aliran");
        if (dialogSemasa.open) dialogSemasa.close();
    }
    if (
        destinasi.protocol !== semasa.protocol ||
        destinasi.origin !== semasa.origin ||
        !halamanDikenali.includes(namaHalaman(destinasi)) ||
        halamanSama
    )
        return;

    event.preventDefault();
    if (sedangBerpindah) return;
    sedangBerpindah = true;
    tutupMenu();
    const dialog = document.querySelector("#dialog-aliran");
    if (dialog.open) dialog.close();
    mulaTransisi("Membuka halaman seterusnya");

    window.setTimeout(function () {
        try {
            sessionStorage.setItem(
                "cta-destinasi",
                JSON.stringify({
                    url: destinasi.href,
                    masa: Date.now(),
                }),
            );
        } catch {
            // Navigasi masih diteruskan tanpa storan.
        }
        window.location.assign(destinasi.href);
    }, 1100);
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

const namaFail = namaHalaman(new URL(window.location.href)) + ".html";

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
