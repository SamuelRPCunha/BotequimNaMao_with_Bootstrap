import fs from 'fs';
import path from 'path';

const files = [
  'cardapio.html', 'sobre.html', 'login.html', 'carrinho.html', 'gestao.html', 'produto.html', 'index.html', 'main.js'
];

for (const file of files) {
  const filePath = path.join(process.cwd(), file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/"\/estilos\.css"/g, '"./estilos.css"');
  content = content.replace(/"\/images\//g, '"./images/');
  content = content.replace(/'\/images\//g, "'./images/");
  content = content.replace(/"\/data\//g, '"./data/');
  content = content.replace(/'\/data\//g, "'./data/");
  fs.writeFileSync(filePath, content, 'utf8');
}
console.log("Paths fixed successfully.");
