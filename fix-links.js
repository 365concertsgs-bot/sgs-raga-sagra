const fs = require('fs');

// Read App.jsx
let appContent = fs.readFileSync('src/App.jsx', 'utf8');

// Update renderTextWithLinks style to use !important
appContent = appContent.replace(
  'color: "#ffd700",',
  'color: "#ffd700 !important",'
);

// Update email link style to use !important  
appContent = appContent.replace(
  'style={{ color: "#ffd700" }}',
  'style={{ color: "#ffd700 !important" }}'
);

fs.writeFileSync('src/App.jsx', appContent);
console.log('App.jsx updated successfully');
