const fs = require('fs');

const files = ['index.html', 'login.html', 'gestao.html', 'cardapio.html', 'sobre.html', 'carrinho.html', 'produto.html'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<script src="\.\/main\.js" defer><\/script>/g, '<script type="module" src="./main.js"></script>');
  fs.writeFileSync(file, content);
  console.log(`Fixed ${file}`);
});
