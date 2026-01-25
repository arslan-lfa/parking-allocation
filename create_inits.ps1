# Define all folders that need __init__.py
$folders = @(
    "parking_system",
    "parking_system/api",
    "parking_system/api/routes",
    "parking_system/api/schemas",
    "parking_system/domain",
    "parking_system/engines",
    "parking_system/orchestrator",
    "parking_system/tests",
    "parking_system/tests/domain",
    "parking_system/tests/engines",
    "parking_system/tests/integration",
    "parking_system/tests/orchestrator"
)

foreach ($folder in $folders) {
    $filePath = Join-Path $folder "__init__.py"
    if (-Not (Test-Path $filePath)) {
        New-Item -ItemType File -Path $filePath -Force | Out-Null
        Write-Host "Created $filePath"
    } else {
        Write-Host "$filePath already exists"
    }
}
