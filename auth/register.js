const form = document.getElementById('form-register');
const msg = document.getElementById('msg');
const btnBack = document.getElementById('btn-back');
const selRol = document.getElementById('sel-rol');
const fieldsJugador = document.getElementById('fields-jugador');
const fieldsComplejo = document.getElementById('fields-complejo');
const fieldsLocal = document.getElementById('fields-local');
const btnLinkFile = document.getElementById('btn-link-file');
const linkStatus = document.getElementById('link-status');

let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
let fileHandle = null; // File System Access API (solo en navegadores compatibles)

if (form) {
  if (selRol) {
    selRol.addEventListener('change', () => {
      const rol = selRol.value;
      fieldsJugador.style.display = rol === 'jugador' ? '' : 'none';
      fieldsComplejo.style.display = rol === 'complejo' ? '' : 'none';
      fieldsLocal.style.display = rol === 'local' ? '' : 'none';
    });
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    msg.textContent = '';
    const usuario = form.usuario.value.trim();
    const password = form.password.value;
    const rol = form.rol.value;
    if (!usuario || !password || !rol) { msg.textContent = 'Completá usuario, contraseña y rol.'; return; }

    let nuevo = { usuario, password, rol, nombre: '', apellido: '', categoria: '-' };
    if (rol === 'jugador') {
      const nombre = form.nombre.value.trim();
      const apellido = form.apellido.value.trim();
      const categoria = form.categoria.value || '';
      if (!nombre || !apellido || !categoria) { msg.textContent = 'Completá nombre, apellido y categoría.'; return; }
      nuevo.nombre = nombre; nuevo.apellido = apellido; nuevo.categoria = categoria;
    }
    if (rol === 'complejo') {
      const nombreComplejo = form.nombreComplejo.value.trim();
      const direccionComplejo = form.direccionComplejo.value.trim();
      if (!nombreComplejo || !direccionComplejo) { msg.textContent = 'Completa nombre y dirección del complejo.'; return; }
      nuevo.nombre = nombreComplejo; nuevo.apellido = '-'; nuevo.categoria = '-';
      nuevo.direccion = direccionComplejo;
    }
    if (rol === 'local') {
      const nombreLocal = form.nombreLocal.value.trim();
      const direccionLocal = form.direccionLocal.value.trim();
      if (!nombreLocal) { msg.textContent = 'Completa el nombre del local.'; return; }
      nuevo.nombre = nombreLocal; nuevo.apellido = '-'; nuevo.categoria = '-';
      if (direccionLocal) nuevo.direccion = direccionLocal;
    }
    if (usuarios.some(u => u.usuario === usuario)) { msg.textContent = 'El usuario ya existe.'; return; }
    usuarios.push(nuevo);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    // Intentar escribir en data/usuarios.json usando File System Access API si el usuario lo vinculó
    (async () => {
      if (fileHandle && window.showSaveFilePicker) {
        try {
          const writable = await fileHandle.createWritable();
          await writable.write(new Blob([JSON.stringify(usuarios, null, 2)], { type: 'application/json' }));
          await writable.close();
          msg.textContent = 'Cuenta creada y usuarios.json actualizado. Redirigiendo al login...';
        } catch (_) {
          msg.textContent = 'Cuenta creada. No se pudo escribir usuarios.json. Redirigiendo al login...';
        }
      } else {
        msg.textContent = 'Cuenta creada. Para actualizar data/usuarios.json, vinculá el archivo y vuelve a intentar.';
      }
      setTimeout(() => { window.location.href = './login.html'; }, 1000);
    })();
  });
}

if (btnBack) {
  btnBack.addEventListener('click', () => window.location.href = './login.html');
}

// Vincular archivo data/usuarios.json (opcional) para escritura directa
if (btnLinkFile && window.showOpenFilePicker) {
  btnLinkFile.addEventListener('click', async () => {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
        multiple: false
      });
      fileHandle = handle;
      linkStatus.textContent = 'Archivo vinculado: usuarios.json';
    } catch (_) {
      linkStatus.textContent = 'No se vinculó ningún archivo';
    }
  });
}


