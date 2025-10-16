// Estado
let solicitudes = JSON.parse(localStorage.getItem('solicitudes')) || [];
const calificaciones = JSON.parse(localStorage.getItem('calificaciones')) || {};
let usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null; // { nombre, rol }

// Referencias
const sessionChip = document.getElementById('session-chip');
const btnHome = document.getElementById('btn-home');
const btnLogout = document.getElementById('btn-logout');
const perfilNombre = document.getElementById('perfil-nombre');
const perfilRating = document.getElementById('perfil-rating');
const formSolicitud = document.getElementById('form-solicitud');
const listaSolicitudes = document.getElementById('lista-solicitudes');
// Exportación/Importación eliminadas
const btnLinkSolicitudes = document.getElementById('btn-link-solicitudes');
const statusSolicitudes = document.getElementById('status-solicitudes');
const btnLinkCanchas = document.getElementById('btn-link-canchas');
const statusCanchas = document.getElementById('status-canchas');

function asegurarSesionJugador() {
  if (!usuarioActual || usuarioActual.rol !== 'jugador') {
    window.location.href = '../../inicio/index.html';
  }
}

function guardar() { localStorage.setItem('solicitudes', JSON.stringify(solicitudes)); }

function promedioCalificacion(nombre) {
  const arr = calificaciones[nombre] || [];
  if (!arr.length) return 0;
  return arr.reduce((a,b)=>a+b,0) / arr.length;
}

function estrellas(n) {
  const full = Math.round(n);
  return Array.from({length:5}, (_,i)=> i < full ? '★' : '☆').join('');
}

function renderPerfil() {
  sessionChip.textContent = `${usuarioActual.nombre} • ${usuarioActual.rol}`;
  perfilNombre.textContent = usuarioActual.nombre;
  const prom = promedioCalificacion(usuarioActual.nombre);
  perfilRating.textContent = estrellas(prom);
}

