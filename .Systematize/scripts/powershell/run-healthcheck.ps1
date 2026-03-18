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

$env_ = Get-FeaturePathsEnv
$repoRoot = $env_.REPO_ROOT
if ($Branch) {
    $featureDir = Get-FeatureDir -RepoRoot $repoRoot -Branch $Branch
    $branchName = $Branch
} else {
    $featureDir = $env_.FEATURE_DIR
    $branchName = $env_.CURRENT_BRANCH
}

if (-not (Test-Path $featureDir)) {
    Write-Error "❌ Feature directory not found: $featureDir"
    exit 1
}

$healthReport = Get-FeatureHealthReport -FeatureDir $featureDir -Threshold $Threshold

if ($Json) {
    [PSCustomObject]@{
        branch    = $branchName
        score     = $healthReport.score
        maxScore  = $healthReport.maxScore
        threshold = $healthReport.threshold
        status    = $healthReport.status
        checks    = $healthReport.checks
    } | ConvertTo-Json -Depth 5
} else {
    Write-Host ""
    Write-Host "🏥 Health Score: $($healthReport.score)/$($healthReport.maxScore)"
    Write-Host ""
    Write-Host "Checks:"
    foreach ($check in $healthReport.checks) {
        $icon = if ($check.Score -eq $check.MaxScore) { '✅' } elseif ($check.Score -ge 5) { '⚠️' } else { '❌' }
        Write-Host "  $icon $($check.Name): $($check.Score)/$($check.MaxScore)"
        foreach ($issue in $check.Issues) {
            Write-Host "     └── $issue"
        }
    }
    Write-Host ""
    $statusIcon = if ($healthReport.status -eq 'HEALTHY') { '✅' } else { '❌' }
    Write-Host "Status: $($healthReport.status) $statusIcon (threshold: $Threshold)"
}

if ($healthReport.score -lt $Threshold) { exit 1 }
