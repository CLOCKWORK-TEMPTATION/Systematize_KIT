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

$nodeArgs = @()
if ($Branch) { $nodeArgs += @('--branch', $Branch) }
if ($Json) { $nodeArgs += '--json' }
Invoke-NodeSyskitCommand -CommandName 'setup-plan' -NodeArgs $nodeArgs
exit $LASTEXITCODE

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

$constitutionStatus = Get-ConstitutionStatus -RepoRoot $repoRoot
if ($constitutionStatus.status -ne 'complete') {
    Write-Output "ERROR: The constitution gate is not satisfied."
    Write-Output "Run /syskit.constitution and complete it before /syskit.plan."
    exit 1
}

$researchStatus = Get-DocumentCompletionStatus -FilePath $paths.RESEARCH
if ($researchStatus.status -ne 'complete') {
    Write-Output "ERROR: research.md is missing or incomplete in $($paths.FEATURE_DIR)"
    Write-Output "Run /syskit.research and complete it before /syskit.plan."
    exit 1
}

# Copy plan template if it exists, otherwise note it or create empty file
$template = Resolve-Template -TemplateName 'plan-template' -RepoRoot $paths.REPO_ROOT
if ($template -and (Test-Path $template)) { 
    Copy-Item $template $paths.IMPL_PLAN -Force
    if (-not $Json) {
        Write-Output "Copied plan template to $($paths.IMPL_PLAN)"
    }
} else {
    if (-not $Json) {
        Write-Warning "Plan template not found"
    }
    # Create a basic plan file if template doesn't exist
    New-Item -ItemType File -Path $paths.IMPL_PLAN -Force | Out-Null
}

# Output results
if ($Json) {
    $result = [PSCustomObject]@{ 
        FEATURE_SYS = $paths.FEATURE_SYS
        IMPL_PLAN = $paths.IMPL_PLAN
        FEATURES_DIR = $paths.FEATURE_DIR
        AMINOOOF_DIR = $paths.FEATURE_DIR
        BRANCH = $paths.CURRENT_BRANCH
        HAS_GIT = $paths.HAS_GIT
    }
    $result | ConvertTo-Json -Compress
} else {
    Write-Output "FEATURE_SYS: $($paths.FEATURE_SYS)"
    Write-Output "IMPL_PLAN: $($paths.IMPL_PLAN)"
    Write-Output "FEATURES_DIR: $($paths.FEATURE_DIR)"
    Write-Output "AMINOOOF_DIR: $($paths.FEATURE_DIR)"
    Write-Output "BRANCH: $($paths.CURRENT_BRANCH)"
    Write-Output "HAS_GIT: $($paths.HAS_GIT)"
}
