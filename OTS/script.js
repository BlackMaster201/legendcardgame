let tournamentData = null;
let currentRound = null;

function padId(id) {
  return String(id).padStart(10, '0');
}

function mostrarMensajePersonalizado(texto) {
  document.getElementById('tableContainer').style.display = 'none';
  document.getElementById('historyContainer').style.display = 'none';
  let msg = document.getElementById('mensajePersonalizado');
  if (!msg) {
    msg = document.createElement('div');
    msg.id = 'mensajePersonalizado';
    msg.className = 'custom-message';
    document.querySelector('.container').appendChild(msg);
  }
  msg.innerText = texto;
  msg.style.display = '';
}

function ocultarMensajePersonalizado() {
  let msg = document.getElementById('mensajePersonalizado');
  if (msg) msg.style.display = 'none';
  document.getElementById('tableContainer').style.display = '';
  document.getElementById('historyContainer').style.display = '';
}

async function cargarTorneo(yBuscar = false) {
  const response = await fetch('1.txt');
  const text = await response.text();

  if (text.trim().startsWith('<?xml')) {
    const parser = new DOMParser();
    tournamentData = parser.parseFromString(text, 'text/xml');
    const currentRoundNode = tournamentData.querySelector('CurrentRound');
    currentRound = parseInt(currentRoundNode?.textContent || "0", 10);
    document.getElementById('rondaInfo').textContent = `Ronda: ${currentRound}`;
    ocultarMensajePersonalizado();
    if (yBuscar) buscarEmparejamientos();
  } else {
    document.getElementById('rondaInfo').textContent = '';
    mostrarMensajePersonalizado(text);
  }
}

function getPlayerInfo(id) {
  if (!tournamentData) return null;
  const players = Array.from(tournamentData.querySelectorAll('TournPlayer'));
  const playerNode = players.find(p => padId(p.querySelector('ID')?.textContent) === id);
  if (!playerNode) return null;
  const nombre = `${playerNode.querySelector('FirstName')?.textContent || ''} ${playerNode.querySelector('LastName')?.textContent || ''}`.trim();
  const rank = playerNode.querySelector('Rank')?.textContent;
  let standing = rank ? parseInt(rank, 10) : '-';
  let medal = '';
  if (standing === 1) medal = ' 🥇';
  if (standing === 2) medal = ' 🥈';
  if (standing === 3) medal = ' 🥉';
  const dropRound = playerNode.querySelector('DropRound')?.textContent || '';
  const isDrop = dropRound && parseInt(dropRound, 10) > 0;
  return { nombre, standing, medal, isDrop };
}

function buscarEmparejamientos() {
  mostrarRonda();
  mostrarHistorial();
}

function mostrarRonda() {
  const inputRaw = document.getElementById('konamiId').value.trim();
  const input = padId(inputRaw);
  localStorage.setItem('konamiId', input);

  if (!tournamentData || !input) {
    document.getElementById('tableContainer').innerHTML = '';
    return;
  }

  const matches = Array.from(tournamentData.querySelectorAll('TournMatch'));

  let encontrado = false;
  let emparejamiento = null;
  let nombreJugador = '';
  let nombreOponente = '';
  let idOponente = '';
  let mesa = '';

  for (const match of matches) {
    const round = parseInt(match.querySelector('Round')?.textContent || "0", 10);
    if (round !== currentRound) continue;
    const p1 = padId(match.querySelectorAll('Player')[0]?.textContent || "");
    const p2 = padId(match.querySelectorAll('Player')[1]?.textContent || "");
    if (input === p1 || input === p2) {
      encontrado = true;
      emparejamiento = match;
      mesa = match.querySelector('Table')?.textContent || '';
      idOponente = input === p1 ? p2 : p1;
      const infoJugador = getPlayerInfo(input);
      const infoOpo = getPlayerInfo(idOponente);
      nombreJugador = infoJugador ? infoJugador.nombre : '';
      nombreOponente = infoOpo ? infoOpo.nombre : '';
      break;
    }
  }

  const tableContainer = document.getElementById('tableContainer');
  if (encontrado) {
    tableContainer.innerHTML = `
      <div class="mesa"><span>MESA ${mesa}</span></div>
      <div class="card">
        <div class="linea-roja"></div>
          <div class="jugador">${nombreJugador}</div>
          <div class="konami">${input}</div>
          <div class="vs-label">VS</div>
          <div class="oponente">${nombreOponente || "BYE"}</div>
          <div class="konami-opo">${idOponente || ""}</div>
        <div class="linea-azul"></div>
      </div>
    `;
  } else {
    tableContainer.innerHTML = `<div style="text-align:center;font-size:1.1rem;font-weight:bold;margin-top:32px;">No se encontró el Konami ID o no tienes emparejamiento esta ronda.</div>`;
  }
}

