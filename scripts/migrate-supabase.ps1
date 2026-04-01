# Supabase Database Migration Helper for Prisma
# Usage: .\scripts\migrate-supabase.ps1

$SUPABASE_PROJECT_ID = "kigogwwsmwcvhbtknwbd"
$SUPABASE_HOST = "db.$SUPABASE_PROJECT_ID.supabase.co"

Write-Host "`n--- AI Interview Prep Coach: Supabase Migration Utility ---" -ForegroundColor Cyan
Write-Host "This script will push your local Prisma schema to your Supabase cloud instance."

# Get Password securely
$password = Read-Host -Prompt "Enter your Supabase Database Password (from your initial project setup)" -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)

if (-not $plainPassword) {
    Write-Error "Password cannot be empty. Migration aborted."
    exit 1
}

# Construct Connection String
# Note: Using port 5432 for Direct Connection. Use 6543 for Pooling if needed.
$DATABASE_URL = "postgresql://postgres:$($plainPassword)@$($SUPABASE_HOST):5432/postgres"

Write-Host "`nConnecting to $SUPABASE_HOST..." -ForegroundColor Yellow

# Execute Prisma Push
$env:DATABASE_URL = $DATABASE_URL
cd backend
npx prisma db push

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] Your database schema is now live on Supabase!" -ForegroundColor Green
    Write-Host "You can now view your tables in the Supabase Table Editor."
} else {
    Write-Host "`n[ERROR] Migration failed. Check your password and network connection." -ForegroundColor Red
}
