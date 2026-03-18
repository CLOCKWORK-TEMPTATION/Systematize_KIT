#!/usr/bin/env pwsh
# Setup implementation plan for a feature

[CmdletBinding()]
param(
    [string]$Branch,
    [switch]$Json,
    [switch]$Help
)

$ErrorActionPreference = 'Stop'

# Show help if requested
if ($Help) {
    Write-Output "Usage: ./setup-plan.ps1 [-Branch <name>] [-Json] [-Help]"
    Write-Output "  -Branch   Target feature branch"
    Write-Output "  -Json     Output results in JSON format"
    Write-Output "  -Help     Show this help message"
    exit 0
}

# Load common functions
. "$PSScriptRoot/common.ps1"

# Get all paths and variables from common functions
$paths = Get-FeaturePathsEnv
$repoRoot = $paths.REPO_ROOT
$branchName = if ($Branch) { $Branch } else { $paths.CURRENT_BRANCH }
$featureDir = if ($Branch) { Get-FeatureDir -RepoRoot $repoRoot -Branch $Branch } else { $paths.FEATURE_DIR }
$paths = [PSCustomObject]@{
    REPO_ROOT = $repoRoot
    CURRENT_BRANCH = $branchName
    HAS_GIT = $paths.HAS_GIT
    FEATURE_DIR = $featureDir
    FEATURE_SYS = Join-Path $featureDir 'sys.md'
    IMPL_PLAN = Join-Path $featureDir 'plan.md'
    TASKS = Join-Path $featureDir 'tasks.md'
    RESEARCH = Join-Path $featureDir 'research.md'
}

# Check if we're on a proper feature branch (only for git repos)
if (-not (Test-FeatureBranch -Branch $paths.CURRENT_BRANCH -HasGit $paths.HAS_GIT)) { 
    exit 1 
}

# Ensure the feature directory exists
Ensure-Dir -Path $paths.FEATURE_DIR

# Copy plan template if it exists, otherwise note it or create empty file
$template = Resolve-Template -TemplateName 'plan-template' -RepoRoot $paths.REPO_ROOT
if ($template -and (Test-Path $template)) { 
    Copy-Item $template $paths.IMPL_PLAN -Force
    Write-Output "Copied plan template to $($paths.IMPL_PLAN)"
} else {
    Write-Warning "Plan template not found"
    # Create a basic plan file if template doesn't exist
    New-Item -ItemType File -Path $paths.IMPL_PLAN -Force | Out-Null
}

# Output results
if ($Json) {
    $result = [PSCustomObject]@{ 
        FEATURE_SYS = $paths.FEATURE_SYS
        IMPL_PLAN = $paths.IMPL_PLAN
        SPECS_DIR = $paths.FEATURE_DIR
        BRANCH = $paths.CURRENT_BRANCH
        HAS_GIT = $paths.HAS_GIT
    }
    $result | ConvertTo-Json -Compress
} else {
    Write-Output "FEATURE_SYS: $($paths.FEATURE_SYS)"
    Write-Output "IMPL_PLAN: $($paths.IMPL_PLAN)"
    Write-Output "SPECS_DIR: $($paths.FEATURE_DIR)"
    Write-Output "BRANCH: $($paths.CURRENT_BRANCH)"
    Write-Output "HAS_GIT: $($paths.HAS_GIT)"
}
