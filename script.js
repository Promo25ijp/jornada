const fechaEvento = new Date('2025-09-17T07:00:00');
let cuentaTerminada = false;

const countdownOverlay = document.getElementById('countdown-overlay');
const countdownEl = document.getElementById('countdown');
const introOverlay = document.getElementById('intro-overlay');
const mainContent = document.querySelector('.container');

function isMobile() {
    return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
}

function iniciarIntro() {
    cuentaTerminada = true;
    countdownOverlay.style.opacity = '0';

    setTimeout(() => {
        countdownOverlay.style.display = 'none';
        introOverlay.classList.add("active");

        if (!isMobile()) {
            const video = document.createElement('video');
            video.id = 'intro-video';
            video.autoplay = true;
            video.muted = true;
            video.playsInline = true;
            video.innerHTML = `<source src="./img/video.mp4" type="video/mp4">`;
            introOverlay.appendChild(video);

            video.addEventListener('ended', () => {
                introOverlay.classList.remove("active");
                mainContent.style.display = 'flex';
                document.body.classList.add('show-background');
            });
        } else {
            const gif = document.getElementById('intro-gif');
            gif.src = gif.src.split("?")[0] + "?" + new Date().getTime();
            setTimeout(() => {
                introOverlay.classList.remove("active");
                mainContent.style.display = 'flex';
                document.body.classList.add('show-background');
            }, 4000);
        }
    }, 500);
}

function actualizarCuentaRegresiva() {
    if (cuentaTerminada) return;

    const ahora = new Date();
    const diferencia = fechaEvento - ahora;

    if (diferencia <= 0) {
        clearInterval(intervalo);
        iniciarIntro();
        return;
    }

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diferencia / (1000 * 60)) % 60);
    const segundos = Math.floor((diferencia / 1000) % 60);

    countdownEl.innerHTML = `${dias}d ${horas}h ${minutos}m ${segundos}s`;
}

mainContent.style.display = 'none';
if (new Date() >= fechaEvento) {
    iniciarIntro();
} else {
    actualizarCuentaRegresiva();
    var intervalo = setInterval(actualizarCuentaRegresiva, 1000);
}

// =====================
// SISTEMA DEPORTES
// =====================
const container = document.querySelector('.container');
const deportesContainer = document.getElementById('deportes');
const fixtureContainer = document.getElementById('fixture');
const diasContainer = document.getElementById('dias-container'); // 👈 div vacío en el HTML para los botones

let cicloActivo = null;

document.getElementById('ciclo-basico').addEventListener('click', () => toggleDeportes('basico'));
document.getElementById('ciclo-orientado').addEventListener('click', () => toggleDeportes('orientado'));

function toggleDeportes(nivel) {
    // Si ya hay un ciclo activo distinto, limpiamos primero
    if (cicloActivo && cicloActivo !== nivel) {
        diasContainer.innerHTML = '';
        deportesContainer.innerHTML = '';
        fixtureContainer.innerHTML = '';
        fixtureContainer.style.display = 'none';
    }

    if (cicloActivo === nivel) {
        cicloActivo = null;
        diasContainer.innerHTML = '';
        deportesContainer.innerHTML = '';
        fixtureContainer.innerHTML = '';
        fixtureContainer.style.display = 'none';
        container.classList.remove('expanded');
    } else {
        cicloActivo = nivel;
        container.classList.add('expanded');
        fixtureContainer.innerHTML = '';
        fixtureContainer.style.display = 'none';
        loadDias(nivel);
    }
}


