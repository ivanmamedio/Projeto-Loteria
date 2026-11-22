$new = Get-Content "cards_new.css" -Raw
$content = Get-Content "src/styles/global.css" -Raw
$pattern = '(?s)/\* -+ Cards -+ \*/\s*\.card \{.*?\.feature-link:hover svg \{ transform: translateX\(2px\); \}\}'
$content = $content -replace $pattern, (Get-Content "cards_new.css" -Raw)
Set-Content "src/styles/global.css" $new