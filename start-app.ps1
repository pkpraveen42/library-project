Write-Host "Starting Library Purchase App..." -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Starting backend server..." -ForegroundColor Yellow
$backend = Start-Process -FilePath "npm" -ArgumentList "run", "server" -PassThru -WindowStyle Minimized

Write-Host "Step 2: Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "Step 3: Starting Angular frontend with proxy..." -ForegroundColor Yellow
Write-Host "Backend: http://localhost:3008" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:4200" -ForegroundColor Cyan
Write-Host ""
Write-Host "The proxy will handle all API requests automatically!" -ForegroundColor Green
Write-Host ""

npm run start:frontend

# Cleanup
Stop-Process -Id $backend.Id -ErrorAction SilentlyContinue
