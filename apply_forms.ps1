$newForms = Get-Content "forms_new.css" -Raw
$content = Get-Content "src/styles/global.css" -Raw

# Find and replace the Forms section
$pattern = '(?s)/\* -+ Forms -+ \*/\s*\.form-group \{.*?\.form-checkbox input:focus-visible \{ outline: 2px solid var\(--color-border-focus\); outline-offset: 2px; border-radius: var\(--radius-sm\); \}\}'
$content = $content -replace $pattern, $newForms
Set-Content "src/styles/global.css" $content
Write-Host "Forms updated"