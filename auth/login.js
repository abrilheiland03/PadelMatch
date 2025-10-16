const form = document.getElementById('form-login');
const msg = document.getElementById('msg');
const btnBack = document.getElementById('btn-back');
const btnRegister = document.getElementById('btn-register');

// Cargar usuarios desde seed (file://)
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
(function cargarUsuarios() {
  if (usuarios.length) return;
  const seed = document.getElementById('seed-usuarios');
  if (!seed) return;
  try {
    const data = JSON.parse(seed.textContent || '[]');
    if (Array.isArray(data)) {
      usuarios = data;
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
  } catch(_) {}
})();

function setSesion(usuarioObj) {
  localStorage.setItem('usuarioActual', JSON.stringify({ nombre: usuarioObj.usuario, rol: usuarioObj.rol }));
}

function redirigirPorRol(rol) {
  if (rol === 'jugador') {
    window.location.href = '../perfiles/jugador/index.html';
  } else if (rol === 'complejo') {
    window.location.href = '../perfiles/complejo/index.html';
  } else if (rol === 'local') {
    window.location.href = '../perfiles/local/index.html';
  } else {
    window.location.href = '../inicio/index.html';
  }
}

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    msg.textContent = '';
    const usuario = form.usuario.value.trim();
    const password = form.password.value;
    if (!usuario || !password) { msg.textContent = 'Completa usuario y contraseña.'; return; }
    const u = usuarios.find(x => x.usuario === usuario);
    if (!u || u.password !== password) { msg.textContent = 'Credenciales inválidas.'; return; }
    setSesion(u);
    redirigirPorRol(u.rol);
  });
}

if (btnBack) {
  btnBack.addEventListener('click', () => window.location.href = '../inicio/index.html');
}

if (btnRegister) {
  btnRegister.addEventListener('click', () => window.location.href = './register.html');
}


