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
    }
}

function loadDeportes(nivel) {
    deportesContainer.innerHTML = '';

    const deportes = [
        "Fútbol masculino",
        "Fútbol femenino",
        "Vóley",
        "Handball",
        "Pata tennis",
        "Torneo de FIFA",
        "Torneo de Counter Strike",
        "Show de talentos",
        "Concurso de dibujo"
    ];

    deportes.forEach(deporte => {
        const div = document.createElement('div');
        div.className = `deporte ${nivel}`;
        div.innerText = deporte;
        div.addEventListener('click', () => loadFixture(nivel, deporte));
        deportesContainer.appendChild(div);
    });
}

// 🔤 Normaliza texto: quita acentos y convierte a minúsculas
function normalize(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// ⏰ Convierte la hora ISO rara de Excel a HH:MM
function formatHora(fechaString) {
    const date = new Date(fechaString);

    // Obtener hora local (no UTC)
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');

    return `${horas}:${minutos}`;
}



let cachedData = null;

function loadFixture(nivel, deporte) {
    fixtureContainer.innerHTML = '';
    fixtureContainer.style.display = 'block';

    const apiURL = 'https://script.google.com/macros/s/AKfycbxxmzfbYD1Oc7pB0Xnl4hfyhx5J6ACQtM524iuUP7js0RfqFCKGfAVK5245OQBJ-2Ed/exec';

    const renderFixture = (data) => {
        const fixture = data.filter(item =>
            normalize(item.Nivel) === normalize(nivel) &&
            normalize(item.Deporte) === normalize(deporte)
        );

        if (fixture.length === 0) {
            fixtureContainer.innerText = 'No hay partidos para este deporte y nivel.';
            return;
        }

        const table = document.createElement('table');
        table.classList.add('fixture-table');

        const headerRow = document.createElement('tr');
        ['Hora', 'Equipo 1', 'Equipo 2', 'Lugar', 'Ganador'].forEach(text => {
    const th = document.createElement('th');
    th.innerText = text;
    headerRow.appendChild(th);
});


        table.appendChild(headerRow);

        fixture.forEach(match => {
            const row = document.createElement('tr');
            const hora = formatHora(match.Hora);
            [hora, match.equipo1, match.equipo2, match.Lugar, match.Ganador].forEach((value, index) => {
    const td = document.createElement('td');
    
    // Si es la columna del ganador
    if (index === 4 && value !== '-') {
        td.style.fontWeight = 'bold';
        td.style.color = 'green';
    }

    td.innerText = value;
    row.appendChild(td);
});


            table.appendChild(row);
        });

        const tableWrapper = document.createElement('div');
        tableWrapper.classList.add('fixture-table-container');
        tableWrapper.appendChild(table);
        fixtureContainer.appendChild(tableWrapper);

    };

    if (cachedData) {
        renderFixture(cachedData);
    } else {
        fetch(apiURL)
            .then(response => response.json())
            .then(data => {
                cachedData = data;
                console.log("Datos cargados desde la API:", data); // 👈 VERIFICÁ ESTO
                renderFixture(data);
            })
            .catch(error => {
                fixtureContainer.innerText = 'Error al cargar los datos.';
                console.error('Error al recuperar datos:', error);
            });
    }
}


