// Importa o CSS do Bootstrap completo


// Importa o JavaScript do Bootstrap (para interações)


// Importa o seu CSS personalizado


document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initAccessibility();

  const displayHomeHours = document.getElementById('display-home-hours');
  if (displayHomeHours) {
    let hoursStr = "Não informado";
    try { 
      const hours = JSON.parse(localStorage.getItem('botequim_hours'));
      if(hours) hoursStr = `${hours.days} das ${hours.open} às ${hours.close}`;
    } catch(e){}
    displayHomeHours.textContent = hoursStr;
  }

  if (document.getElementById('page-login')) {
    initLogin();
  }

  if (document.getElementById('page-cardapio')) {
    initCardapio();
  }

  if (document.getElementById('page-gestao')) {
    initGestao();
  }

  if (document.getElementById('page-produto')) {
    initProduto();
  }

  if (document.getElementById('page-carrinho')) {
    initCarrinho();
  }

  // Verifica se o usuário tem itens no carrinho para mostrar o botão flutuante
  checkCartPresence();
});

function checkCartPresence() {
  // Evitar na página do carrinho
  if (document.getElementById('page-carrinho')) return;
  if (getCartCount() > 0) {
    showFloatingCart();
  }
}

/* ================= HELPER: DATA FETCHING ================= */
async function fetchRecipes() {
  const localData = localStorage.getItem('botequim_recipes');
  if (localData) {
    return JSON.parse(localData);
  }

  const res = await fetch('./data/recipes.json');
  const data = await res.json();
  localStorage.setItem('botequim_recipes', JSON.stringify(data));
  return data;
}

/* ================= HEADER LOGIC ================= */
function initHeader() {
  const sessionRaw = localStorage.getItem('botequim_session');
  let session = null;
  try { session = sessionRaw ? JSON.parse(sessionRaw) : null; } catch(e){}

  const navContainer = document.querySelector('#navMenu .nav');
  
  if (navContainer && session) {
    navContainer.innerHTML = `
      <!-- Acessibilidade -->
      <button class="btn btn-link text-secondary p-1 text-decoration-none fw-bold fs-5 btn-increase-font" title="Tamanho da Fonte" aria-label="Tamanho da Fonte">Aa</button>
      <button class="btn btn-link text-secondary p-1 btn-toggle-theme" title="Alternar Tema Escuro" aria-label="Alternar Tema">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
      </button>

      <span class="text-muted fw-bold text-nowrap flex-shrink-0 d-none d-md-block">Olá, ${session.name.split(' ')[0]}</span>
      ${session.role === 'admin' ? '<a href="gestao.html" class="btn btn-outline-secondary fw-bold flex-shrink-0 ms-2">Gestão</a>' : ''}
      <button id="btn-logout" class="btn btn-outline-danger fw-bold flex-shrink-0 ms-2">Sair</button>
      
      <div class="dropdown flex-shrink-0 ms-2">
        <button class="btn btn-outline-primary fw-bold d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="color: #6a1b9a; border-color: #6a1b9a;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          Navegar
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow border-0 rounded-3">
          <li><a class="dropdown-item fw-bold text-dark py-2" href="index.html">🏠 Home</a></li>
          <li><a class="dropdown-item fw-bold text-dark py-2" href="cardapio.html">🍹 Cardápio</a></li>
          <li><a class="dropdown-item fw-bold text-dark py-2" href="sobre.html">📖 O Botequim</a></li>
        </ul>
      </div>
    `;
    
    document.getElementById('btn-logout').addEventListener('click', () => {
      localStorage.removeItem('botequim_session');
      window.location.reload();
    });
  }

  // Adiciona a faixa de aviso de horário e disponibilidade em todas as páginas
  const header = document.querySelector('header');
  if (header && !document.getElementById('status-banner')) {
    const isManualOverrideOff = localStorage.getItem('botequim_status') === 'false';
    const savedHours = JSON.parse(localStorage.getItem('botequim_hours') || 'null');
    
    let isBarOpen = false;
    let overrideReason = false;
    
    if (isManualOverrideOff) {
      isBarOpen = false;
      overrideReason = true;
    } else {
      isBarOpen = checkIsOpenNow(savedHours);
    }

    const statusBanner = document.createElement('div');
    statusBanner.id = 'status-banner';
    statusBanner.className = `text-center py-2 fw-bold text-white ${isBarOpen ? 'bg-success' : (overrideReason ? 'bg-dark' : 'bg-danger')}`;
    statusBanner.style.fontSize = '0.9rem';

    let hoursText = savedHours ? ` | Horários: ${savedHours.days}, das ${savedHours.open} às ${savedHours.close}` : '';
    
    if (isBarOpen) {
      statusBanner.innerHTML = `🟢 Botequim Aberto!${hoursText}`;
    } else if (overrideReason) {
      statusBanner.innerHTML = `⚠️ Botequim Fechado para imprevistos hoje.${hoursText}`;
    } else {
      statusBanner.innerHTML = `🔴 Botequim Fechado no momento.${hoursText}`;
    }

    header.parentNode.insertBefore(statusBanner, header);
  }
}

