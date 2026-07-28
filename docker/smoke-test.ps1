[CmdletBinding()]
param(
  [string]$BaseUrl = "http://127.0.0.1:8080",
  [string]$Token = $(if ($env:PASCAL_MCP_HTTP_TOKEN) { $env:PASCAL_MCP_HTTP_TOKEN } else { "magic-cabinet-dev" })
)

$ErrorActionPreference = "Stop"

for ($attempt = 1; $attempt -le 60; $attempt++) {
  try {
    Invoke-WebRequest -Uri "$BaseUrl/api/health" -UseBasicParsing -TimeoutSec 5 | Out-Null
    break
  }
  catch {
    if ($attempt -eq 60) {
      throw "Pascal did not become healthy at $BaseUrl within 120 seconds."
    }

    Start-Sleep -Seconds 2
  }
}

Invoke-WebRequest -Uri "$BaseUrl/live" -UseBasicParsing -TimeoutSec 20 | Out-Null

$headers = @{
  Accept = "application/json, text/event-stream"
  Authorization = "Bearer $Token"
}
$body = @{
  jsonrpc = "2.0"
  id = 1
  method = "initialize"
  params = @{
    protocolVersion = "2025-03-26"
    capabilities = @{}
    clientInfo = @{
      name = "magic-cabinet-docker-smoke"
      version = "1.0.0"
    }
  }
} | ConvertTo-Json -Depth 5 -Compress

Invoke-WebRequest `
  -Uri "$BaseUrl/mcp" `
  -Method Post `
  -Headers $headers `
  -ContentType "application/json" `
  -Body $body `
  -UseBasicParsing `
  -TimeoutSec 20 | Out-Null

Write-Host "Pascal editor and authenticated MCP are ready at $BaseUrl."
