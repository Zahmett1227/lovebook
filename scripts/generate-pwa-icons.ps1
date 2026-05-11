$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$pub = Join-Path $root 'public'
if (-not (Test-Path $pub)) { New-Item -ItemType Directory -Force -Path $pub | Out-Null }

function Write-Png([int]$w, [int]$h, [string]$name) {
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::FromArgb(253, 248, 243))
  $out = Join-Path $pub $name
  $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

Write-Png 180 180 'pwa-180.png'
Write-Png 192 192 'pwa-192.png'
Write-Png 512 512 'pwa-512.png'
Write-Png 1170 2532 'apple-splash.png'
Write-Host "Wrote PNGs to $pub"
