param(
  [string]$DevHost = "127.0.0.1",
  [int]$Port = 4321
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$packageJson = Join-Path $projectRoot "package.json"

if (-not (Test-Path -LiteralPath $packageJson)) {
  throw "未找到 package.json：$packageJson"
}

$existingListener = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
if ($existingListener) {
  Write-Warning "端口 $Port 已被占用。请先关闭占用进程，或改用：.\start-dev.ps1 -Port 4322"
  $existingListener | Select-Object LocalAddress, LocalPort, OwningProcess | Format-Table
  exit 1
}

Write-Host ""
Write-Host "Starting Astro dev server..." -ForegroundColor Cyan
Write-Host "Project : $projectRoot"
Write-Host "Address : http://${DevHost}:$Port/"
Write-Host ""

Push-Location $projectRoot
try {
  & npm.cmd run dev -- --host $DevHost --port $Port
}
finally {
  Pop-Location
}