function loadDias(nivel) {
    diasContainer.innerHTML = '';
    diasContainer.className = nivel;

    const diasDisponibles = nivel === "basico" ? ["miercoles", "jueves"] : ["miercoles", "viernes"];

    diasDisponibles.forEach(dia => {
        const btn = document.createElement("button");
        btn.innerText = dia.charAt(0).toUpperCase() + dia.slice(1);
        btn.classList.add("day-btn");
        btn.addEventListener("click", () => {
            diasContainer.querySelectorAll("button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            loadDeportes(nivel, dia);
        });
        diasContainer.appendChild(btn);
    });
}

function loadDeportes(nivel, diaSeleccionado) {
    deportesContainer.innerHTML = '';

    let deportes = [
        { nombre: "Fútbol masculino", emoji: "⚽" },
        { nombre: "Fútbol femenino", emoji: "⚽" },
        { nombre: "Vóley", emoji: "🏐" },
        { nombre: "Handball", emoji: "🤾" },
        { nombre: "Básquet", emoji: "🏀" },
        { nombre: "Pata Tenis", emoji: "👟" },
        { nombre: "Show de talentos", emoji: "🌟" }
    ];

    if (nivel === "orientado") {
        deportes = deportes.filter(d => d.nombre !== "Handball");
    }

    deportes.forEach(deporte => {
        const div = document.createElement('div');
        div.className = `deporte ${nivel}`;
        div.innerHTML = `<span>${deporte.emoji} ${deporte.nombre}</span>`;
        div.addEventListener('click', () => {
            loadFixture(nivel, deporte.nombre, diaSeleccionado);
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

function loadFixture(nivel, deporte, dia) {
    fixtureContainer.innerHTML = '<div style="text-align: center; padding: 20px;"><div class="loading"></div></div>';
    fixtureContainer.style.display = 'block';

    const apiURL = 'https://script.google.com/macros/s/AKfycbyFEG-LLZa4yiHslCYXKoum5YdBYx95e4eUYd8Jrr4AVrirkt3zhONUxYxNl0T1g-N4/exec';

    const renderFixture = (data) => {
        const deporteNormalizado = normalize(deporte);
        const esEventoEspecial = ["show de talentos", "concurso de dibujo"].includes(deporteNormalizado);

        fixtureContainer.innerHTML = '';

        if (esEventoEspecial) {
            const fixture = data.talentos.filter(item =>
                normalize(item.Nivel) === normalize(nivel) &&
                normalize(item.talento) === deporteNormalizado
            );

            if (fixture.length === 0) {
                fixtureContainer.innerHTML = '<div style="text-align: center; padding: 30px; color: #666; font-size: 1.1rem;">📅 No hay presentaciones programadas.</div>';
                return;
            }

            const table = document.createElement('table');
            table.classList.add('fixture-table');
            const headerRow = document.createElement('tr');
            const thColor = nivel === 'basico'
                ? 'linear-gradient(135deg, #044b97, #3742fa)'
                : 'linear-gradient(135deg, #b60909, #ff4757)';

            ['🕐 Hora', 'Nombre/Grupo','📍 Lugar'].forEach(text => {
                const th = document.createElement('th');
                th.innerText = text;
                th.style.background = thColor;
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);

            fixture.forEach(show => {
                const row = document.createElement('tr');
                const hora = formatHora(show.Hora);
                [hora, show["Nombre/Grupo"], show.Lugar].forEach(value => {
                    const td = document.createElement('td');
                    td.innerText = value;
                    row.appendChild(td);
                });
                table.appendChild(row);
            });

            fixtureContainer.appendChild(table);
        } else {
            const fixtureDia = data.deportes.filter(item =>
                normalize(item.Nivel) === normalize(nivel) &&
                normalize(item.Deporte) === deporteNormalizado &&
                normalize(item.Dia) === dia
            );

            if (fixtureDia.length === 0) {
                fixtureContainer.innerHTML = '<div style="text-align: center; padding: 30px; color: #666;">📅 No hay partidos para este día.</div>';
                return;
            }

            const fases = ["fase de grupos", "semifinal", "final"];
            fases.forEach(fase => {
                const partidosFase = fixtureDia.filter(m => m.fase && normalize(m.fase) === normalize(fase));

                if (partidosFase.length > 0) {
                    const tituloFase = document.createElement("h3");
                    tituloFase.innerText = `🏅 ${fase.charAt(0).toUpperCase() + fase.slice(1)}`;
                    tituloFase.style.textAlign = "center";
                    fixtureContainer.appendChild(tituloFase);

                    const table = document.createElement("table");
                    table.classList.add("fixture-table");

                    const headerRow = document.createElement("tr");
                    const thColor = nivel === 'basico'
                        ? 'linear-gradient(135deg, #044b97, #3742fa)'
                        : 'linear-gradient(135deg, #b60909, #ff4757)';

                    ['🕐', 'Equipo 1', 'Equipo 2', '📍 Lugar', '🏆'].forEach(text => {
                        const th = document.createElement('th');
                        th.innerText = text;
                        th.style.background = thColor;
                        headerRow.appendChild(th);
                    });
                    table.appendChild(headerRow);

                    partidosFase.forEach(match => {
                        const row = document.createElement("tr");
                        const hora = formatHora(match.Hora);
                        [hora, match.equipo1, match.equipo2, match.Lugar, match.Ganador || "-"].forEach((value, index) => {
                            const td = document.createElement("td");
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

                        if (match.fase) {
                            if (match.fase.toLowerCase().includes("semifinal")) {
                                const semifinales = partidosFase;
                                if (semifinales.length > 0) {
                                    let texto = "Semifinales\n\n";
                                    semifinales.forEach(sf => {
                                        texto += `${sf.equipo1} vs ${sf.equipo2}\n\n`;
                                    });
                                    mostrarGanador(texto.trim());
                                }
                            } else if (match.fase.toLowerCase().includes("final") && match.Ganador && match.Ganador !== '-') {
                                mostrarGanador(`Ganador\n${match.Ganador}`);
                            }
                        }
                    });

                    fixtureContainer.appendChild(table);
                }
            });
        }
    };

    if (cachedData) {
        setTimeout(() => renderFixture(cachedData), 300);
    } else {
        fetch(apiURL)
            .then(r => r.json())
            .then(data => {
                const dias = ["miercoles", "jueves", "viernes"];
                let deportesConDia = [];
                dias.forEach(dia => {
                    if (data[dia]) {
                        const registros = data[dia].map(item => ({ ...item, Dia: dia }));
                        deportesConDia = deportesConDia.concat(registros);
                    }
                });
                cachedData = { deportes: deportesConDia, talentos: data.talentos || [] };
                setTimeout(() => renderFixture(cachedData), 300);
            });
    }
}

// =====================
// GANADOR OVERLAY
// =====================
function mostrarGanador(texto) {
    const overlay = document.getElementById("winner-overlay");
    const nameEl = document.getElementById("winner-name");
    nameEl.innerHTML = texto.replace(/\n/g, "<br>");
    overlay.classList.add("active");
    setTimeout(() => overlay.classList.remove("active"), 3000);
}
