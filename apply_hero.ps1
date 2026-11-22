$newHero = Get-Content "hero_new.css" -Raw
$content = Get-Content "src/styles/global.css" -Raw

# Find and replace the Hero section
$pattern = '(?s)/\* -+ Hero -+ \*/\s*\.hero \{.*?@media \(max-width: 480px\) \{.*?  \.hero-trust-item \{ font-size: var\(--text-xs\); gap: var\(--space-1\); \}\s*  \.hero-trust-item svg \{ width: 16px; height: 16px; \}\s*  \}\}'
$content = $content -replace $pattern, $newHero
Set-Content "src/styles/global.css" $content
Write-Host "Hero updated"