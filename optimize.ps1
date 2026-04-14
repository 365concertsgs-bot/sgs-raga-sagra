$file = "src/App.jsx"
$content = Get-Content $file -Raw

# Add top-right logo
$content = $content -replace '({\/\* 🪔 SWAMIJI LOGO \*\/})(\s+<img\s+src="/swamiji-keyboard.png"\s+alt="Swamiji"\s+style=\{styles\.logo\})', '{/* 🪔 SWAMIJI LOGOS - TOP LEFT AND TOP RIGHT */}$2$2'

# Update logo styles
if ($content -notcontains 'logoTopLeft') {
    $oldLogoStyle = '  logo: {'
    $newLogoStyle = @'
  logoTopLeft: {
    position: "absolute",
    top: "clamp(10px, 2vw, 30px)",
    left: "clamp(10px, 2vw, 30px)",
    height: "clamp(40px, 8vw, 100px)",
    width: "auto",
    zIndex: 20,
    background: "transparent",
    mixBlendMode: "screen",
    opacity: 0.9,
    transition: "opacity 0.3s ease",
  },

  logoTopRight: {
    position: "absolute",
    top: "clamp(10px, 2vw, 30px)",
    right: "clamp(10px, 2vw, 30px)",
    height: "clamp(40px, 8vw, 100px)",
    width: "auto",
    zIndex: 20,
    background: "transparent",
    mixBlendMode: "screen",
    opacity: 0.9,
    transform: "scaleX(-1)",
    transition: "opacity 0.3s ease",
  },

  logo: {
'@
    $content = $content -replace [regex]::Escape($oldLogoStyle), $newLogoStyle
}

$content | Set-Content $file -Force
Write-Host "✓ Optimization complete!"
