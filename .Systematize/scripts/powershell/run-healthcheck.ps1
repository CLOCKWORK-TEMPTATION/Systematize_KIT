#!/usr/bin/env pwsh
# فحص صحة وثائق feature — فحص آلي بدون AI
[CmdletBinding()]
param(
    [string]$Branch,
    [int]$Threshold = 70,
    [switch]$Json,
    [switch]$Help
)
$ErrorActionPreference = 'Stop'

if ($Help) {
    Write-Host "Usage: run-healthcheck.ps1 [-Branch <name>] [-Threshold <int>] [-Json] [-Help]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Branch <name>      اسم الـ feature (أو الحالي)"
    Write-Host "  -Threshold <int>    الحد الأدنى للنجاح (افتراضي: 70)"
    Write-Host "  -Json               إخراج JSON"
    Write-Host "  -Help               عرض المساعدة"
    exit 0
}

. "$PSScriptRoot/common.ps1"

$nodeArgs = @()
if ($Branch) { $nodeArgs += @('--branch', $Branch) }
if ($Threshold) { $nodeArgs += @('--threshold', $Threshold) }
if ($Json) { $nodeArgs += '--json' }
Invoke-NodeSyskitCommand -CommandName 'healthcheck' -NodeArgs $nodeArgs
exit $LASTEXITCODE