/* ================= HORÁRIOS LOGIC ================= */
function checkIsOpenNow(savedHours) {
  if (!savedHours || !savedHours.daysArray || !savedHours.open || !savedHours.close) {
    return true; // Se não configurou perfeitamente, assumimos aberto
  }

  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [openH, openM] = savedHours.open.split(':').map(Number);
  const openTime = openH * 60 + openM;
  
  const [closeH, closeM] = savedHours.close.split(':').map(Number);
  const closeTime = closeH * 60 + closeM;

  const isOvernight = closeTime <= openTime;

  // Verifica turno de hoje
  if (savedHours.daysArray.includes(currentDay)) {
    if (!isOvernight) {
      if (currentTime >= openTime && currentTime <= closeTime) return true;
    } else {
      if (currentTime >= openTime || currentTime <= closeTime) return true;
    }
  }

  // Se for madrugada, precisamos checar se ONTEM estava aberto (e o turno cruza a meia-noite)
  if (isOvernight && currentTime <= closeTime) {
    const yesterday = currentDay === 0 ? 6 : currentDay - 1;
    if (savedHours.daysArray.includes(yesterday)) {
      return true;
    }
  }

  return false;
}

/* ================= LOGIN LOGIC ================= */
function initLogin() {
  const form = document.getElementById('form-login');
  const title = document.getElementById('login-title');
  const subtitle = document.getElementById('login-subtitle');
  const btnSubmit = document.getElementById('btn-submit');
  const toggleText = document.getElementById('toggle-text');
  const toggleBtn = document.getElementById('toggle-btn');
  const nameGroup = document.getElementById('group-name');

  // Modal Elements - Using Bootstrap Modal API
  const modalElement = document.getElementById('modal');
  const modalMsg = document.getElementById('modal-msg');
  const modalBtn = document.getElementById('modal-btn');
  const bsModal = new bootstrap.Modal(modalElement);
  let modalAction = null;

  let isLogin = true;

  toggleBtn.addEventListener('click', () => {
    isLogin = !isLogin;

    if (isLogin) {
      title.textContent = 'Acesse sua conta';
      subtitle.textContent = 'Bem-vindo de volta! Por favor, insira seus dados.';
      btnSubmit.textContent = 'Entrar';
      toggleText.textContent = 'Não tem uma conta?';
      toggleBtn.textContent = 'Cadastre-se';
      nameGroup.style.display = 'none';
      document.getElementById('input-name').required = false;
    } else {
      title.textContent = 'Crie sua conta';
      subtitle.textContent = 'Preencha os dados abaixo para começar.';
      btnSubmit.textContent = 'Cadastrar';
      toggleText.textContent = 'Já tem uma conta?';
      toggleBtn.textContent = 'Entrar';
      nameGroup.style.display = 'block';
      document.getElementById('input-name').required = true;
    }
  });

  function showModal(msg, action = null) {
    modalMsg.textContent = msg;
    modalAction = action;
    bsModal.show();
  }

  modalElement.addEventListener('hidden.bs.modal', () => {
    if (modalAction) modalAction();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('input-name').value;
    const email = document.getElementById('input-email').value;
    const password = document.getElementById('input-password').value;

    if (isLogin) {
      if (email === 'admin' && password === 'admin') {
        const adminUser = { name: 'Administrador', email: 'admin', role: 'admin' };
        localStorage.setItem('botequim_session', JSON.stringify(adminUser));
        showModal('Login de Administrador realizado!', () => window.location.href = 'gestao.html');
        return;
      }

      const users = JSON.parse(localStorage.getItem('botequim_users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        localStorage.setItem('botequim_session', JSON.stringify(user));
        showModal(`Bem-vindo(a), ${user.name}!`, () => window.location.href = 'index.html');
      } else {
        showModal('E-mail ou senha incorretos.');
      }
    } else {
      if (!name || !email || !password) {
        showModal('Preencha todos os campos.');
        return;
      }

      const users = JSON.parse(localStorage.getItem('botequim_users') || '[]');
      if (users.some(u => u.email === email)) {
        showModal('Este e-mail já está cadastrado.');
        return;
      }

      const newUser = { name, email, password };
      users.push(newUser);
      localStorage.setItem('botequim_users', JSON.stringify(users));
      localStorage.setItem('botequim_session', JSON.stringify(newUser));

      showModal('Conta criada com sucesso!', () => window.location.href = 'index.html');
    }
  });
}

/* ================= GESTAO LOGIC (ADMIN) ================= */
async function initGestao() {
  const container = document.getElementById('stock-container');
  const containerDrinks = document.getElementById('drinks-list-container');
  
  try {
    const btnLogout = document.getElementById('btn-logout-admin');
    const formAdd = document.getElementById('form-add-drink');
    const modalAddElement = document.getElementById('modal-add-drink');
    let bsModalAdd;
    if (modalAddElement && typeof bootstrap !== 'undefined') {
      bsModalAdd = new bootstrap.Modal(modalAddElement);
    }

    const sessionRaw = localStorage.getItem('botequim_session');
    let session = null;
    try { session = sessionRaw ? JSON.parse(sessionRaw) : null; } catch(e){}
    
    if (!session || session.role !== 'admin') {
      window.location.href = 'login.html';
      return;
    }

    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        localStorage.removeItem('botequim_session');
        window.location.href = 'index.html';
      });
    }

    // Carregar dados de forma assíncrona segura
    const data = await fetchRecipes();
    renderStockManagement(data);
    renderDrinksManagement(data);

    // Listener para Aba de Bebidas
    const tabDrinksBtn = document.getElementById('tab-drinks');
    if (tabDrinksBtn) {
      tabDrinksBtn.addEventListener('shown.bs.tab', async () => {
        const freshData = await fetchRecipes();
        renderDrinksManagement(freshData);
      });
    }

    // Listener para Aba de Pedidos
    const tabOrdersBtn = document.getElementById('tab-orders');
    if (tabOrdersBtn) {
      tabOrdersBtn.addEventListener('shown.bs.tab', () => {
        renderOrders();
      });
    }

    if (formAdd) {
      formAdd.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('new-name').value;
        const desc = document.getElementById('new-desc').value;
        const ingredientsStr = document.getElementById('new-ingredients').value;
        const imageInput = document.getElementById('new-image');

        let imageSrc = './images/geral/header/logo_botequim_na_mao_1.png';

        if (imageInput && imageInput.files && imageInput.files[0]) {
          const file = imageInput.files[0];
          imageSrc = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
          });
        }

        const ingredientsList = ingredientsStr.split(',').map(i => i.trim()).filter(i => i);
        const recipes = await fetchRecipes();

        const newRecipe = {
          id: Date.now(),
          name,
          description: desc,
          ingredientsNeeded: ingredientsList,
          image: imageSrc
        };
        
        recipes.push(newRecipe);
        localStorage.setItem('botequim_recipes', JSON.stringify(recipes));
        
        renderStockManagement(recipes);
        renderDrinksManagement(recipes);
        
        if (bsModalAdd) bsModalAdd.hide();
        formAdd.reset();
        alert('Bebida adicionada com sucesso!');
      });
    }
  } catch (err) {
    console.error("Erro crítico na aba de gestão:", err);
    if (container) {
      container.innerHTML = `<div class="alert alert-danger fw-bold shadow-sm">⚠️ Erro ao carregar gestão: ${err.message}. Por favor, limpe o cache do navegador.</div>`;
    }
    if (containerDrinks) {
      containerDrinks.innerHTML = `<div class="alert alert-danger fw-bold shadow-sm">⚠️ Erro ao carregar drinks: ${err.message}</div>`;
    }
  }

  function renderStockManagement(receitas) {
    const todosIngredientes = new Set();
    receitas.forEach(r => r.ingredientsNeeded.forEach(ing => todosIngredientes.add(ing)));
    const ingredientesOrdenados = Array.from(todosIngredientes).sort();

    let currentStock = JSON.parse(localStorage.getItem('botequim_stock'));
    if (!currentStock) {
      currentStock = ingredientesOrdenados;
      localStorage.setItem('botequim_stock', JSON.stringify(currentStock));
    }

    container.innerHTML = '';

    ingredientesOrdenados.forEach(ing => {
      const item = document.createElement('div');
      item.className = 'd-flex justify-content-between align-items-center p-3 bg-white rounded-3 border shadow-sm';
      const isChecked = currentStock.includes(ing);

      item.innerHTML = `
        <span class="fw-bold text-dark">${ing}</span>
        <div class="form-check form-switch fs-4 mb-0">
          <input class="form-check-input" type="checkbox" role="switch" value="${ing}" ${isChecked ? 'checked' : ''} style="cursor: pointer;">
        </div>
      `;

      const checkbox = item.querySelector('input');
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          currentStock.push(ing);
        } else {
          currentStock = currentStock.filter(i => i !== ing);
        }
        currentStock = [...new Set(currentStock)];
        localStorage.setItem('botequim_stock', JSON.stringify(currentStock));
      });

      container.appendChild(item);
    });
  }

  function renderDrinksManagement(receitas) {
    if (!containerDrinks) return;
    containerDrinks.innerHTML = '';

    receitas.forEach(receita => {
      const item = document.createElement('div');
      item.className = 'd-flex justify-content-between align-items-center p-3 bg-white rounded-3 border shadow-sm';

      item.innerHTML = `
        <span class="fw-bold text-dark">${receita.name}</span>
        <button class="btn btn-outline-danger btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center btn-delete" style="width: 35px; height: 35px;" title="Remover Bebida">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      `;

      item.querySelector('.btn-delete').addEventListener('click', async () => {
        if (confirm(`Tem certeza que deseja remover "${receita.name}"?`)) {
          const currentRecipes = await fetchRecipes();
          const updatedRecipes = currentRecipes.filter(r => r.id !== receita.id);
          localStorage.setItem('botequim_recipes', JSON.stringify(updatedRecipes));

          renderDrinksManagement(updatedRecipes);
          renderStockManagement(updatedRecipes);
        }
      });

      containerDrinks.appendChild(item);
    });
  }

  // ================= CONFIGURAÇÕES (ABA 3) =================
  const switchStatusBar = document.getElementById('switch-status-bar');
  const labelStatusBar = document.getElementById('label-status-bar');
  const descStatusBar = document.getElementById('desc-status-bar');

  if (switchStatusBar && labelStatusBar && descStatusBar) {
    // Carregar estado
    const isBarOpen = JSON.parse(localStorage.getItem('botequim_status') !== null ? localStorage.getItem('botequim_status') : 'true');
    switchStatusBar.checked = isBarOpen;
    updateStatusBarUI(isBarOpen);

    // Listener de mudança
    switchStatusBar.addEventListener('change', (e) => {
      const isOpen = e.target.checked;
      localStorage.setItem('botequim_status', JSON.stringify(isOpen));
      updateStatusBarUI(isOpen);
      showAdminToast(isOpen ? 'Funcionamento Automático Ativado!' : 'Fechamento Forçado Ativado!');
      
      const oldBanner = document.getElementById('status-banner');
      if (oldBanner) oldBanner.remove();
      initHeader();
    });
  }

  function updateStatusBarUI(isOpen) {
    if (isOpen) {
      labelStatusBar.textContent = 'Funcionamento Automático';
      labelStatusBar.classList.remove('text-danger', 'text-dark');
      labelStatusBar.classList.add('text-success');
      descStatusBar.textContent = 'O sistema abre e fecha de acordo com a tabela.';
    } else {
      labelStatusBar.textContent = 'Fechamento Forçado';
      labelStatusBar.classList.remove('text-success', 'text-dark');
      labelStatusBar.classList.add('text-danger');
      descStatusBar.textContent = 'Atenção: O Botequim está fechado para todos os clientes!';
    }
  }

  const formBusinessHours = document.getElementById('form-business-hours');
  if (formBusinessHours) {
    const inputDays = document.getElementById('input-days');
    const inputOpen = document.getElementById('input-time-open');
    const inputClose = document.getElementById('input-time-close');

    // Carregar horários salvos
    const savedHours = JSON.parse(localStorage.getItem('botequim_hours') || 'null');
    if (savedHours) {
      if (savedHours.days) inputDays.value = savedHours.days;
      if (savedHours.open) inputOpen.value = savedHours.open;
      if (savedHours.close) inputClose.value = savedHours.close;
      if (savedHours.daysArray) {
        savedHours.daysArray.forEach(d => {
          const cb = document.getElementById(`day-${d}`);
          if (cb) cb.checked = true;
        });
      }
    }

    formBusinessHours.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const checkedBoxes = Array.from(document.querySelectorAll('#input-days-checkboxes input[type="checkbox"]:checked'));
      const daysArray = checkedBoxes.map(cb => parseInt(cb.value, 10));

      const hoursData = {
        days: inputDays.value,
        daysArray: daysArray,
        open: inputOpen.value,
        close: inputClose.value
      };
      localStorage.setItem('botequim_hours', JSON.stringify(hoursData));
      showAdminToast('Horários salvos com sucesso!');
      
      // Atualiza o banner do header sem recarregar a página, mantendo o usuário na mesma aba
      const oldBanner = document.getElementById('status-banner');
      if (oldBanner) oldBanner.remove();
      initHeader();
    });
  }

  function showAdminToast(message) {
    const toastEl = document.getElementById('admin-toast');
    if (toastEl) {
      document.getElementById('admin-toast-msg').textContent = message;
      // Precisamos garantir que o bootstrap toast está acessível
      try {
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
      } catch (err) {
        alert(message);
      }
    } else {
      alert(message);
    }
  }

  function renderOrders() {
    const ordersContainer = document.getElementById('orders-container');
    if (!ordersContainer) return;
    
    const orders = JSON.parse(localStorage.getItem('botequim_orders') || '[]');
    ordersContainer.innerHTML = '';
    
    if (orders.length === 0) {
      ordersContainer.innerHTML = '<div class="col-12"><p class="text-center text-muted py-5">Nenhum pedido no momento.</p></div>';
      return;
    }
    
    // Reverse to show newest first
    orders.reverse().forEach((order, index) => {
      const realIndex = orders.length - 1 - index;
      const orderDate = new Date(order.date);
      const timeStr = orderDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      let badgeClass = 'bg-secondary';
      let badgeText = 'Pendente';
      if (order.status === 'preparando') {
        badgeClass = 'bg-warning text-dark';
        badgeText = 'Em Preparação';
      } else if (order.status === 'feito') {
        badgeClass = 'bg-success text-white';
        badgeText = 'Finalizado';
      }
      
      const itemsHtml = order.items.map(item => `<li class="fw-bold">${item.quantity}x <span class="fw-normal">${item.name}</span></li>`).join('');
      
      const card = document.createElement('div');
      card.className = 'col-12 col-md-6 col-lg-4';
      card.innerHTML = `
        <div class="card h-100 shadow-sm border-0 rounded-4 ${order.status === 'feito' ? 'opacity-75' : ''}">
          <div class="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
            <h6 class="fw-bold mb-0 text-muted">#${order.id.toString().slice(-4)}</h6>
            <span class="badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="card-body d-flex flex-column">
            <p class="mb-1 fw-bold fs-5" style="color: #6a1b9a !important;">${order.user}</p>
            <p class="small text-muted mb-3">🕒 Feito às ${timeStr}</p>
            
            <ul class="small mb-4 ps-3 text-dark">
              ${itemsHtml}
            </ul>
            
            <div class="mt-auto d-flex gap-2">
              <button class="btn btn-sm w-100 fw-bold border ${order.status === 'preparando' ? 'btn-warning text-dark' : 'btn-outline-warning text-dark'}" onclick="updateOrderStatus(${realIndex}, 'preparando')" ${order.status === 'feito' ? 'disabled' : ''}>Preparando</button>
              <button class="btn btn-sm w-100 fw-bold border ${order.status === 'feito' ? 'btn-success' : 'btn-outline-success text-success'}" onclick="updateOrderStatus(${realIndex}, 'feito')" ${order.status === 'feito' ? 'disabled' : ''}>Feito</button>
            </div>
          </div>
        </div>
      `;
      ordersContainer.appendChild(card);
    });
  }
  
  // Expose to global so onclick works
  window.updateOrderStatus = function(index, newStatus) {
    const orders = JSON.parse(localStorage.getItem('botequim_orders') || '[]');
    if (orders[index]) {
      orders[index].status = newStatus;
      localStorage.setItem('botequim_orders', JSON.stringify(orders));
      renderOrders();
    }
  };
  
  // Initial render
  renderOrders();
}


