# First, let's update the item's stock
$updateStockPayload = @{
    qty = 10  # Setting stock to 10 units
} | ConvertTo-Json

# Use service token for authentication
$headers = @{
    "Authorization" = "Bearer items-service-secret-token-123"
    "Content-Type" = "application/json"
}

Write-Host "Updating item stock..."
try {
    $updateResponse = Invoke-RestMethod -Method Put -Uri "http://localhost:4002/api/items/68ab69eeb9908f15d9c46c27" -Headers $headers -Body $updateStockPayload
    Write-Host "Stock updated successfully:"
    $updateResponse | ConvertTo-Json
} catch {
    Write-Host "Error updating stock:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $result = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($result)
        $reader.BaseStream.Position = 0
        $reader.ReadToEnd()
    }
    exit
}

# Now let's create the order
$orderPayload = @{
    items = @(
        @{
            productId = "68ab69eeb9908f15d9c46c27"  # The mobile item
            quantity = 2  # Ordering 2 units
        }
    )
    shippingAddress = "123 Main St, Example City, EX 12345, USA"
} | ConvertTo-Json

Write-Host "`nCreating order..."
Write-Host "Payload: $orderPayload"

try {
    $response = Invoke-RestMethod -Method Post -Uri "http://localhost:4003/api/orders" -Headers $headers -Body $orderPayload
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
