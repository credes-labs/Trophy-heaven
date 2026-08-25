# Lossless-only image pass for apps/storefront/public.
# PNG:  oxipng 10.2 (no --alpha — that mutates transparent pixels)
# JPEG: jpegoptim without -m (Huffman + progressive; no requantize)
#
# Do not use pngquant / pingo default / imagemin-mozjpeg quality knobs —
# those are lossy. See docs/changes/L3/014-lossless-image-opt.md.

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Public = Join-Path $Root "apps\storefront\public"
$Cache = Join-Path $env:TEMP "legacy-image-opt"

function Get-Tool([string]$Name, [string]$Dir) {
  $found = Get-ChildItem -Path $Dir -Recurse -Filter $Name -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if ($found) { return $found.FullName }
  return $null
}

New-Item -ItemType Directory -Force -Path $Cache | Out-Null

$oxi = Get-Tool "oxipng.exe" (Join-Path $Cache "oxipng")
if (-not $oxi) {
  $zip = Join-Path $Cache "oxipng.zip"
  Invoke-WebRequest -UseBasicParsing -OutFile $zip `
    -Uri "https://github.com/oxipng/oxipng/releases/download/v10.2.0/oxipng-10.2.0-x86_64-pc-windows-msvc.zip"
  Expand-Archive -Path $zip -DestinationPath (Join-Path $Cache "oxipng") -Force
  $oxi = Get-Tool "oxipng.exe" (Join-Path $Cache "oxipng")
}

$jpg = Get-Tool "jpegoptim.exe" (Join-Path $Cache "jpegoptim")
if (-not $jpg) {
  $zip = Join-Path $Cache "jpegoptim.zip"
  Invoke-WebRequest -UseBasicParsing -OutFile $zip `
    -Uri "https://github.com/XhmikosR/jpegoptim-windows/releases/download/1.5.6-rel1/jpegoptim-1.5.6-rel1-win64-msvc-2022-mozjpeg331-static-ltcg.zip"
  Expand-Archive -Path $zip -DestinationPath (Join-Path $Cache "jpegoptim") -Force
  $jpg = Get-Tool "jpegoptim.exe" (Join-Path $Cache "jpegoptim")
}

Write-Host "oxipng: $oxi"
Write-Host "jpegoptim: $jpg"

& $oxi -o 4 --strip safe -i 0 --recursive $Public
if ($LASTEXITCODE -ne 0) { throw "oxipng failed" }

Get-ChildItem $Public -Recurse -Include *.jpg, *.jpeg | ForEach-Object {
  & $jpg --strip-all --all-progressive -- $_.FullName
  if ($LASTEXITCODE -ne 0) { throw "jpegoptim failed on $($_.FullName)" }
}

Write-Host "Lossless pass finished."
