
const initialAds = [
  { marca: "Adidas Padel", titulo: "Nueva Colección 2025", descripcion: "Descubre las palas Adipower. Potencia inigualable para tu juego. ¡Oferta de lanzamiento!", autor: "Adidas Padel", autorRol: "marca", ts: Date.now() - 50000 },
  { marca: "Bullpadel", titulo: "Zapatillas Vertex Comfort", descripcion: "Máximo agarre y amortiguación en la pista. Consigue el modelo de Paquito Navarro.", autor: "Bullpadel", autorRol: "marca", ts: Date.now() - 30000 },
  { marca: "Club Central Padel", titulo: "¡Liga de Verano Abierta!", descripcion: "Inscripciones disponibles. Categorías masculinas, femeninas y mixtas. Gran premio final.", autor: "Club Central Padel", autorRol: "local", ts: Date.now() - 10000 }
];

const anuncios = JSON.parse(localStorage.getItem('anuncios')) || initialAds; 
let usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null; 


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

  if (panelPublicidad) {
    panelPublicidad.style.display = isLogged && (usuarioActual.rol === 'local' || usuarioActual.rol === 'marca') ? '' : 'none';
  }
}

function renderizarAnuncios() {
  if (!listaAnuncios) return;
  listaAnuncios.innerHTML = '';

  anuncios.slice().sort((a, b) => b.ts - a.ts).forEach((a) => {
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


if (formLogin) {

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
    if (!usuarioActual || (usuarioActual.rol !== 'local' && usuarioActual.rol !== 'marca')) {
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


actualizarUIAuth();
renderizarAnuncios();