# Get auth token for testing
$authBody = @{
    user = @{
        _id = "test123"
        email = "test@example.com"
        role = "admin"
    }
} | ConvertTo-Json

# First get a service token for authentication
$headers = @{
    "Authorization" = "Bearer items-service-secret-token-123"
    "Content-Type" = "application/json"
}

Write-Host "Getting auth token..."
$authResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:4004/api/auth/generate" -Headers $headers -Body $authBody
$token = $authResponse.token

Write-Host "Received token: $token"

# Create order payload
$orderPayload = @{
    items = @(
        @{
            productId = "68ab69eeb9908f15d9c46c27"  # This is the mobile item from your MongoDB
            quantity = 1
        }
    )
    shippingAddress = "123 Main St, Example City, EX 12345, USA"  # Note: shippingAddress is a string in the model
} | ConvertTo-Json -Depth 10

$orderHeaders = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "`nSending order request..."
Write-Host "URL: http://localhost:4003/api/orders"
Write-Host "Headers: $($orderHeaders | ConvertTo-Json)"
Write-Host "Payload: $orderPayload"

try {
    $response = Invoke-RestMethod -Method Post -Uri "http://localhost:4003/api/orders" -Headers $orderHeaders -Body $orderPayload
    Write-Host "`nOrder created successfully:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "`nError creating order:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $result = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($result)
        $reader.BaseStream.Position = 0
        $reader.ReadToEnd()
    }
}
