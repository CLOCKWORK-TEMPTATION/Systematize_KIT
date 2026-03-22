#!/usr/bin/env pwsh

[CmdletBinding()]
param(
    [string]$TargetPath = (Get-Location).Path,
    [string]$Platforms,
    [switch]$Force,
    [switch]$Json,
    [switch]$Help
)

$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$bootstrapScript = Join-Path $scriptRoot '.Systematize/scripts/powershell/init-syskit.ps1'

if (-not (Test-Path -LiteralPath $bootstrapScript)) {
    Write-Error "Systematize bootstrap script not found: $bootstrapScript"
    exit 1
}

$invokeArgs = @{
    TargetPath = $TargetPath
}

if ($Platforms) {
    $invokeArgs.Platforms = $Platforms
}

if ($Force) {
    $invokeArgs.Force = $true
}

if ($Json) {
    $invokeArgs.Json = $true
}

if ($Help) {
    $invokeArgs.Help = $true
}

& $bootstrapScript @invokeArgs
exit $LASTEXITCODE
