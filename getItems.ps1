$tokenResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:4004/api/auth/generate" -Headers @{"Content-Type"="application/json"} -Body '{"service":"test"}'
$token = $tokenResponse.token
Write-Host "Got token: $token"

$items = Invoke-RestMethod -Method Get -Uri "http://localhost:4002/api/items" -Headers @{"Authorization"="Bearer $token"}
$items | ConvertTo-Json -Depth 10
