# =====================================================================
# CTA EMPIRE - PEMBUKA WEBSITE TEMPATAN
# Pelayan hanya menerima sambungan daripada laptop ini (127.0.0.1).
# Jalankan melalui "Buka CTA EMPIRE.cmd" di folder utama.
# =====================================================================

param(
    [switch]$TanpaPelayar
)

$ErrorActionPreference = 'Stop'
$alamatWebsite = 'http://127.0.0.1:4173/'
$folderWebsite = Join-Path $PSScriptRoot 'dist'
$pythonWebsite = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'

# Semak pelayan sedia ada supaya klik berulang tidak mencipta pelayan baharu.
function Test-WebsiteTempatan {
    try {
        $halamanWebsite = Invoke-WebRequest -Uri $alamatWebsite -UseBasicParsing -TimeoutSec 1
    }
    catch {
        return $false
    }

    if ($halamanWebsite.Content -notmatch 'CTA EMPIRE') {
        throw 'Port 4173 sedang digunakan oleh aplikasi lain. Tutup aplikasi tersebut dahulu.'
    }

    return $true
}

try {
    if (-not (Test-Path -LiteralPath (Join-Path $folderWebsite 'index.html'))) {
        throw 'Folder website tidak ditemui. Kekalkan folder dist bersama fail pembuka ini.'
    }

    if (-not (Test-WebsiteTempatan)) {
        if (-not (Test-Path -LiteralPath $pythonWebsite)) {
            throw 'Python tempatan tidak ditemui. Buka projek ini dalam Codex untuk menyediakan semula pelayan.'
        }

        # Tanda petikan melindungi laluan folder yang mengandungi ruang.
        $argumenWebsite = @(
            '-m', 'http.server', '4173',
            '--bind', '127.0.0.1',
            '--directory', ('"' + $folderWebsite + '"')
        )

        $pelayanWebsite = Start-Process -FilePath $pythonWebsite `
            -ArgumentList $argumenWebsite -WindowStyle Hidden -PassThru

        $websiteSedia = $false
        for ($cubaan = 0; $cubaan -lt 20; $cubaan++) {
            if (Test-WebsiteTempatan) {
                $websiteSedia = $true
                break
            }

            if ($pelayanWebsite.HasExited) {
                throw 'Pelayan website tidak dapat dimulakan. Sila semak sama ada port 4173 sedang digunakan.'
            }

            Start-Sleep -Milliseconds 200
        }

        if (-not $websiteSedia) {
            throw 'Website belum dapat dibuka. Sila cuba sekali lagi.'
        }
    }

    if (-not $TanpaPelayar) {
        # Website dibuka dalam pelayar pilihan pengguna pada laptop ini.
        Start-Process $alamatWebsite
    }

    Write-Output "Website tempatan sedia: $alamatWebsite"
}
catch {
    if ($TanpaPelayar) {
        throw
    }

    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show(
        $_.Exception.Message,
        'CTA EMPIRE',
        'OK',
        'Error'
    ) | Out-Null
    exit 1
}
