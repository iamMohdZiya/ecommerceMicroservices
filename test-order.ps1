$tokenResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:4004/api/auth/generate" -Headers @{
    "Authorization" = "Bearer items-service-secret-token-123"
    "Content-Type" = "application/json"
} -Body (@{
    user = @{
        _id = "test123"
        email = "test@example.com"
        role = "admin"
    }
} | ConvertTo-Json)

$token = $tokenResponse.token
Write-Host "Got token: $token"

$orderPayload = @{
    items = @(
        @{
            productId = "68ac8bf12e1882ae02c4de33"
            quantity = 1
        }
    )
    shippingAddress = "123 Main St, City, Country"
} | ConvertTo-Json

Write-Host "`nCreating order with payload:`n$orderPayload"

$response = Invoke-RestMethod -Method Post -Uri "http://localhost/api/orders" -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
} -Body $orderPayload

Write-Host "`nResponse:"
$response | ConvertTo-Json -Depth 10
