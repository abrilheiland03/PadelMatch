let usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
const sessionChip = document.getElementById('session-chip');
const btnHome = document.getElementById('btn-home');
const btnLogout = document.getElementById('btn-logout');
const perfilNombre = document.getElementById('perfil-nombre');
const formTorneo = document.getElementById('form-torneo');
const listaTorneos = document.getElementById('lista-torneos');

let torneos = JSON.parse(localStorage.getItem('torneos')) || [];

function asegurarSesionComplejo() {
  if (!usuarioActual || usuarioActual.rol !== 'complejo') {
    window.location.href = '../../inicio/index.html';
  }
}

function guardar() { localStorage.setItem('torneos', JSON.stringify(torneos)); }

function renderPerfil() {
  sessionChip.textContent = `${usuarioActual.nombre} • ${usuarioActual.rol}`;
  perfilNombre.textContent = usuarioActual.nombre;
}

function renderTorneos() {
  listaTorneos.innerHTML = '';
  torneos.filter(t => t.creador === usuarioActual.nombre).forEach(t => {
    const el = document.createElement('div');
    el.className = 'item';
    el.innerHTML = `
      <div><strong>${t.categoria}</strong> • <span class="muted">${t.fecha}</span></div>
      <div class="muted">${t.direccion}</div>
      <div>Parejas: ${t.parejas} • Premios: ${t.premios}</div>
    `;
    listaTorneos.appendChild(el);
  });
}

if (btnHome) btnHome.addEventListener('click', ()=> window.location.href='../../inicio/index.html');
if (btnLogout) btnLogout.addEventListener('click', ()=> { localStorage.removeItem('usuarioActual'); window.location.href='../../inicio/index.html'; });

if (formTorneo) {
  formTorneo.addEventListener('submit', (e) => {
    e.preventDefault();
    const direccion = formTorneo.direccion.value.trim();
    const categoria = formTorneo.categoria.value;
    const parejas = parseInt(formTorneo.parejas.value, 10);
    const fecha = formTorneo.fecha.value;
    const premios = formTorneo.premios.value.trim();
    if (!direccion || !categoria || !fecha || !premios || !parejas || parejas < 2) { alert('Completa todos los campos correctamente.'); return; }
    torneos.push({ creador: usuarioActual.nombre, direccion, categoria, parejas, fecha, premios });
    guardar();
    renderTorneos();
    formTorneo.reset();
  });
}

asegurarSesionComplejo();
renderPerfil();
renderTorneos();


