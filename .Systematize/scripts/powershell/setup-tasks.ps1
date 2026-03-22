#!/usr/bin/env pwsh
# Setup tasks document for a feature

[CmdletBinding()]
param(
    [string]$Branch,
    [switch]$Json,
    [switch]$Help
)

$ErrorActionPreference = 'Stop'

# Show help if requested
if ($Help) {
    Write-Output "Usage: ./setup-tasks.ps1 [-Branch <name>] [-Json] [-Help]"
    Write-Output "  -Branch   Target feature branch"
    Write-Output "  -Json     Output results in JSON format"
    Write-Output "  -Help     Show this help message"
    exit 0
}

# Load common functions
. "$PSScriptRoot/common.ps1"

# Get all paths and variables from common functions
$paths = Get-FeaturePathsEnv -Mutating -EnsureExists
$repoRoot = $paths.REPO_ROOT
$branchName = if ($Branch) { $Branch } else { $paths.CURRENT_BRANCH }
$featureDir = if ($Branch) { Get-FeatureDir -RepoRoot $repoRoot -Branch $Branch -Mutating -EnsureExists } else { $paths.FEATURE_DIR }
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

if (-not (Test-Path $paths.FEATURE_SYS -PathType Leaf)) {
    Write-Output "ERROR: sys.md not found in $($paths.FEATURE_DIR)"
    Write-Output "Run /syskit.systematize first to create the governing sys document."
    exit 1
}

$planStatus = Get-DocumentCompletionStatus -FilePath $paths.IMPL_PLAN
if ($planStatus.status -ne 'complete') {
    Write-Output "ERROR: plan.md is missing or incomplete in $($paths.FEATURE_DIR)"
    Write-Output "Run /syskit.plan and complete it before /syskit.tasks."
    exit 1
}

# Copy tasks template if it exists, otherwise note it or create empty file
$template = Resolve-Template -TemplateName 'tasks-template' -RepoRoot $paths.REPO_ROOT
if ($template -and (Test-Path $template)) {
    Copy-Item $template $paths.TASKS -Force
    if (-not $Json) {
        Write-Output "Copied tasks template to $($paths.TASKS)"
    }
} else {
    if (-not $Json) {
        Write-Warning "Tasks template not found"
    }
    # Create a basic tasks file if template doesn't exist
    New-Item -ItemType File -Path $paths.TASKS -Force | Out-Null
}

# Output results
if ($Json) {
    $result = [PSCustomObject]@{
        FEATURE_SYS = $paths.FEATURE_SYS
        TASKS = $paths.TASKS
        AMINOOOF_DIR = $paths.FEATURE_DIR
        BRANCH = $paths.CURRENT_BRANCH
        HAS_GIT = $paths.HAS_GIT
    }
    $result | ConvertTo-Json -Compress
} else {
    Write-Output "FEATURE_SYS: $($paths.FEATURE_SYS)"
    Write-Output "TASKS: $($paths.TASKS)"
    Write-Output "AMINOOOF_DIR: $($paths.FEATURE_DIR)"
    Write-Output "BRANCH: $($paths.CURRENT_BRANCH)"
    Write-Output "HAS_GIT: $($paths.HAS_GIT)"
}
