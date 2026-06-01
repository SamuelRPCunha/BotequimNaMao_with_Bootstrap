const receitas = [
  {
    "id": 1, "name": "Caipirinha", "description": "O clássico brasileiro.", 
    "image": "images/page_cardapio/caipirinha.png", "tags": ["Clássico"],
    "ingredientsNeeded": ["Cachaça", "Limão", "Açúcar", "Gelo"]
  }
];

const todosIngredientes = new Set();
receitas.forEach(r => r.ingredientsNeeded.forEach(ing => todosIngredientes.add(ing)));
const ingredientesOrdenados = Array.from(todosIngredientes).sort();

console.log(ingredientesOrdenados);