/* ================= CARDAPIO LOGIC ================= */
function initCardapio() {
  const container = document.getElementById('cards-container');
  const inputBusca = document.getElementById('input-busca');
  const areaFiltroElement = document.getElementById('area-filtro');
  const bsCollapse = new bootstrap.Collapse(areaFiltroElement, { toggle: false });
  const btnToggleFiltro = document.getElementById('btn-toggle-filtro');
  const listaIngredientesContainer = document.getElementById('lista-ingredientes');
  const btnLimpar = document.getElementById('btn-limpar-filtros');

  let allRecipes = [];
  let selectedIngredients = [];

  btnToggleFiltro.addEventListener('click', () => {
    bsCollapse.toggle();
  });

  inputBusca.addEventListener('input', () => {
    applyFilters();
  });

  btnLimpar.addEventListener('click', () => {
    selectedIngredients = [];
    document.querySelectorAll('.btn-ingrediente').forEach(btn => {
      btn.classList.remove('btn-primary', 'text-white');
      btn.classList.add('btn-outline-secondary', 'text-muted');
      btn.style.backgroundColor = '';
      btn.style.borderColor = '';
    });
    applyFilters();
  });

  fetchRecipes().then(data => {
    allRecipes = data;
    generateIngredientButtons(data);
    renderCards(allRecipes);
  })
    .catch(err => {
      container.innerHTML = '<div class="col-12"><p class="text-center text-danger w-100">Erro ao carregar receitas.</p></div>';
      console.error(err);
    });

  function generateIngredientButtons(receitas) {
    const todosIngredientes = new Set();
    receitas.forEach(r => r.ingredientsNeeded.forEach(ing => todosIngredientes.add(ing)));
    const ingredientesOrdenados = Array.from(todosIngredientes).sort();

    listaIngredientesContainer.innerHTML = '';
    ingredientesOrdenados.forEach(ing => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-outline-secondary rounded-pill fw-bold small btn-ingrediente text-muted border';
      btn.textContent = ing;

      btn.addEventListener('click', () => {
        if (selectedIngredients.includes(ing)) {
          selectedIngredients = selectedIngredients.filter(i => i !== ing);
          btn.classList.remove('btn-primary', 'text-white');
          btn.classList.add('btn-outline-secondary', 'text-muted');
          btn.style.backgroundColor = '';
          btn.style.borderColor = '';
        } else {
          selectedIngredients.push(ing);
          btn.classList.remove('btn-outline-secondary', 'text-muted');
          btn.classList.add('btn-primary', 'text-white');
          btn.style.backgroundColor = '#6a1b9a';
          btn.style.borderColor = '#6a1b9a';
        }
        applyFilters();
      });

      listaIngredientesContainer.appendChild(btn);
    });
  }

  function applyFilters() {
    const termoBusca = inputBusca.value.toLowerCase();

    const filtrados = allRecipes.filter(receita => {
      const matchNome = receita.name.toLowerCase().includes(termoBusca);
      const matchIngredientes = selectedIngredients.every(sel =>
        receita.ingredientsNeeded.includes(sel)
      );
      return matchNome && matchIngredientes;
    });

    renderCards(filtrados);
  }

  function renderCards(receitas) {
    container.innerHTML = '';

    if (receitas.length === 0) {
      container.innerHTML = '<div class="col-12"><p class="text-center text-muted w-100 py-5">Nenhum drink encontrado com esses critérios.</p></div>';
      return;
    }

    receitas.forEach(receita => {
      const card = document.createElement('div');
      card.className = 'col-12 col-md-6 col-lg-4';

      const ingredientesHTML = receita.ingredientsNeeded.map(ing =>
        `<span class="badge bg-light text-dark border fw-normal">${ing}</span>`
      ).join('');

      card.innerHTML = `
        <div class="card h-100 shadow-sm border-0 rounded-4 overflow-hidden" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'" onclick="window.location.href='produto.html?id=${receita.id}'">
          <img src="${receita.image}" class="card-img-top" alt="${receita.name}" style="height: 250px; object-fit: cover;">
          <div class="card-body d-flex flex-column p-4">
            <h5 class="card-title fw-bold mb-2">${receita.name}</h5>
            <p class="card-text text-muted small mb-4">${receita.description}</p>
            <div class="mt-auto">
              <h6 class="fw-bold mb-2 small text-dark">Ingredientes:</h6>
              <div class="d-flex flex-wrap gap-2">
                ${ingredientesHTML}
              </div>
            </div>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }
}

/* ================= PRODUTO LOGIC ================= */
async function initProduto() {
  const container = document.getElementById('product-container');
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id'), 10);

  if (!productId) {
    container.innerHTML = '<div class="text-center py-5"><h2 class="h4 text-danger">Produto não encontrado.</h2><p class="text-muted">Nenhum ID foi fornecido na URL.</p></div>';
    return;
  }

  try {
    const allRecipes = await fetchRecipes();
    const recipe = allRecipes.find(r => r.id === productId);

    if (!recipe) {
      container.innerHTML = '<div class="text-center py-5"><h2 class="h4 text-danger">Produto não encontrado.</h2><p class="text-muted">A bebida que você está procurando não existe ou foi removida.</p></div>';
      return;
    }

    const ingredientesHTML = recipe.ingredientsNeeded.map(ing =>
      `<span class="badge bg-light text-dark border p-2 px-3 fw-bold shadow-sm" style="font-size: 0.9rem;">${ing}</span>`
    ).join('');

    container.innerHTML = `
      <div class="row align-items-center g-5">
        <div class="col-md-6 text-center text-md-end">
          <img src="${recipe.image}" alt="${recipe.name}" class="img-fluid rounded-4 shadow" style="max-height: 550px; object-fit: cover; width: 100%;">
        </div>
        <div class="col-md-6">
          <h1 class="display-5 fw-bold mb-3" style="color: #6a1b9a;">${recipe.name}</h1>
          <p class="lead text-muted mb-4">${recipe.description}</p>
          
          <h3 class="h5 fw-bold mb-3 text-dark">Ingredientes Necessários:</h3>
          <div class="d-flex flex-wrap gap-2 mb-5">
            ${ingredientesHTML}
          </div>
          
          <button id="btn-add-cart" class="btn btn-primary btn-lg w-100 fw-bold shadow-sm d-flex justify-content-center align-items-center gap-2" style="background-color: #6a1b9a; border-color: #6a1b9a; padding: 15px; transition: all 0.3s ease;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-add-cart').addEventListener('click', () => {
      const sessionRaw = localStorage.getItem('botequim_session');
      if (!sessionRaw) {
        alert('Você precisa estar logado para adicionar itens ao carrinho!');
        window.location.href = 'login.html';
        return;
      }

      addToCart(recipe);
      showFloatingCart();
      
      const btn = document.getElementById('btn-add-cart');
      btn.innerHTML = 'Adicionado ao Carrinho! ✓';
      btn.style.backgroundColor = '#198754';
      btn.style.borderColor = '#198754';
      
      setTimeout(() => {
        btn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Adicionar Mais ao Carrinho`;
        btn.style.backgroundColor = '#6a1b9a';
        btn.style.borderColor = '#6a1b9a';
      }, 2000);
    });

  } catch (err) {
    container.innerHTML = '<div class="text-center py-5"><h2 class="h4 text-danger">Erro ao carregar o produto.</h2><p class="text-muted">Por favor, tente novamente mais tarde.</p></div>';
    console.error(err);
  }
}

/* ================= CART LOGIC ================= */
function getCart() {
  return JSON.parse(localStorage.getItem('botequim_cart') || '[]');
}

function addToCart(recipe) {
  const cart = getCart();
  const existing = cart.find(item => item.id === recipe.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...recipe, quantity: 1 });
  }
  localStorage.setItem('botequim_cart', JSON.stringify(cart));
}

function getCartCount() {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}

function showFloatingCart() {
  let btn = document.getElementById('floating-cart');
  
  if (!btn) {
    btn = document.createElement('a');
    btn.id = 'floating-cart';
    btn.href = 'carrinho.html';
    btn.className = 'btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center';
    btn.style.position = 'fixed';
    btn.style.bottom = '30px';
    btn.style.right = '30px';
    btn.style.width = '65px';
    btn.style.height = '65px';
    btn.style.zIndex = '1050';
    btn.style.backgroundColor = '#6a1b9a';
    btn.style.borderColor = '#6a1b9a';
    btn.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    
    btn.style.transform = 'scale(0)';
    document.body.appendChild(btn);
    
    setTimeout(() => {
      btn.style.transform = 'scale(1)';
    }, 50);
  }

  btn.innerHTML = `
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
    <span class="position-absolute top-0 start-100 translate-middle badge border border-light rounded-circle bg-danger p-2" style="font-size: 0.8rem; margin-top: 5px; margin-left: -5px;">
      ${getCartCount()}<span class="visually-hidden">itens no carrinho</span>
    </span>
  `;
}

/* ================= CARRINHO LOGIC ================= */
function initCarrinho() {
  const container = document.getElementById('cart-container');
  const sessionRaw = localStorage.getItem('botequim_session');

  if (!sessionRaw) {
    container.innerHTML = `
      <div class="text-center py-5">
        <h2 class="h4 text-danger mb-3">Acesso Negado</h2>
        <p class="text-muted mb-4">Você precisa estar logado para ver o seu carrinho.</p>
        <a href="login.html" class="btn btn-primary px-4 fw-bold" style="background-color: #6a1b9a; border-color: #6a1b9a;">Fazer Login</a>
      </div>
    `;
    return;
  }

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-3">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <h2 class="h5 text-muted mb-3">Seu carrinho está vazio</h2>
        <a href="cardapio.html" class="btn btn-outline-primary px-4 fw-bold" style="color: #6a1b9a; border-color: #6a1b9a;">Explorar Cardápio</a>
      </div>
    `;
    return;
  }

  let html = '<div class="list-group mb-5 text-start shadow-sm border-0">';
  cart.forEach(item => {
    html += `
      <div class="list-group-item d-flex align-items-center gap-4 py-3 border-light">
        <img src="${item.image}" alt="${item.name}" class="rounded-3" style="width: 80px; height: 80px; object-fit: cover;">
        <div class="flex-grow-1">
          <h5 class="mb-1 fw-bold text-dark">${item.name}</h5>
          <span class="badge bg-secondary">Quantidade: ${item.quantity}</span>
        </div>
      </div>
    `;
  });
  html += '</div>';

  html += `
    <div class="d-flex justify-content-end">
      <button id="btn-checkout" class="btn btn-success btn-lg fw-bold px-5 shadow-sm" style="background-color: #198754; border-color: #198754;">Finalizar Pedido</button>
    </div>
  `;

  container.innerHTML = html;
  container.classList.remove('text-center');

  document.getElementById('btn-checkout').addEventListener('click', () => {
    // Criar o Pedido
    const orders = JSON.parse(localStorage.getItem('botequim_orders') || '[]');
    const userSession = JSON.parse(sessionRaw);
    
    const newOrder = {
      id: Date.now(),
      user: userSession.name,
      items: getCart(),
      status: 'pendente', // pendente, preparando, feito
      date: new Date().toISOString()
    };
    
    orders.push(newOrder);
    localStorage.setItem('botequim_orders', JSON.stringify(orders));
    
    // Limpar Carrinho Local
    localStorage.removeItem('botequim_cart');
    
    container.innerHTML = `
      <div class="text-center py-5">
        <h2 class="h3 text-success mb-3 fw-bold">Pedido Realizado! 🎉</h2>
        <p class="text-muted mb-4 lead">Seu pedido foi enviado para o balcão e logo será preparado.</p>
        <a href="cardapio.html" class="btn btn-primary px-4 fw-bold" style="background-color: #6a1b9a; border-color: #6a1b9a;">Voltar ao Cardápio</a>
      </div>
    `;
    container.classList.add('text-center');
    
    const floating = document.getElementById('floating-cart');
    if (floating) floating.remove();
  });
}

/* ================= ACCESSIBILITY LOGIC ================= */
function initAccessibility() {
  const isDark = localStorage.getItem('botequim_theme') === 'dark';
  if (isDark) document.body.classList.add('dark-theme');

  let fontSize = parseInt(localStorage.getItem('botequim_fontSize')) || 100;
  document.documentElement.style.fontSize = fontSize + '%';

  const btnTheme = document.querySelectorAll('.btn-toggle-theme');
  const btnFont = document.querySelectorAll('.btn-increase-font');

  btnTheme.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentIsDark = document.body.classList.toggle('dark-theme');
      localStorage.setItem('botequim_theme', currentIsDark ? 'dark' : 'light');
    });
  });

  btnFont.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      fontSize += 10;
      if (fontSize > 120) fontSize = 100;
      document.documentElement.style.fontSize = fontSize + '%';
      localStorage.setItem('botequim_fontSize', fontSize);
    });
  });
}
