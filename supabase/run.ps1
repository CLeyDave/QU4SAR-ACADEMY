function Invoke-SupaSQL($query) {
    $token = [System.Environment]::GetEnvironmentVariable("SUPABASE_ACCESS_TOKEN", "User")
    if (-not $token) { Write-Error "SUPABASE_ACCESS_TOKEN not set"; return }
    $headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }
    $body = @{ query = $query } | ConvertTo-Json
    try {
        $resp = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/rjfozwxszoucxgojxxjq/database/query" -Headers $headers -Method Post -Body $body
        return $resp
    } catch {
        Write-Error ("Supabase SQL error: " + $_.Exception.Message)
    }
}