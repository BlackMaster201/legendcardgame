// Detectar si el archivo es solo texto o XML de torneo
fetch('1.txt')
  .then(resp => resp.text())
  .then(texto => {
    if (!texto.includes('<Tournament>')) {
      // Mostrar solo el mensaje central
      document.getElementById("mensajePersonalizado").style.display = "block";
      document.getElementById("mensajePersonalizado").textContent = texto.trim();

      document.getElementById("konamiId").style.display = "none";
      document.getElementById("tableContainer").style.display = "none";
      document.getElementById("historyContainer").style.display = "none";
      document.getElementById("btnRonda").style.display = "none";
      document.getElementById("btnHistorial").style.display = "none";
      document.getElementById("rondaInfo").style.display = "none";
    } else {
      document.getElementById("mensajePersonalizado").style.display = "none";
      document.getElementById("konamiId").style.display = "";
      document.getElementById("tableContainer").style.display = "";
      document.getElementById("historyContainer").style.display = "none";
      document.getElementById("btnRonda").style.display = "";
      document.getElementById("btnHistorial").style.display = "";
      document.getElementById("rondaInfo").style.display = "";

      // -------- APP DE PAREOS NORMAL --------
      let tournamentData = null, currentRound = 0;
      const input = document.getElementById("konamiId");
      const btnRonda = document.getElementById("btnRonda");
      const btnHistorial = document.getElementById("btnHistorial");
      const tableContainer = document.getElementById("tableContainer");
      const historyContainer = document.getElementById("historyContainer");
      const rondaInfo = document.getElementById("rondaInfo");

      function padId(id) {
        return String(id).padStart(10, "0");
      }

      function getStanding(kid) {
        const allPlayers = Array.from(tournamentData.querySelectorAll('TournPlayer'));
        for (let p of allPlayers) {
          let pid = padId(p.querySelector('ID')?.textContent || "");
          if (pid === kid) {
            let standing = p.querySelector("Rank")?.textContent || "-";
            let dropRound = p.querySelector("DropRound")?.textContent || "0";
            let drop = (dropRound && parseInt(dropRound) > 0);
            let txt = "";
            if (parseInt(standing) === 1) txt += "🥇 ";
            else if (parseInt(standing) === 2) txt += "🥈 ";
            else if (parseInt(standing) === 3) txt += "🥉 ";
            txt += `${standing}º${drop ? " - Drop" : ""}`;
            return txt;
          }
        }
        return "-";
      }

      function buscarEmparejamientos() {
        const konamiId = padId(input.value.trim());
        if (!konamiId || !tournamentData) return;

        const matches = Array.from(tournamentData.querySelectorAll('TournMatch'));
        const players = Array.from(tournamentData.querySelectorAll('TournPlayer'));
        const jugadorNode = players.find(p => padId(p.querySelector('ID')?.textContent) === konamiId);

        if (!jugadorNode) {
          tableContainer.innerHTML = `<div class="card"><b>No se encontró el Konami ID.</b></div>`;
          historyContainer.innerHTML = "";
          return;
        }

        // Mostrar ronda actual
        let rondaActual = tournamentData.querySelector("CurrentRound")?.textContent || "0";
        rondaActual = parseInt(rondaActual);

        rondaInfo.textContent = `Ronda: ${rondaActual}`;

        // Encontrar emparejamiento de la ronda actual
        let match = matches.find(m => {
          let round = parseInt(m.querySelector("Round")?.textContent || "0");
          let p1 = padId(m.querySelectorAll("Player")[0]?.textContent || "");
          let p2 = padId(m.querySelectorAll("Player")[1]?.textContent || "");
          return round === rondaActual && (p1 === konamiId || p2 === konamiId);
        });

        // Datos del jugador y oponente
        if (match) {
          let mesa = match.querySelector("Table")?.textContent || "-";
          let p1 = padId(match.querySelectorAll("Player")[0]?.textContent || "");
          let p2 = padId(match.querySelectorAll("Player")[1]?.textContent || "");
          let esP1 = p1 === konamiId;
          let opId = esP1 ? p2 : p1;
          let jugador = players.find(p => padId(p.querySelector('ID')?.textContent) === konamiId);
          let oponente = players.find(p => padId(p.querySelector('ID')?.textContent) === opId);

          let nombreJugador = jugador ? `${jugador.querySelector("FirstName")?.textContent || ""} ${jugador.querySelector("LastName")?.textContent || ""}` : "";
          let nombreOponente = oponente ? `${oponente.querySelector("FirstName")?.textContent || ""} ${oponente.querySelector("LastName")?.textContent || ""}` : "";
          let idOponente = oponente ? padId(oponente.querySelector("ID")?.textContent || "") : "";

          tableContainer.innerHTML = `
            <div class="card">
              <div class="mesa">MESA ${mesa}</div>
              <div class="jugador">${nombreJugador}</div>
              <div class="konami">${konamiId}</div>
              <div class="vs-label">VS</div>
              <div class="oponente">${nombreOponente || "BYE"}</div>
              <div class="konami-opo">${idOponente || ""}</div>
            </div>
          `;
        } else {
          tableContainer.innerHTML = `<div class="card"><b>No tienes duelo en la ronda actual.</b></div>`;
        }

        // Mostrar historial
        let historial = [];
        matches.forEach(m => {
          let round = parseInt(m.querySelector("Round")?.textContent || "0");
          let p1 = padId(m.querySelectorAll("Player")[0]?.textContent || "");
          let p2 = padId(m.querySelectorAll("Player")[1]?.textContent || "");
          if (p1 === konamiId || p2 === konamiId) {
            let opId = (p1 === konamiId) ? p2 : p1;
            let winner = padId(m.querySelector("Winner")?.textContent || "");
            let resultado = "Empate";
            if (winner === konamiId) resultado = "Victoria";
            else if (winner === opId) resultado = "Derrota";
            historial.push({
              round,
              opId,
              resultado
            });
          }
        });

        // Ordenar de más reciente a más antiguo
        historial.sort((a, b) => b.round - a.round);

        // STANDING
        let standing = getStanding(konamiId);

        historyContainer.innerHTML = `
          <div class="standing-box">${standing}</div>
          ${historial.map(item => {
            let oponente = players.find(p => padId(p.querySelector('ID')?.textContent) === item.opId);
            let nombreOponente = oponente ? `${oponente.querySelector("FirstName")?.textContent || ""} ${oponente.querySelector("LastName")?.textContent || ""}` : "BYE";
            let color =
              item.resultado === "Victoria" ? "result-win" :
              item.resultado === "Derrota" ? "result-loss" :
              "result-draw";
            return `
              <div class="historial-caja">
                <span class="ronda-resultado ${color}">Ronda ${item.round} - ${item.resultado}</span>
                <span class="vs-nombre">VS ${nombreOponente}</span>
              </div>
            `;
          }).join('')}
        `;
      }

      // Cargar el archivo y activar eventos
      const parser = new DOMParser();
      tournamentData = parser.parseFromString(texto, "text/xml");
      input.addEventListener("change", buscarEmparejamientos);
      input.addEventListener("keyup", (e) => {
        if (e.key === "Enter") buscarEmparejamientos();
      });
      btnRonda.onclick = () => {
        btnRonda.classList.add("active");
        btnHistorial.classList.remove("active");
        tableContainer.style.display = "";
        historyContainer.style.display = "none";
      };
      btnHistorial.onclick = () => {
        btnHistorial.classList.add("active");
        btnRonda.classList.remove("active");
        tableContainer.style.display = "none";
        historyContainer.style.display = "";
      };

      // Restaurar el último ID buscado
      if (localStorage.getItem("konamiId")) {
        input.value = localStorage.getItem("konamiId");
        buscarEmparejamientos();
      }
      input.addEventListener("input", () => {
        localStorage.setItem("konamiId", input.value.trim());
      });
    }
  })
  .catch(() => {
    document.getElementById("mensajePersonalizado").style.display = "block";
    document.getElementById("mensajePersonalizado").textContent = "No se encontró el archivo 1.txt";
    document.getElementById("konamiId").style.display = "none";
    document.getElementById("tableContainer").style.display = "none";
    document.getElementById("historyContainer").style.display = "none";
    document.getElementById("btnRonda").style.display = "none";
    document.getElementById("btnHistorial").style.display = "none";
    document.getElementById("rondaInfo").style.display = "none";
  });