function renderSolicitudes() {
  listaSolicitudes.innerHTML = '';
  solicitudes
    .slice()
    .sort((a,b)=> new Date(a.horario) - new Date(b.horario))
    .forEach((s) => {
      const disponible = s.cuposRestantes > 0;
      const el = document.createElement('div');
      el.className = 'item';
      el.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <div><strong>${s.categoria}</strong> • <span class="muted">${new Date(s.horario).toLocaleString()}</span></div>
          <div class="muted">Creador: ${s.creador}</div>
        </div>
        <div class="muted">${s.direccion}</div>
        <div>Cupos: <strong>${s.inscriptos.length}</strong> / ${s.jugadores}</div>
        <div style="display:flex; gap:8px;">
          <button data-inscribirse="${s.id}" class="btn btn-primary" ${disponible ? '' : 'disabled'}>${disponible ? 'Inscribirme' : 'Completo'}</button>
          ${s.creador === usuarioActual.nombre ? '<button data-cancelar="'+s.id+'" class="btn">Cancelar</button>' : ''}
        </div>
      `;
      listaSolicitudes.appendChild(el);
    });

  listaSolicitudes.querySelectorAll('[data-inscribirse]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-inscribirse');
      inscribirse(id);
    });
  });
  listaSolicitudes.querySelectorAll('[data-cancelar]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-cancelar');
      cancelarSolicitud(id);
    });
  });
}

function crearSolicitud(data) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  solicitudes.push({
    id,
    creador: usuarioActual.nombre,
    jugadores: data.jugadores,
    categoria: data.categoria,
    direccion: data.direccion,
    horario: data.horario,
    inscriptos: [],
    cuposRestantes: data.jugadores
  });
  guardar();
  renderSolicitudes();
  escribirSolicitudesJsonVinculado();
}

function inscribirse(id) {
  const s = solicitudes.find(x => x.id === id);
  if (!s) return;
  if (s.cuposRestantes <= 0) return;
  if (s.inscriptos.includes(usuarioActual.nombre)) return;
  s.inscriptos.push(usuarioActual.nombre);
  s.cuposRestantes = Math.max(0, s.jugadores - s.inscriptos.length);
  guardar();
  renderSolicitudes();
}

function cancelarSolicitud(id) {
  const idx = solicitudes.findIndex(x => x.id === id);
  if (idx === -1) return;
  if (solicitudes[idx].creador !== usuarioActual.nombre) return;
  solicitudes.splice(idx, 1);
  guardar();
  renderSolicitudes();
}

// Import/Export JSON
// (Exportación removida)

// (Importación de JSON removida)

// Navegación
if (btnHome) { btnHome.addEventListener('click', ()=> window.location.href = '../../inicio/index.html'); }
if (btnLogout) {
  btnLogout.addEventListener('click', ()=> {
    localStorage.removeItem('usuarioActual');
    window.location.href = '../../inicio/index.html';
  });
}

if (formSolicitud) {
  formSolicitud.addEventListener('submit', (e) => {
    e.preventDefault();
    const jugadores = parseInt(formSolicitud.jugadores.value, 10);
    const canchaSel = formSolicitud.cancha.value;
    const direccion = canchaSel;
    const categoria = formSolicitud.categoria.value;
    const horario = formSolicitud.horario.value;
    if (!jugadores || jugadores < 1 || jugadores > 3) { alert('Jugadores entre 1 y 3.'); return; }
    if (!direccion || direccion.length < 3) { alert('Dirección inválida.'); return; }
    if (!categoria) { alert('Selecciona una categoría.'); return; }
    if (!horario) { alert('Selecciona un horario.'); return; }
    crearSolicitud({ jugadores, direccion, categoria, horario });
    formSolicitud.reset();
  });
}

// Seed inicial desde script JSON si no hay datos
(function cargarSeedSiVacio(){
  if (solicitudes.length) return;
  const seedEl = document.getElementById('seed-solicitudes');
  if (!seedEl) return;
  try {
    const data = JSON.parse(seedEl.textContent || '[]');
    if (Array.isArray(data)) {
      solicitudes = data;
      guardar();
      renderSolicitudes();
    }
  } catch(_) {}
})();

// Vinculación de archivos mediante File System Access API
let handleSolicitudes = null;
let handleCanchas = null;

async function escribirSolicitudesJsonVinculado() {
  if (!handleSolicitudes || !window.showOpenFilePicker) return;
  try {
    const writable = await handleSolicitudes.createWritable();
    await writable.write(new Blob([JSON.stringify(solicitudes, null, 2)], { type: 'application/json' }));
    await writable.close();
    if (statusSolicitudes) statusSolicitudes.textContent = 'solicitudes.json actualizado';
  } catch (_) {
    if (statusSolicitudes) statusSolicitudes.textContent = 'No se pudo escribir solicitudes.json';
  }
}

if (btnLinkSolicitudes && window.showOpenFilePicker) {
  btnLinkSolicitudes.addEventListener('click', async () => {
    try {
      const [h] = await window.showOpenFilePicker({ types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }], multiple: false });
      handleSolicitudes = h;
      if (statusSolicitudes) statusSolicitudes.textContent = 'Archivo vinculado';
    } catch (_) {
      if (statusSolicitudes) statusSolicitudes.textContent = 'No se vinculó archivo';
    }
  });
}

if (btnLinkCanchas && window.showOpenFilePicker) {
  btnLinkCanchas.addEventListener('click', async () => {
    try {
      const [h] = await window.showOpenFilePicker({ types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }], multiple: false });
      handleCanchas = h;
      if (statusCanchas) statusCanchas.textContent = 'Archivo vinculado';
      const file = await h.getFile();
      const text = await file.text();
      const canchas = JSON.parse(text);
      poblarSelectCanchas(canchas);
    } catch (_) {
      if (statusCanchas) statusCanchas.textContent = 'No se vinculó archivo';
    }
  });
}

function poblarSelectCanchas(canchas) {
  const sel = document.querySelector('select[name="cancha"]');
  if (!sel) return;
  sel.querySelectorAll('option:not(:first-child)').forEach(o => o.remove());
  canchas.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.nombre;
    opt.textContent = `${c.nombre} — ${c.direccion}`;
    sel.appendChild(opt);
  });
}

// Cargar canchas al select desde seed embebido
(function cargarCanchas(){
  const sel = document.querySelector('select[name="cancha"]');
  if (!sel) return;
  const seed = document.getElementById('seed-canchas');
  if (!seed) return;
  try {
    const canchas = JSON.parse(seed.textContent || '[]');
    poblarSelectCanchas(canchas);
  } catch(_) {}
})();

// Init
asegurarSesionJugador();
renderPerfil();
renderSolicitudes();


