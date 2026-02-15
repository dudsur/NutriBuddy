# Start NutraBuddy app from repo root (works even if PATH is missing Git/Node)
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$nutrabuddy = Join-Path $root "nutrabuddy"
if (-not (Test-Path $nutrabuddy)) { Write-Error "nutrabuddy folder not found"; exit 1 }
Set-Location $nutrabuddy
& npm run dev
