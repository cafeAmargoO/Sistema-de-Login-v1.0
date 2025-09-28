// ===== Helpers / DOM =====
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');

const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');

const userDisplay = document.getElementById('userDisplay');
const userNameSpan = document.getElementById('userName');
const userAvatar = document.getElementById('userAvatar');
const yearSpan = document.getElementById('year');

// Set year
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

// ===== Modal open/close =====
function openModal(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.setAttribute('aria-hidden', 'false');
}
function closeModal(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.setAttribute('aria-hidden', 'true');
}
function switchModal(hideId, showId){
  closeModal(hideId);
  openModal(showId);
}

// open buttons
loginBtn.addEventListener('click', ()=> openModal('loginModal'));
registerBtn.addEventListener('click', ()=> openModal('registerModal'));

// close buttons (delegation)
document.querySelectorAll('.modal-close').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const id = btn.getAttribute('data-close');
    if(id) closeModal(id);
    else {
      // if no data-close, search parent modal
      let parent = btn.closest('.modal');
      if(parent) parent.setAttribute('aria-hidden','true');
    }
  });
});

// close clicking outside modal content
document.querySelectorAll('.modal').forEach(modal=>{
  modal.addEventListener('click', (e)=>{
    if(e.target === modal) modal.setAttribute('aria-hidden','true');
  });
});

// ===== LocalStorage utils =====
function getUsers(){
  try{
    return JSON.parse(localStorage.getItem('users')||'{}');
  }catch(e){
    return {};
  }
}
function saveUsers(users){
  localStorage.setItem('users', JSON.stringify(users));
}
function setCurrentUser(email){
  localStorage.setItem('currentUser', email);
}
function getCurrentUser(){
  return localStorage.getItem('currentUser') || null;
}
function logout(){
  localStorage.removeItem('currentUser');
  updateUI();
}

// ===== Register logic =====
registerForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  registerMessage.textContent = '';
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim().toLowerCase();
  const pwd = document.getElementById('registerPassword').value;
  const pwd2 = document.getElementById('registerPassword2').value;

  if(pwd.length < 6){
    registerMessage.textContent = 'Senha precisa ter ao menos 6 caracteres.';
    return;
  }
  if(pwd !== pwd2){
    registerMessage.textContent = 'As senhas não coincidem.';
    return;
  }
  const users = getUsers();
  if(users[email]){
    registerMessage.textContent = 'Já existe uma conta com esse email.';
    return;
  }
  // Save user (nota: senha em texto simples — em produção usar backend + hash!)
  users[email] = { name, email, password: pwd };
  saveUsers(users);

  // auto-login após registro
  setCurrentUser(email);
  registerMessage.style.color = 'green';
  registerMessage.textContent = 'Registrado! Redirecionando...';
  updateUI();

  setTimeout(()=> {
    registerMessage.textContent = '';
    closeModal('registerModal');
  }, 900);
});

// ===== Login logic =====
loginForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  loginMessage.textContent = '';
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const pwd = document.getElementById('loginPassword').value;

  const users = getUsers();
  const u = users[email];
  if(!u || u.password !== pwd){
    loginMessage.style.color = 'red';
    loginMessage.textContent = 'Email ou senha incorretos.';
    return;
  }

  setCurrentUser(email);
  loginMessage.style.color = 'green';
  loginMessage.textContent = `Bem-vindo, ${u.name}!`;
  updateUI();

  setTimeout(()=>{
    loginMessage.textContent = '';
    closeModal('loginModal');
  }, 800);
});

// ===== Logout btn =====
logoutBtn.addEventListener('click', ()=>{
  logout();
});

// ===== Update UI =====
function updateUI(){
  const email = getCurrentUser();
  const users = getUsers();
  if(email && users[email]){
    const u = users[email];
    // show user
    userDisplay.classList.remove('hidden');
    userNameSpan.textContent = u.name;
    // avatar initials
    userAvatar.textContent = getInitials(u.name);
    // show logout, hide login/register
    logoutBtn.classList.remove('hidden');
    loginBtn.classList.add('hidden');
    registerBtn.classList.add('hidden');
  } else {
    // hide user
    userDisplay.classList.add('hidden');
    userNameSpan.textContent = '';
    userAvatar.textContent = '';
    logoutBtn.classList.add('hidden');
    loginBtn.classList.remove('hidden');
    registerBtn.classList.remove('hidden');
  }
}

// get initials helper
function getInitials(name){
  if(!name) return '';
  const parts = name.trim().split(/\s+/);
  if(parts.length === 1) return parts[0].substring(0,2).toUpperCase();
  return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}

// run on load
updateUI();
