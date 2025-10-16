// Estado en localStorage
const anuncios = JSON.parse(localStorage.getItem('anuncios')) || [];
let usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null; // { nombre, rol }

// Referencias DOM
const formLogin = document.getElementById('form-login');
const btnOpenLogin = document.getElementById('btn-open-login');
const btnLogout = document.getElementById('btn-logout');
const btnGoPanel = document.getElementById('btn-go-panel');
const usuarioActualSpan = document.getElementById('usuario-actual');
const rolActualChip = document.getElementById('rol-actual');
const sessionInfo = document.getElementById('session-info');
const sessionChip = document.getElementById('session-chip');
const panelPublicidad = document.getElementById('panel-publicidad');
const formPublicidad = document.getElementById('form-publicidad');
const listaAnuncios = document.getElementById('lista-anuncios');

function guardarEstado() {
  localStorage.setItem('anuncios', JSON.stringify(anuncios));
  localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
}

function actualizarUIAuth() {
  const isLogged = !!usuarioActual;
  if (isLogged) {
    if (usuarioActualSpan) usuarioActualSpan.textContent = usuarioActual.nombre;
    if (rolActualChip) { rolActualChip.textContent = usuarioActual.rol; rolActualChip.style.display = ''; }
    if (sessionInfo) sessionInfo.style.display = '';
    if (sessionChip) { sessionChip.style.display = ''; sessionChip.textContent = `${usuarioActual.nombre} • ${usuarioActual.rol}`; }
    if (btnOpenLogin) btnOpenLogin.style.display = 'none';
    if (btnLogout) btnLogout.style.display = '';
    if (btnGoPanel) btnGoPanel.style.display = usuarioActual.rol === 'jugador' ? '' : 'none';
  } else {
    if (sessionInfo) sessionInfo.style.display = 'none';
    if (sessionChip) sessionChip.style.display = 'none';
    if (btnOpenLogin) btnOpenLogin.style.display = '';
    if (btnLogout) btnLogout.style.display = 'none';
    if (btnGoPanel) btnGoPanel.style.display = 'none';
  }

  // Panel de publicar publicidad solo para rol local
  if (panelPublicidad) {
    panelPublicidad.style.display = isLogged && usuarioActual.rol === 'local' ? '' : 'none';
  }
}

function renderizarAnuncios() {
  if (!listaAnuncios) return;
  listaAnuncios.innerHTML = '';
  anuncios.slice().reverse().forEach((a) => {
    const card = document.createElement('div');
    card.className = 'ad';
    card.innerHTML = `
      <div class="brandline">
        <span class="brand">${a.marca}</span>
        <span class="tag">${a.autorRol || 'local'}</span>
      </div>
      <div style="font-weight:600">${a.titulo}</div>
      <div style="color:#cfe3d6">${a.descripcion}</div>
    `;
    listaAnuncios.appendChild(card);
  });
}

// Eventos
if (formLogin) {
  // Cambiar el submit por redirección al login dedicado
  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    window.location.href = '../auth/login.html';
  });
}

if (btnOpenLogin) {
  btnOpenLogin.addEventListener('click', () => {
    window.location.href = '../auth/login.html';
  });
}

if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    usuarioActual = null;
    guardarEstado();
    actualizarUIAuth();
  });
}

if (btnGoPanel) {
  btnGoPanel.addEventListener('click', () => {
    if (!usuarioActual) return;
    if (usuarioActual.rol === 'jugador') {
      window.location.href = '../perfiles/jugador/index.html';
    }
  });
}

if (formPublicidad) {
  formPublicidad.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!usuarioActual || usuarioActual.rol !== 'local') {
      alert('Solo los locales/marcas pueden publicar publicidades.');
      return;
    }
    const marca = formPublicidad.marca.value.trim();
    const titulo = formPublicidad.titulo.value.trim();
    const descripcion = formPublicidad.descripcion.value.trim();
    if (!marca || !titulo || !descripcion) return;
    anuncios.push({ marca, titulo, descripcion, autor: usuarioActual.nombre, autorRol: usuarioActual.rol, ts: Date.now() });
    guardarEstado();
    renderizarAnuncios();
    formPublicidad.reset();
  });
}

// Inicializar
actualizarUIAuth();
renderizarAnuncios();


