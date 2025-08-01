document.addEventListener('DOMContentLoaded', () => {
  fetch('1.txt')
    .then(response => response.text())
    .then(str => {
      // Si el archivo contiene <Tournament> es XML, si no, es mensaje personalizado
      if (!str.includes('<Tournament')) {
        mostrarMensajePersonalizado(str);
        return;
      }

      // ----------- Normal: archivo de torneo -------------
      const parser = new DOMParser();
      const xml = parser.parseFromString(str, 'text/xml');
      const tournamentData = xml;
      const currentRoundNode = tournamentData.querySelector('CurrentRound');
      const currentRound = parseInt(currentRoundNode?.textContent || "0", 10);

      document.getElementById('rondaInfo').textContent = `Ronda: ${currentRound}`;
      document.getElementById('searchID').style.display = '';
      document.getElementById('footer').style.display = '';
      document.getElementById('logoLCG').style.display = '';
      document.getElementById('tableContainer').style.display = '';
      document.getElementById('historyContainer').style.display = '';

      // Limpia mensaje personalizado si hubiera
      let customMsg = document.getElementById('mensajePersonalizado');
      if (customMsg) customMsg.style.display = 'none';
    })
    .catch(() => {
      mostrarMensajePersonalizado('No se encontró el archivo de torneo.');
    });

  function mostrarMensajePersonalizado(mensaje) {
    // Oculta todo menos el logo y el mensaje
    document.getElementById('rondaInfo').textContent = '';
    document.getElementById('searchID').style.display = 'none';
    document.getElementById('footer').style.display = 'none';
    document.getElementById('tableContainer').style.display = 'none';
    document.getElementById('historyContainer').style.display = 'none';
    document.getElementById('logoLCG').style.display = ''; // Logo opaco de fondo

    // Muestra el mensaje centrado
    let customMsg = document.getElementById('mensajePersonalizado');
    if (!customMsg) {
      customMsg = document.createElement('div');
      customMsg.id = 'mensajePersonalizado';
      customMsg.style.position = 'relative';
      customMsg.style.textAlign = 'center';
      customMsg.style.margin = '60px 20px 0 20px';
      customMsg.style.fontSize = '1.3em';
      customMsg.style.color = '#fff';
      customMsg.style.fontWeight = 'bold';
      customMsg.style.lineHeight = '1.5';
      document.body.appendChild(customMsg);
    }
    customMsg.innerText = mensaje.trim();
    customMsg.style.display = '';
  }
});
