$headers = @{
    "Accept" = "application/json"
    "Content-Type" = "application/json"
}

$body = @{
    email = "admin@pcig.com"
    password = "password"
} | ConvertTo-Json

try {
    Write-Host "Logging in..."
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/auth/admin-login" -Headers $headers -Method Post -Body $body -ErrorAction Stop
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.token
    Write-Host "Token obtained."

    $authHeaders = @{
        "Accept" = "application/json"
        "Authorization" = "Bearer $token"
    }

    Write-Host "Testing /admin/funds/dashboard-data..."
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/admin/funds/dashboard-data" -Headers $authHeaders -Method Get -ErrorAction Stop
    Write-Host "Status: $($response.StatusCode)"
    # Write-Host "Content: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)"
        $reader = New-Object System.IO.StreamReader $_.Exception.Response.GetResponseStream()
        Write-Host "Body: $($reader.ReadToEnd())"
    }
}
