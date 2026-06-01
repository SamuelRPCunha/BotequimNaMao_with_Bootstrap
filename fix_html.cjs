const fs = require('fs');

const files = ['index.html', 'login.html', 'gestao.html', 'cardapio.html', 'sobre.html'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Add CSS
  if (!content.includes('bootstrap.min.css')) {
    content = content.replace('</head>', '  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">\n  <link rel="stylesheet" href="/estilos.css">\n</head>');
  }
  
  // Add JS
  if (!content.includes('bootstrap.bundle.min.js')) {
    content = content.replace('</body>', '  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>\n</body>');
  }
  
  fs.writeFileSync(file, content);
  console.log(`Fixed ${file}`);
});

let mainJs = fs.readFileSync('main.js', 'utf8');
mainJs = mainJs.replace(/import 'bootstrap\/dist\/css\/bootstrap\.min\.css';/g, '');
mainJs = mainJs.replace(/import \* as bootstrap from 'bootstrap';/g, '');
mainJs = mainJs.replace(/import '\.\/estilos\.css';/g, '');
fs.writeFileSync('main.js', mainJs);
console.log('Fixed main.js');
