# Database Update Script for Mental Health Platform
# This script applies all schema updates in the correct order

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Mental Health Platform - Database Update Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is available
Write-Host "Checking PostgreSQL connection..." -ForegroundColor Yellow
$psqlCheck = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlCheck) {
    Write-Host "ERROR: psql command not found. Please ensure PostgreSQL is installed and in your PATH." -ForegroundColor Red
    exit 1
}

# Load environment variables
$envFile = ".\.env"
if (Test-Path $envFile) {
    Write-Host "Loading environment variables from .env file..." -ForegroundColor Yellow
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)\s*$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
} else {
    Write-Host "WARNING: .env file not found. Make sure environment variables are set." -ForegroundColor Yellow
}

# Get database credentials
$DB_NAME = $env:DB_NAME
$DB_USER = $env:DB_USER
$DB_PASSWORD = $env:DB_PASSWORD
$DB_HOST = $env:DB_HOST
$DB_PORT = $env:DB_PORT

if (-not $DB_NAME) {
    Write-Host "Enter database name (default: mental_health_db): " -ForegroundColor Yellow -NoNewline
    $DB_NAME = Read-Host
    if ([string]::IsNullOrWhiteSpace($DB_NAME)) { $DB_NAME = "mental_health_db" }
}

if (-not $DB_USER) {
    Write-Host "Enter database user (default: postgres): " -ForegroundColor Yellow -NoNewline
    $DB_USER = Read-Host
    if ([string]::IsNullOrWhiteSpace($DB_USER)) { $DB_USER = "postgres" }
}

if (-not $DB_HOST) { $DB_HOST = "localhost" }
if (-not $DB_PORT) { $DB_PORT = "5432" }

Write-Host ""
Write-Host "Database Configuration:" -ForegroundColor Cyan
Write-Host "  Host: $DB_HOST" -ForegroundColor White
Write-Host "  Port: $DB_PORT" -ForegroundColor White
Write-Host "  Database: $DB_NAME" -ForegroundColor White
Write-Host "  User: $DB_USER" -ForegroundColor White
Write-Host ""

# Set PostgreSQL password environment variable
$env:PGPASSWORD = $DB_PASSWORD

# Function to execute SQL file
function Execute-SQLFile {
    param (
        [string]$FilePath,
        [string]$Description
    )
    
    Write-Host "Applying: $Description" -ForegroundColor Yellow
    Write-Host "  File: $FilePath" -ForegroundColor Gray
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "  SKIPPED: File not found" -ForegroundColor Yellow
        return $false
    }
    
    $result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $FilePath 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  SUCCESS" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ERROR: $result" -ForegroundColor Red
        return $false
    }
}

Write-Host "Starting database update process..." -ForegroundColor Cyan
Write-Host ""

# Define the order of SQL files to execute
$sqlFiles = @(
    @{Path=".\database\schema.sql"; Description="Core Database Schema"},
    @{Path=".\database\add_gamification.sql"; Description="Gamification Tables"},
    @{Path=".\database\add_streaks.sql"; Description="Streak Tracking System"},
    @{Path=".\database\add_challenges.sql"; Description="Challenges System"},
    @{Path=".\database\add_achievements.sql"; Description="Achievements System"},
    @{Path=".\database\add_levels.sql"; Description="Wellness Levels"},
    @{Path=".\database\add_activity_types.sql"; Description="Activity Types"},
    @{Path=".\database\add_support_context.sql"; Description="Support Context"},
    @{Path=".\database\add_assessment_fields.sql"; Description="Assessment Fields"},
    @{Path=".\database\add_user_profile_fields.sql"; Description="User Profile Fields"},
    @{Path=".\backend\database\migrations\001_add_onboarding_columns.sql"; Description="Onboarding Columns Migration"}
)

$successCount = 0
$failCount = 0
$skipCount = 0

foreach ($file in $sqlFiles) {
    $result = Execute-SQLFile -FilePath $file.Path -Description $file.Description
    if ($result -eq $true) {
        $successCount++
    } elseif ($result -eq $false -and (Test-Path $file.Path)) {
        $failCount++
    } else {
        $skipCount++
    }
    Write-Host ""
}

# Apply seed data if requested
Write-Host ""
Write-Host "Do you want to apply seed data? (Y/N): " -ForegroundColor Yellow -NoNewline
$applySeed = Read-Host

if ($applySeed -eq 'Y' -or $applySeed -eq 'y') {
    Write-Host ""
    $seedResult = Execute-SQLFile -FilePath ".\database\gamification_seed.sql" -Description "Gamification Seed Data"
    if ($seedResult) { $successCount++ } else { $failCount++ }
}

# Clear password from environment
$env:PGPASSWORD = ""

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Database Update Complete!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Successful: $successCount" -ForegroundColor Green
Write-Host "  Failed: $failCount" -ForegroundColor Red
Write-Host "  Skipped: $skipCount" -ForegroundColor Yellow
Write-Host ""

if ($failCount -gt 0) {
    Write-Host "Some migrations failed. Please review the errors above." -ForegroundColor Red
    exit 1
} else {
    Write-Host "All migrations applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Start the backend server: cd backend && npm run dev" -ForegroundColor White
    Write-Host "  2. Start the AI service: cd ai-services && python main.py" -ForegroundColor White
    Write-Host "  3. Start the frontend: cd frontend && npm run dev" -ForegroundColor White
    Write-Host ""
    exit 0
}
