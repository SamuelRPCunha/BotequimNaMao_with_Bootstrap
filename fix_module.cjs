const fs = require('fs');

const files = ['index.html', 'login.html', 'gestao.html', 'cardapio.html', 'sobre.html'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove module type and fix absolute path so it works without a local server
  content = content.replace(/<script type="module" src="\/main\.js"><\/script>/g, '<script src="./main.js" defer></script>');
  // Just in case it was already relative:
  content = content.replace(/<script type="module" src="\.\/main\.js"><\/script>/g, '<script src="./main.js" defer></script>');
  
  fs.writeFileSync(file, content);
  console.log(`Fixed ${file}`);
});
