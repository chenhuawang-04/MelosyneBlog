[CmdletBinding()]
param(
  [string]$Remote = "origin",
  [string]$ProxyHost = "127.0.0.1",
  [int]$ProxyPort = 7890,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$blogRoot = Join-Path $projectRoot "src\content\blog"
$proxyUrl = "http://${ProxyHost}:${ProxyPort}"

function Invoke-Git {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments,

    [switch]$UseProxy
  )

  function Quote-ProcessArgument {
    param(
      [AllowNull()]
      [string]$Value
    )

    if ($null -eq $Value) {
      return '""'
    }

    if ($Value.Length -eq 0) {
      return '""'
    }

    if ($Value -notmatch '[\s"]') {
      return $Value
    }

    $builder = New-Object System.Text.StringBuilder
    [void]$builder.Append('"')
    $slashCount = 0

    foreach ($char in $Value.ToCharArray()) {
      if ($char -eq '\') {
        $slashCount += 1
        continue
      }

      if ($char -eq '"') {
        [void]$builder.Append(('\' * ($slashCount * 2 + 1)))
        [void]$builder.Append('"')
        $slashCount = 0
        continue
      }

      if ($slashCount -gt 0) {
        [void]$builder.Append(('\' * $slashCount))
        $slashCount = 0
      }

      [void]$builder.Append($char)
    }

    if ($slashCount -gt 0) {
      [void]$builder.Append(('\' * ($slashCount * 2)))
    }

    [void]$builder.Append('"')
    return $builder.ToString()
  }

  $gitArgs = @("-c", "safe.directory=$projectRoot")
  if ($UseProxy) {
    $gitArgs += "-c"
    $gitArgs += "http.proxy=$proxyUrl"
    $gitArgs += "-c"
    $gitArgs += "https.proxy=$proxyUrl"
  }
  $gitArgs += $Arguments

  $stdoutFile = [System.IO.Path]::GetTempFileName()
  $stderrFile = [System.IO.Path]::GetTempFileName()
  $argumentLine = ($gitArgs | ForEach-Object { Quote-ProcessArgument $_ }) -join ' '

  try {
    $process = Start-Process `
      -FilePath "git.exe" `
      -ArgumentList $argumentLine `
      -WorkingDirectory $projectRoot `
      -NoNewWindow `
      -Wait `
      -PassThru `
      -RedirectStandardOutput $stdoutFile `
      -RedirectStandardError $stderrFile

    $exitCode = $process.ExitCode
    $stdoutText = if (Test-Path -LiteralPath $stdoutFile) { Get-Content -LiteralPath $stdoutFile -Raw } else { "" }
    $stderrText = if (Test-Path -LiteralPath $stderrFile) { Get-Content -LiteralPath $stderrFile -Raw } else { "" }

    if (-not [string]::IsNullOrWhiteSpace($stderrText)) {
      $warningLines = $stderrText -split "`r?`n"
      foreach ($warningLine in $warningLines) {
        $trimmed = $warningLine.Trim()
        if ($trimmed) {
          Write-Warning $trimmed
        }
      }
    }

    if ($exitCode -ne 0) {
      throw (($stderrText.Trim() + "`n" + $stdoutText.Trim()).Trim())
    }

    if ([string]::IsNullOrWhiteSpace($stdoutText)) {
      return @()
    }

    return @(($stdoutText -split "`r?`n") | Where-Object { $_ -ne "" })
  }
  finally {
    Remove-Item -LiteralPath $stdoutFile, $stderrFile -ErrorAction SilentlyContinue
  }
}

function Ensure-SafeDirectory {
  Invoke-Git -Arguments "rev-parse", "--show-toplevel" | Out-Null
}

function Get-NewMarkdownFiles {
  $files = New-Object System.Collections.Generic.List[string]

  $untracked = Invoke-Git -Arguments "ls-files", "--others", "--exclude-standard", "--", "src/content/blog"
  $stagedAdded = Invoke-Git -Arguments "diff", "--cached", "--name-only", "--diff-filter=A", "--", "src/content/blog"

  foreach ($path in @($untracked + $stagedAdded)) {
    $text = [string]$path
    if ($text -match '\.md$' -and $text -notmatch '\.mdx$') {
      $files.Add($text.Trim())
    }
  }

  return @($files | Sort-Object -Unique)
}

function Get-AheadCount {
  param(
    [Parameter(Mandatory = $true)]
    [string]$RemoteName,

    [Parameter(Mandatory = $true)]
    [string]$BranchName
  )

  $remoteRef = "{0}/{1}" -f $RemoteName, $BranchName
  $countOutput = Invoke-Git -Arguments "rev-list", "--count", ("{0}..{1}" -f $remoteRef, $BranchName)
  if ($countOutput.Count -eq 0) {
    return 0
  }

  return [int]([string]($countOutput | Select-Object -First 1)).Trim()
}

function Get-FrontmatterTitle {
  param(
    [Parameter(Mandatory = $true)]
    [string]$RelativePath
  )

  $fullPath = Join-Path $projectRoot $RelativePath
  if (-not (Test-Path -LiteralPath $fullPath)) {
    return [System.IO.Path]::GetFileNameWithoutExtension($RelativePath)
  }

  $lines = Get-Content -LiteralPath $fullPath -Encoding UTF8
  foreach ($line in $lines) {
    if ($line -match '^title:\s*(.+)$') {
      $raw = ($Matches[1]).Trim()
      $raw = $raw.Trim("'")
      $raw = $raw.Trim('"')
      if (-not [string]::IsNullOrWhiteSpace($raw)) {
        return $raw
      }
    }
  }

  return [System.IO.Path]::GetFileNameWithoutExtension($RelativePath)
}

function New-CommitMessage {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Titles
  )

  $dateText = Get-Date -Format "yyyy-MM-dd"
  $cleanTitles = New-Object System.Collections.Generic.List[string]

  foreach ($title in $Titles) {
    if (-not [string]::IsNullOrWhiteSpace($title) -and -not $cleanTitles.Contains($title)) {
      $cleanTitles.Add($title)
    }
  }

  if ($cleanTitles.Count -eq 0) {
    return "blog: add new posts ($dateText)"
  }

  if ($cleanTitles.Count -eq 1) {
    return ("blog: add post {0} ({1})" -f $cleanTitles[0], $dateText)
  }

  $previewCount = [Math]::Min(3, $cleanTitles.Count)
  $preview = @()
  for ($i = 0; $i -lt $previewCount; $i++) {
    $preview += $cleanTitles[$i]
  }

  if ($cleanTitles.Count -le 3) {
    return ("blog: add posts {0} ({1})" -f ($preview -join " / "), $dateText)
  }

  return ("blog: add {0} posts {1} ... ({2})" -f $cleanTitles.Count, ($preview -join " / "), $dateText)
}

if (-not (Test-Path -LiteralPath $blogRoot)) {
  throw ("Blog content directory not found: {0}" -f $blogRoot)
}

Push-Location $projectRoot
try {
  Ensure-SafeDirectory

  $branchOutput = Invoke-Git -Arguments "rev-parse", "--abbrev-ref", "HEAD"
  $branch = ([string]($branchOutput | Select-Object -First 1)).Trim()
  if ([string]::IsNullOrWhiteSpace($branch) -or $branch -eq "HEAD") {
    throw "The repository is not currently on a valid branch."
  }

  $remoteOutput = Invoke-Git -Arguments "remote", "get-url", $Remote
  $remoteUrl = ([string]($remoteOutput | Select-Object -First 1)).Trim()
  if ([string]::IsNullOrWhiteSpace($remoteUrl)) {
    throw ("Remote not found: {0}" -f $Remote)
  }

  $newFiles = Get-NewMarkdownFiles
  if ($newFiles.Count -eq 0) {
    $aheadCount = Get-AheadCount -RemoteName $Remote -BranchName $branch
    if ($aheadCount -gt 0) {
      Write-Host ("No new .md files were found, but branch {0} is ahead of {1}/{0} by {2} commit(s)." -f $branch, $Remote, $aheadCount) -ForegroundColor Yellow
      Write-Host ("Pending push target: {0}" -f $remoteUrl) -ForegroundColor Green
      Write-Host ("Proxy: {0}" -f $proxyUrl) -ForegroundColor Green
      Write-Host ""

      if ($DryRun) {
        Write-Host "DryRun mode: pending commits were not pushed." -ForegroundColor Yellow
        exit 0
      }

      $pushArgs = @("push", $Remote, $branch)
      Invoke-Git -UseProxy -Arguments $pushArgs | Out-Null
      Write-Host "Pending commits pushed successfully." -ForegroundColor Cyan
      exit 0
    }

    Write-Host "No new .md files were found under src/content/blog." -ForegroundColor Yellow
    exit 0
  }

  $titles = @()
  foreach ($file in $newFiles) {
    $titles += Get-FrontmatterTitle -RelativePath $file
  }
  $commitMessage = New-CommitMessage -Titles $titles

  Write-Host ""
  Write-Host "New markdown posts to commit:" -ForegroundColor Cyan
  foreach ($file in $newFiles) {
    Write-Host ("  + {0}" -f $file)
  }
  Write-Host ""
  Write-Host ("Commit message: {0}" -f $commitMessage) -ForegroundColor Green
  Write-Host ("Branch: {0}" -f $branch) -ForegroundColor Green
  Write-Host ("Remote URL: {0}" -f $remoteUrl) -ForegroundColor Green
  Write-Host ("Proxy: {0}" -f $proxyUrl) -ForegroundColor Green
  Write-Host ""

  if ($DryRun) {
    Write-Host "DryRun mode: git add / commit / push were not executed." -ForegroundColor Yellow
    exit 0
  }

  $addArgs = @("add", "--") + $newFiles
  $commitArgs = @("commit", "--only", "-m", $commitMessage, "--") + $newFiles
  $pushArgs = @("push", $Remote, $branch)

  Invoke-Git -Arguments $addArgs | Out-Null
  Invoke-Git -Arguments $commitArgs | Out-Null
  Invoke-Git -UseProxy -Arguments $pushArgs | Out-Null

  Write-Host "Commit and push completed." -ForegroundColor Cyan
}
finally {
  Pop-Location
}
