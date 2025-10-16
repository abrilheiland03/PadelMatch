let usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
const sessionChip = document.getElementById('session-chip');
const btnHome = document.getElementById('btn-home');
const btnLogout = document.getElementById('btn-logout');
const perfilNombre = document.getElementById('perfil-nombre');
const formPublicidad = document.getElementById('form-publicidad');
const listaAnuncios = document.getElementById('lista-anuncios');

let anuncios = JSON.parse(localStorage.getItem('anuncios')) || [];

function asegurarSesionLocal() {
  if (!usuarioActual || usuarioActual.rol !== 'local') {
    window.location.href = '../../inicio/index.html';
  }
}

function guardar() { localStorage.setItem('anuncios', JSON.stringify(anuncios)); }

function renderPerfil() {
  sessionChip.textContent = `${usuarioActual.nombre} • ${usuarioActual.rol}`;
  perfilNombre.textContent = usuarioActual.nombre;
}

function renderAnuncios() {
  listaAnuncios.innerHTML = '';
  anuncios.filter(a => a.autor === usuarioActual.nombre).forEach(a => {
    const el = document.createElement('div');
    el.className = 'item';
    el.innerHTML = `
      <div class="muted">${a.marca}</div>
      <div><strong>${a.titulo}</strong></div>
      <div>${a.descripcion}</div>
    `;
    listaAnuncios.appendChild(el);
  });
}

if (btnHome) btnHome.addEventListener('click', ()=> window.location.href='../../inicio/index.html');
if (btnLogout) btnLogout.addEventListener('click', ()=> { localStorage.removeItem('usuarioActual'); window.location.href='../../inicio/index.html'; });

if (formPublicidad) {
  formPublicidad.addEventListener('submit', (e) => {
    e.preventDefault();
    const marca = formPublicidad.marca.value.trim();
    const titulo = formPublicidad.titulo.value.trim();
    const descripcion = formPublicidad.descripcion.value.trim();
    if (!marca || !titulo || !descripcion) { alert('Completa todos los campos.'); return; }
    anuncios.push({ autor: usuarioActual.nombre, autorRol: 'local', marca, titulo, descripcion, ts: Date.now() });
    guardar();
    renderAnuncios();
    formPublicidad.reset();
  });
}

asegurarSesionLocal();
renderPerfil();
renderAnuncios();


