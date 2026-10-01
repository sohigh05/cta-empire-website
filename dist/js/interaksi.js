/* =====================================================================
   CTA EMPIRE — INTERAKSI HALAMAN DALAMAN
   01. Cadangan jenis laman web
   02. Borang pertanyaan WhatsApp
   03. Galeri sijil, pembesaran dan kawalan paparan

   Nota: sekatan klik kanan bukan perlindungan screenshot sistem.
   Fail asal dan data peribadi tidak disertakan dalam folder website.
   ===================================================================== */

"use strict";

/* 01. CADANGAN JENIS LAMAN WEB
   --------------------------------------------------------------------- */

const cadanganWebsite = {
    korporat: {
        nama: "Laman web korporat",
        penerangan:
            "Menghimpunkan profil syarikat, perkhidmatan dan maklumat hubungan dalam satu laman web yang tersusun.",
    },
    tempahan: {
        nama: "Laman web tempahan",
        penerangan:
            "Memudahkan pelanggan memilih perkhidmatan dan mengemukakan permintaan tempahan mengikut keperluan operasi.",
    },
    landing: {
        nama: "Halaman promosi",
        penerangan:
            "Memfokuskan satu tawaran atau kempen dengan maklumat yang jelas serta tindakan pertanyaan yang mudah.",
    },
};

document.addEventListener("change", function (event) {
    const pilihan = event.target;
    if (!pilihan.matches('input[name$="matlamat"]')) return;

    const ruang = pilihan.closest(".pemilih-website");
    const cadangan = cadanganWebsite[pilihan.value];
    if (!ruang || !cadangan) return;

    ruang.querySelector('[id$="nama-cadangan"]').textContent = cadangan.nama;
    ruang.querySelector('[id$="teks-cadangan"]').textContent = cadangan.penerangan;
    ruang.querySelector('[id$="pautan-cadangan"]').href =
        "hubungi.html?servis=" + encodeURIComponent(pilihan.value);
});

/* 02. BORANG PERTANYAAN WHATSAPP
   Semua input digunakan sebagai teks, bukan HTML.
   Pengguna menyemak mesej dan menghantarnya sendiri melalui WhatsApp.
   --------------------------------------------------------------------- */

const borangHubungi = document.querySelector("#borang-hubungi");

if (borangHubungi) {
    const pilihanServis = document.querySelector("#servis");
    const servisDiminta = new URLSearchParams(window.location.search).get("servis");
    const semuaPilihan = Array.from(pilihanServis.options).map(function (pilihan) {
        return pilihan.value;
    });

    if (servisDiminta && semuaPilihan.includes(servisDiminta)) {
        pilihanServis.value = servisDiminta;
    }

    borangHubungi.querySelectorAll("[required]").forEach(function (medan) {
        medan.addEventListener("invalid", function () {
            if (medan.validity.valueMissing) {
                medan.setCustomValidity("Sila lengkapkan maklumat ini.");
            } else if (medan.validity.patternMismatch) {
                medan.setCustomValidity("Sila masukkan nombor telefon yang sah.");
            } else if (medan.validity.tooShort) {
                medan.setCustomValidity("Sila berikan penerangan sekurang-kurangnya 10 aksara.");
            }
        });

        medan.addEventListener("input", function () {
            medan.setCustomValidity("");
        });

        medan.addEventListener("change", function () {
            medan.setCustomValidity("");
        });
    });

    borangHubungi.addEventListener("submit", function (event) {
        event.preventDefault();

        const nama = document.querySelector("#nama").value.trim();
        const telefon = document.querySelector("#telefon").value.trim();
        const lokasi = document.querySelector("#lokasi").value.trim();
        const mesej = document.querySelector("#mesej").value.trim();
        const servis = pilihanServis.options[pilihanServis.selectedIndex].textContent;

        if (!nama || mesej.length < 10) {
            const medan = !nama
                ? document.querySelector("#nama")
                : document.querySelector("#mesej");

            medan.setCustomValidity("Sila masukkan maklumat yang lengkap.");
            medan.reportValidity();
            return;
        }

        const barisMesej = [
            "Salam sejahtera CTA EMPIRE.",
            "",
            "Saya ingin mendapatkan maklumat dan sebut harga bagi:",
            servis,
            "",
            "Nama: " + nama,
            "Telefon: " + telefon,
        ];

        if (lokasi) {
            barisMesej.push("Syarikat / lokasi: " + lokasi);
        }

        barisMesej.push("", "Keperluan projek:", mesej, "", "Terima kasih.");

        const teksMesej = barisMesej.join("\n");
        const semakanMesej = document.querySelector("#semakan-mesej");

        document.querySelector("#pratonton-mesej").textContent = teksMesej;
        document.querySelector("#buka-whatsapp").href =
            "https://wa.me/60129595515?text=" + encodeURIComponent(teksMesej);

        semakanMesej.hidden = false;
        semakanMesej.focus();
        semakanMesej.scrollIntoView({
            behavior: kurangGerakan.matches ? "instant" : "smooth",
            block: "nearest",
        });
    });

    /* Elakkan pautan WhatsApp lama selepas pengguna menukar butiran. */
    borangHubungi.addEventListener("input", function () {
        document.querySelector("#semakan-mesej").hidden = true;
    });
}

