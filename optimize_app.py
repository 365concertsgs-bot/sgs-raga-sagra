#!/usr/bin/env python3
"""Optimize App.jsx with all improvements"""

import re

# Read the file
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix AudioPlayer closing and add proper memoization handling
#Looking for the pattern where AudioPlayer component ends
pattern = r'(  \);\n\};)\n\n(/\*.*?CONTINENT LIST.*?\*/)'
replacement = r'\1\nAudioPlayer.displayName = "AudioPlayer";\n\n\2'
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# 2. Add top-right logo (find where we render the logo and add another one)
logo_pattern = r'(      {/\* 🪔 SWAMIJI LOGO \*/}\n      <img\n        src="/swamiji-keyboard\.png"\n        alt="Swamiji"\n        style=\{styles\.logo\})'
logo_replacement = r'{/* 🪔 SWAMIJI LOGOS - TOP LEFT AND TOP RIGHT */}\n      <img\n        src="/swamiji-keyboard.png"\n        alt="Swamiji - Top Left"\n        style={styles.logoTopLeft}\n        loading="eager"\n        decoding="async"\n      />\n      <img\n        src="/swamiji-keyboard.png"\n        alt="Swamiji - Top Right"\n        style={styles.logoTopRight}\n        loading="eager"\n        decoding="async"'
content = re.sub(logo_pattern, logo_replacement, content)

# 3. Add logo styles to styles object
logo_styles = """  logoTopLeft: {
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

"""

# Find where to insert logo styles (after container)
style_insert = r'(  container: \{[\s\S]*?\},)'
if re.search(style_insert, content):
    content = re.sub(style_insert, r'\1\n\n' + logo_styles, content, count=1)

# 4. Improve rightPane for better scrolling
old_right_pane = r'  rightPane: \{\n    flex: 1,\n    background: "rgba\(0,0,0,0\.75\)",\n    padding: "[^"]*",\n    borderRadius: "[^"]*",\n    maxHeight: "100%",\n    overflowY: "auto",\n    WebkitOverflowScrolling: "touch",\n  \},'

new_right_pane = '''  rightPane: {
    flex: 1,
    background: "rgba(0,0,0,0.85)",
    padding: "clamp(12px, 1.5vw, 16px)",
    borderRadius: "clamp(8px, 1.5vw, 16px)",
    maxHeight: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    WebkitOverflowScrolling: "touch",
    scrollBehavior: "smooth",
    display: "flex",
    flexDirection: "column",
  },

  rightPaneContent: {
    flex: 1,
    minWidth: 0,
  },'''

content = re.sub(old_right_pane, new_right_pane, content)

# 5. Update contentWrapper for better responsiveness
old_content_wrapper = r'  contentWrapper: \{[\s\S]*?scrollBehavior: "smooth",\n  \},'
new_content_wrapper = '''  contentWrapper: {
    position: "relative",
    top: "auto",
    bottom: "auto",
    left: "auto",
    right: "auto",
    flex: 1,
    display: "flex",
    gap: "clamp(12px, 2vw, 20px)",
    padding: "clamp(10px, 1.5vw, 18px)",
    overflowY: "auto",
    overflowX: "hidden",
    WebkitOverflowScrolling: "touch",
    scrollBehavior: "smooth",
    minHeight: 0,
  },'''

content = re.sub(old_content_wrapper, new_content_wrapper, content)

# 6. Update title for better responsiveness
old_title = r'  title: \{\n    position: "absolute",\n    top: 20,\n    left: "50%",\n    transform: "translateX\(-50%\)",\n    color: "#ffd700",\n    fontSize: "clamp\(18px, 4vw, 28px\)",\n    fontFamily: "\'Philosopher\', serif",\n    fontWeight: "bold",\n    zIndex: 25,\n    whiteSpace: "nowrap",\n  \},'

new_title = '''  title: {
    position: "absolute",
    top: "clamp(12px, 2vw, 25px)",
    left: "50%",
    transform: "translateX(-50%)",
    color: "#ffd700",
    fontSize: "clamp(14px, 4vw, 32px)",
    fontFamily: "'Philosopher', serif",
    fontWeight: "bold",
    zIndex: 25,
    whiteSpace: "nowrap",
    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
  },'''

content = re.sub(old_title, new_title, content)

# Write the optimized content back
with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ App.jsx optimized successfully!")
print("- Added AudioPlayer displayName")
print("- Added top-right Swamiji logo")
print("- Improved responsive styles")
print("- Enhanced event details scrolling")
