# Ecoguard — Port-forward tunnel
# Jalankan di PowerShell. Biarkan tetap terbuka.
# Akses: http://localhost:4321 (frontend)

Write-Host "🌀 Ecoguard — Port-Forward Tunnels" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:4321" -ForegroundColor Green
Write-Host "   Handbook:  http://localhost:5173" -ForegroundColor Green
Write-Host "   Gateway:   http://localhost:4000" -ForegroundColor Green
Write-Host "   Twitter:   http://localhost:8000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop all tunnels`n" -ForegroundColor Yellow

$jobs = @(
    @{ Name = "frontend";  Args = @("port-forward", "-n", "ecoguard", "service/frontend", "4321:4321", "--address", "0.0.0.0") }
    @{ Name = "handbook";  Args = @("port-forward", "-n", "ecoguard", "service/handbook", "5173:80", "--address", "0.0.0.0") }
    @{ Name = "gateway";   Args = @("port-forward", "-n", "ecoguard", "service/gateway", "4000:4000", "--address", "0.0.0.0") }
    @{ Name = "twitter";   Args = @("port-forward", "-n", "ecoguard", "service/twitter-service", "8000:8000", "--address", "0.0.0.0") }
)

foreach ($job in $jobs) {
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "kubectl"
    $psi.Arguments = $job.Args -join " "
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $proc = [System.Diagnostics.Process]::Start($psi)
    Write-Host "  ✅ $($job.Name) tunnel started" -ForegroundColor Green
}

Write-Host "`n⏳ All tunnels running. Press any key to stop..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Cleanup
Get-Process -Name "kubectl" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "`n🛑 Tunnels stopped." -ForegroundColor Red