/* 03. GALERI SIJIL DAN PEMBESARAN
   Imej ialah pratonton berwatermark dengan data sensitif disamarkan.
   Tiada fungsi muat turun atau pautan PDF asal disediakan.
   --------------------------------------------------------------------- */

const senaraiSijil = [
    { fail: "ssm", tajuk: "Perakuan Pendaftaran Perniagaan SSM" },
    { fail: "spkk", tajuk: "Sijil Perolehan Kerja Kerajaan (SPKK)" },
    { fail: "ppk", tajuk: "Perakuan Pendaftaran Kontraktor (PPK)" },
    { fail: "tcc", tajuk: "Sijil Pematuhan Cukai (TCC)" },
    { fail: "pengurusan", tajuk: "Sijil Kecekapan Pengurusan" },
    { fail: "kursus", tajuk: "Sijil Penyertaan Kursus Kerja Jalan" },
];

const dialogSijil = document.querySelector("#dialog-sijil");

if (dialogSijil) {
    let indeksSijil = 0;
    let nilaiZum = 100;

    const imejSijil = document.querySelector("#imej-sijil");
    const kanvasSijil = document.querySelector(".kanvas-sijil");
    const ruangSijil = document.querySelector("#ruang-sijil");

    function tetapkanZum(nilai) {
        nilaiZum = Math.min(250, Math.max(100, nilai));
        kanvasSijil.style.setProperty("--zum-sijil", nilaiZum + "%");
        kanvasSijil.classList.toggle("dizum", nilaiZum > 100);
        document.querySelector("#nilai-zum").value = nilaiZum + "%";
        document.querySelector("#zum-kurang").disabled = nilaiZum === 100;
        document.querySelector("#zum-tambah").disabled = nilaiZum === 250;
    }

    function paparSijil(indeks) {
        indeksSijil = (indeks + senaraiSijil.length) % senaraiSijil.length;

        const sijil = senaraiSijil[indeksSijil];

        imejSijil.src = "assets/sijil/" + sijil.fail + ".jpg";
        imejSijil.alt = sijil.tajuk + ", pratonton berwatermark CTA EMPIRE";
        document.querySelector("#tajuk-sijil").textContent =
            indeksSijil + 1 + " / " + senaraiSijil.length + " — " + sijil.tajuk;

        tetapkanZum(100);
        ruangSijil.scrollTop = 0;
        ruangSijil.scrollLeft = 0;
    }

    document.querySelectorAll("[data-sijil]").forEach(function (butang) {
        butang.addEventListener("click", function () {
            paparSijil(Number(butang.dataset.sijil));
            dialogSijil.showModal();
            document.body.classList.add("menu-terbuka");
        });

        /* Mengurangkan tindakan simpan biasa pada kad pratonton. */
        butang.addEventListener("contextmenu", function (event) {
            event.preventDefault();
        });
    });

    document.querySelector(".tutup-sijil").addEventListener("click", function () {
        dialogSijil.close();
    });

    dialogSijil.addEventListener("close", function () {
        document.body.classList.remove("menu-terbuka");
    });

    document.querySelector("#sijil-sebelum").addEventListener("click", function () {
        paparSijil(indeksSijil - 1);
    });

    document.querySelector("#sijil-selepas").addEventListener("click", function () {
        paparSijil(indeksSijil + 1);
    });

    document.querySelector("#zum-tambah").addEventListener("click", function () {
        tetapkanZum(nilaiZum + 25);
    });

    document.querySelector("#zum-kurang").addEventListener("click", function () {
        tetapkanZum(nilaiZum - 25);
    });

    document.querySelector("#zum-asal").addEventListener("click", function () {
        tetapkanZum(100);
    });

    dialogSijil.addEventListener("contextmenu", function (event) {
        event.preventDefault();
    });

    dialogSijil.addEventListener("dragstart", function (event) {
        event.preventDefault();
    });

    dialogSijil.addEventListener("keydown", function (event) {
        if ((event.ctrlKey || event.metaKey) && ["s", "p"].includes(event.key.toLowerCase())) {
            event.preventDefault();
        }

        /* Escape dikendalikan secara asli oleh elemen dialog. */
        if (event.key === "ArrowRight" && nilaiZum === 100) {
            event.preventDefault();
            paparSijil(indeksSijil + 1);
        }

        if (event.key === "ArrowLeft" && nilaiZum === 100) {
            event.preventDefault();
            paparSijil(indeksSijil - 1);
        }
    });
}
