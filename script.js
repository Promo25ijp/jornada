const countdownOverlay = document.getElementById('countdown-overlay');
const countdownEl = document.getElementById('countdown');
const mainContent = document.querySelector('.container');

const fechaEvento = new Date('2025-09-17T07:00:00');

function actualizarCuentaRegresiva() {
    const ahora = new Date();
    const diferencia = fechaEvento - ahora;

    if (diferencia <= 0) {
        countdownOverlay.style.opacity = '0';
        setTimeout(() => {
            countdownOverlay.style.display = 'none';
            mainContent.style.display = 'flex';
        }, 1000);
        return;
    }

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diferencia / (1000 * 60)) % 60);
    const segundos = Math.floor((diferencia / 1000) % 60);

    countdownEl.innerHTML = `${dias}d ${horas}h ${minutos}m ${segundos}s`;
}

mainContent.style.display = 'none';
actualizarCuentaRegresiva();
setInterval(actualizarCuentaRegresiva, 1000);

const container = document.querySelector('.container');
const deportesContainer = document.getElementById('deportes');
const fixtureContainer = document.getElementById('fixture');

let cicloActivo = null;

document.getElementById('ciclo-basico').addEventListener('click', () => toggleDeportes('basico'));
document.getElementById('ciclo-orientado').addEventListener('click', () => toggleDeportes('orientado'));

function toggleDeportes(nivel) {
    if (cicloActivo === nivel) {
        cicloActivo = null;
        deportesContainer.innerHTML = '';
        fixtureContainer.innerHTML = '';
        fixtureContainer.style.display = 'none';
        container.classList.remove('expanded');
    } else {
        cicloActivo = nivel;
        container.classList.add('expanded');
        loadDeportes(nivel);
        // Cerrar la tabla al cambiar de ciclo (corrección 2)
        fixtureContainer.innerHTML = '';
        fixtureContainer.style.display = 'none';
    }
}

function loadDeportes(nivel) {
    deportesContainer.innerHTML = '';

    const deportes = [
        { nombre: "Fútbol masculino", emoji: "⚽" },
        { nombre: "Fútbol femenino", emoji: "⚽" },
        { nombre: "Vóley", emoji: "🏐" },
        { nombre: "Handball", emoji: "🤾" },
        { nombre: "Pata Tenis", emoji: "👟" },
        { nombre: "Torneo de Counter Strike", emoji: "🔫" },
        { nombre: "Show de talentos", emoji: "🌟" },
        { nombre: "Concurso de dibujo", emoji: "🎨" }
    ];

    deportes.forEach(deporte => {
        const div = document.createElement('div');
        div.className = `deporte ${nivel}`;
        div.innerHTML = `<span>${deporte.emoji} ${deporte.nombre}</span>`;
        div.addEventListener('click', () => {
            loadFixture(nivel, deporte.nombre);
            // Llevar scroll hasta la tabla (corrección 1)
            setTimeout(() => {
                fixtureContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 350);
        });
        deportesContainer.appendChild(div);
    });
}

function normalize(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function formatHora(fechaString) {
    const date = new Date(fechaString);
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
}

let cachedData = null;

function loadFixture(nivel, deporte) {
    fixtureContainer.innerHTML = '<div style="text-align: center; padding: 20px;"><div class="loading"></div></div>';
    fixtureContainer.style.display = 'block';

    const apiURL = 'https://script.google.com/macros/s/AKfycbxxmzfbYD1Oc7pB0Xnl4hfyhx5J6ACQtM524iuUP7js0RfqFCKGfAVK5245OQBJ-2Ed/exec';

    const renderFixture = (data) => {
        const fixture = data.filter(item =>
            normalize(item.Nivel) === normalize(nivel) &&
            normalize(item.Deporte) === normalize(deporte)
        );

        if (fixture.length === 0) {
            fixtureContainer.innerHTML = '<div style="text-align: center; padding: 30px; color: #666; font-size: 1.1rem;">📅 No hay partidos programados para este deporte y nivel.</div>';
            return;
        }

        const table = document.createElement('table');
        table.classList.add('fixture-table');

        const headerRow = document.createElement('tr');
        const thColor = nivel === 'basico'
            ? 'linear-gradient(135deg, #044b97, #3742fa)'
            : 'linear-gradient(135deg, #b60909, #ff4757)';

        ['🕐 Hora', 'Equipo 1', 'Equipo 2', '📍 Lugar', '🏆 Ganador'].forEach(text => {
            const th = document.createElement('th');
            th.innerText = text;
            th.style.background = thColor;
            headerRow.appendChild(th);
        });

        table.appendChild(headerRow);

        fixture.forEach(match => {
            const row = document.createElement('tr');
            const hora = formatHora(match.Hora);
            [hora, match.equipo1, match.equipo2, match.Lugar, match.Ganador || '-'].forEach((value, index) => {
                const td = document.createElement('td');

                if (index === 4 && value !== '-') {
                    td.style.fontWeight = 'bold';
                    td.style.color = '#27ae60';
                    td.innerHTML = `🏆 ${value}`;
                } else {
                    td.innerText = value;
                }

                row.appendChild(td);
            });

            table.appendChild(row);
        });

        const tableWrapper = document.createElement('div');
        tableWrapper.classList.add('fixture-table-container');
        tableWrapper.appendChild(table);
        fixtureContainer.innerHTML = '';
        fixtureContainer.appendChild(tableWrapper);
    };

    if (cachedData) {
        setTimeout(() => renderFixture(cachedData), 300);
    } else {
        fetch(apiURL)
            .then(response => response.json())
            .then(data => {
                cachedData = data;
                setTimeout(() => renderFixture(data), 300);
            })
            .catch(error => {
                fixtureContainer.innerHTML = '<div style="text-align: center; padding: 30px; color: #e74c3c; font-size: 1.1rem;">❌ Error al cargar los datos. Intenta nuevamente.</div>';
                console.error('Error al recuperar datos:', error);
            });
    }
}
