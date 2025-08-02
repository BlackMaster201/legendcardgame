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

async function cargarTorneo() {
  const response = await fetch('1.txt', {cache: "reload"});
  const text = await response.text();

  // Si el archivo parece XML, parsea normalmente
  if (text.trim().startsWith('<?xml')) {
    const parser = new DOMParser();
    tournamentData = parser.parseFromString(text, 'text/xml');
    const currentRoundNode = tournamentData.querySelector('CurrentRound');
    currentRound = parseInt(currentRoundNode?.textContent || "0", 10);
    document.getElementById('rondaInfo').textContent = `Ronda: ${currentRound}`;
    ocultarMensajePersonalizado();
    buscarEmparejamientos();
  } else {
    tournamentData = null;
    document.getElementById('rondaInfo').textContent = '';
    mostrarMensajePersonalizado(text);
    document.getElementById('tableContainer').innerHTML = '';
    document.getElementById('historyContainer').innerHTML = '';
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
  const dropRound = playerNode.querySelector('DropRound')?.textContent || '';
  const isDrop = dropRound && parseInt(dropRound, 10) > 0;
  return { nombre, standing, isDrop };
}

function getMedalla(standing) {
  if (parseInt(standing) === 1) return "🥇";
  if (parseInt(standing) === 2) return "🥈";
  if (parseInt(standing) === 3) return "🥉";
  return "";
}

function getStandingColor(standing) {
  if (parseInt(standing) === 1) return "#FFD700";
  if (parseInt(standing) === 2) return "#B0C4DE";
  if (parseInt(standing) === 3) return "#CD7F32";
  return "#fff";
}

function buscarEmparejamientos() {
  const inputRaw = document.getElementById('konamiId').value.trim();
  const input = padId(inputRaw);
  localStorage.setItem('konamiId', input);

  if (!tournamentData || !input) return;

  const matches = Array.from(tournamentData.querySelectorAll('TournMatch'));
  let encontrado = false;
  let emparejamiento = null;
  let nombreJugador = '';
  let nombreOponente = '';
  let idOponente = '';
  let mesa = '';
  let standingJugador = '-';

  // Standing y nombre jugador
  const infoJugador = getPlayerInfo(input);
  if (infoJugador) {
    nombreJugador = infoJugador.nombre;
    standingJugador = infoJugador.standing;
  }

  // Emparejamiento actual
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
      const infoOpo = getPlayerInfo(idOponente);
      nombreOponente = infoOpo ? infoOpo.nombre : '';
      break;
    }
  }

  // Mostrar ronda actual
  const tableContainer = document.getElementById('tableContainer');
  if (encontrado) {
    tableContainer.innerHTML = `
      <div class="mesa"><span>Mesa: ${mesa}</span></div>
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

  // Mostrar historial
  mostrarHistorial(input, standingJugador, nombreJugador);
}

function mostrarHistorial(input, standing, nombreJugador) {
  const historyContainer = document.getElementById('historyContainer');
  if (!tournamentData) {
    historyContainer.innerHTML = '';
    return;
  }
  const matches = Array.from(tournamentData.querySelectorAll('TournMatch'));

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

  // Standing con color y medalla
  let colorStanding = getStandingColor(standing);
  let standingHTML = `<div class="standing-box" style="color:${colorStanding};font-weight:bold;">
      Standing: ${getMedalla(standing)} <span>${standing || '-'}</span>
    </div>
    <div class="jugador" style="text-align:center; font-weight:bold; color:#fff; margin-bottom: 10px;">${nombreJugador}</div>`;

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

// BOTÓN DE BUSCAR Y ACTUALIZAR
document.getElementById('btnBuscar').addEventListener('click', () => {
  cargarTorneo();
  setTimeout(buscarEmparejamientos, 200);
});

// Al cambiar el ID o al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarTorneo();
  const lastId = localStorage.getItem('konamiId');
  if (lastId) {
    document.getElementById('konamiId').value = lastId;
    setTimeout(buscarEmparejamientos, 300);
  }
  document.getElementById('konamiId').addEventListener('input', buscarEmparejamientos);

  // Permitir Enter para buscar
  document.getElementById('konamiId').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      cargarTorneo();
      setTimeout(buscarEmparejamientos, 200);
    }
  });
});
