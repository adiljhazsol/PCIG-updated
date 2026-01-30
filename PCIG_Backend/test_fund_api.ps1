$headers = @{
    "Accept" = "application/json"
    "Authorization" = "Bearer 1|UserTokenPlaceholder" # We might need a real token, but let's see if we get 401 vs 404
}
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/admin/funds/dashboard-data" -Headers $headers -Method Get -ErrorAction Stop
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Content: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)"
        $reader = New-Object System.IO.StreamReader $_.Exception.Response.GetResponseStream()
        Write-Host "Body: $($reader.ReadToEnd())"
    }
}
