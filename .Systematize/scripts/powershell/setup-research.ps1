#!/usr/bin/env pwsh
# Setup research document for a feature

[CmdletBinding()]
param(
    [string]$Branch,
    [switch]$Json,
    [switch]$Help
)

$ErrorActionPreference = 'Stop'

# Show help if requested
if ($Help) {
    Write-Output "Usage: ./setup-research.ps1 [-Branch <name>] [-Json] [-Help]"
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
Invoke-NodeSyskitCommand -CommandName 'setup-research' -NodeArgs $nodeArgs
exit $LASTEXITCODE