function mostrarHistorial() {
  const historyContainer = document.getElementById('historyContainer');
  const inputRaw = document.getElementById('konamiId').value.trim();
  const input = padId(inputRaw);

  if (!tournamentData || !input) {
    historyContainer.innerHTML = '';
    return;
  }

  const matches = Array.from(tournamentData.querySelectorAll('TournMatch'));
  const infoJugador = getPlayerInfo(input);
  const nombreJugador = infoJugador ? infoJugador.nombre : '';
  const standing = infoJugador ? infoJugador.standing : '-';
  const medalJugador = infoJugador ? infoJugador.medal : '';

  let historial = [];
  matches.forEach(match => {
    const p1 = padId(match.querySelectorAll('Player')[0]?.textContent || "");
    const p2 = padId(match.querySelectorAll('Player')[1]?.textContent || "");
    const round = parseInt(match.querySelector('Round')?.textContent || "0", 10);
    const winner = padId(match.querySelector('Winner')?.textContent || "");
    if (input === p1 || input === p2) {
      const idOponente = input === p1 ? p2 : p1;
      const infoOpo = getPlayerInfo(idOponente);
      const nombreOponente = infoOpo ? infoOpo.nombre : '';
      let resultado = 'Empate';
      if (winner === input) resultado = 'Victoria';
      else if (winner === idOponente) resultado = 'Derrota';
      historial.push({
        ronda: round,
        resultado,
        nombreOponente,
        idOponente,
      });
    }
  });

  historial.sort((a, b) => b.ronda - a.ronda);

  let standingHTML = `<div class="standing-box">Standing: <span>${standing || '-'}</span>${medalJugador}</div>
  <div class="jugador-historial">${nombreJugador}</div>`;

  let content = standingHTML;

  historial.forEach(({ ronda, resultado, nombreOponente }) => {
    let colorBarra = '';
    let colorTexto = '';
    if (resultado === 'Victoria') {
      colorBarra = 'result-win';
      colorTexto = 'result-win';
    } else if (resultado === 'Derrota') {
      colorBarra = 'result-loss';
      colorTexto = 'result-loss';
    } else {
      colorBarra = 'result-draw';
      colorTexto = 'result-draw';
    }

    content += `
      <div class="historial-caja">
        <div class="historial-barra ${colorBarra}"></div>
        <div class="contenido-historial">
          <div class="ronda-resultado ${colorTexto}">Ronda ${ronda} - ${resultado}</div>
          <div class="vs-nombre">VS ${nombreOponente}</div>
        </div>
      </div>
    `;
  });

  historyContainer.innerHTML = content;
}

// Alternar pestañas
document.getElementById('btnRonda').addEventListener('click', () => {
  document.getElementById('tableContainer').style.display = '';
  document.getElementById('historyContainer').style.display = 'none';
  document.getElementById('btnRonda').classList.add('active');
  document.getElementById('btnHistorial').classList.remove('active');
});

document.getElementById('btnHistorial').addEventListener('click', () => {
  document.getElementById('tableContainer').style.display = 'none';
  document.getElementById('historyContainer').style.display = '';
  document.getElementById('btnHistorial').classList.add('active');
  document.getElementById('btnRonda').classList.remove('active');
});

// Buscar cuando se presione el botón o ENTER
document.getElementById('btnBuscar').addEventListener('click', () => {
  cargarTorneo(true);
});
document.getElementById('konamiId').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') cargarTorneo(true);
});

// Al cargar la página, SIEMPRE mostrar la pestaña Ronda por defecto
document.addEventListener('DOMContentLoaded', () => {
  cargarTorneo(true);
  const lastId = localStorage.getItem('konamiId');
  if (lastId) {
    document.getElementById('konamiId').value = lastId;
    setTimeout(() => cargarTorneo(true), 300);
    document.getElementById('tableContainer').style.display = '';
    document.getElementById('historyContainer').style.display = 'none';
    document.getElementById('btnRonda').classList.add('active');
    document.getElementById('btnHistorial').classList.remove('active');
  }
});
