document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        const loader = document.getElementById('loader-wrapper');
        if (loader) {
            loader.classList.add('loaded');
            setTimeout(() => {
                loader.style.opacity = '0';
                loader.style.visibility = 'hidden';
                setTimeout(() => loader.remove(), 500);
            }, 400);
        }
    }, 1600);
});

let datosCompletos = null;
let indicacionesData = null;
let edificioActualId = "";

const destinosGlobales = [
    "Edificio Rigoberto Lopez Perez", "Edificio Posgrado", "Laboratorios robotica", 
    "Laboratorios redes", "Cajero Automático", "Cafetería El Chele", "Cafetería El Duarte", 
    "Cafetería El Güegüense", "La mita", "Batidos Miranda", "Pabellon 1 IES", 
    "Pabellon 2 IES", "Pabellon 3 IES", "Edificio Albert Einstein", "Laboratorios IES", 
    "Copias UNI", "Autoservicio de impresiones", "Entrada Principal", "Entrada IES", 
    "Parqueo Posgrado", "Parqueo edificio rigoberto", "Registro academico", 
    "Edificio Arquitectura", "Edificio Quimica", "Piscina", "Auditorio Salomon de la Selva", 
    "Edificio Carlos Santos Berroterán", "Biblioteca Central", "RapiCopias Castellón"
].sort();

window.manejarSeleccionDestino = function(destino) {
    if (!destino) return;
    if (document.getElementById('vista-destinos') || window.location.pathname.includes('destinos.html')) {
        const selectDestino = document.getElementById("destino");
        const btnIr = document.getElementById("btnIr");
        
        if (selectDestino && btnIr) {
            let optionExists = Array.from(selectDestino.options).some(opt => opt.value === destino);
            if (!optionExists) {
                let opt = document.createElement('option');
                opt.value = destino;
                opt.text = destino;
                selectDestino.appendChild(opt);
            }
            selectDestino.value = destino;
            btnIr.click();
            document.getElementById("navegacion-asistida").scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            if (typeof window.abrirSimulacion === 'function') window.abrirSimulacion(destino);
            else abrirSimulacion(destino);
        }
    } else {
        localStorage.setItem('destinoBuscadoSimple', destino);
        window.location.href = 'destinos.html';
    }
};

window.transformarBuscadoresEnSelect = function() {
    const selectInicio = document.getElementById('busquedaDestino');
    if (selectInicio && selectInicio.tagName === 'SELECT' && selectInicio.options.length <= 1) {
        destinosGlobales.forEach(destino => {
            const opt = document.createElement('option');
            opt.value = destino;
            opt.text = destino;
            selectInicio.appendChild(opt);
        });
        selectInicio.addEventListener('change', function() {
            if (this.value) {
                window.manejarSeleccionDestino(this.value);
                this.value = ""; 
            }
        });
    }

    const selectModal = document.getElementById('busquedaDestinoModal');
    if (selectModal && selectModal.options.length <= 1) {
        destinosGlobales.forEach(destino => {
            const opt = document.createElement('option');
            opt.value = destino;
            opt.text = destino;
            selectModal.appendChild(opt);
        });
        selectModal.addEventListener('change', function() {
            if (this.value) {
                window.manejarSeleccionDestino(this.value);
                this.value = ""; 
            }
        });
    }
};

fetch('navbar.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('menu-contenedor').innerHTML = data;
    const navDestinos = document.getElementById('nav-destinos');
    if (navDestinos) navDestinos.classList.add('activo');
    window.transformarBuscadoresEnSelect();
  }).catch(() => console.log('Navbar no encontrado'));

window.buscarDestinoModal = function() {
    const selectModal = document.getElementById('busquedaDestinoModal');
    if (selectModal && selectModal.value) {
        window.manejarSeleccionDestino(selectModal.value);
        const modal = document.getElementById('searchModal');
        const overlay = document.getElementById('searchOverlay');
        if(modal) modal.classList.remove('active');
        if(overlay) overlay.classList.remove('active');
        selectModal.value = ""; 
    }
};

window.toggleSearchModal = function() {
    const modal = document.getElementById('searchModal');
    const overlay = document.getElementById('searchOverlay');
    if (modal) modal.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
    window.transformarBuscadoresEnSelect();
};

window.cambiarVista = function (idVista) {
  document.querySelectorAll('.vista').forEach(vista => vista.classList.remove('activa'));
  document.getElementById(idVista).classList.add('activa');
  window.scrollTo(0, 0);
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('activo'));
  if (event && event.currentTarget && event.currentTarget.classList) {
    event.currentTarget.classList.add('activo');
  }
  const navMovil = document.querySelector('nav.main-nav');
  if (navMovil && navMovil.classList.contains('active')) {
    navMovil.classList.remove('active');
  }
}

window.toggleMenuMovil = function () {
  document.querySelector('nav.main-nav').classList.toggle('active');
}

document.addEventListener("DOMContentLoaded", async () => {

  const rutasPosibles = [
    './Json/destinos.json', './json/destinos.json', 'Json/destinos.json',
    'json/destinos.json', '../Json/destinos.json', '../json/destinos.json'
  ];

  let dataCargada = null;
  for (const ruta of rutasPosibles) {
    try {
      const response = await fetch(ruta);
      if (response.ok) {
        dataCargada = await response.json();
        console.log("JSON cargado desde:", ruta);
        break;
      }
    } catch (e) {}
  }

  if (!dataCargada) {
    console.error("No se pudo cargar destinos.json");
    return;
  }

  datosCompletos = dataCargada;
  renderizarCategoria(datosCompletos.categorias.principales, 'track-principales');
  renderizarCategoria(datosCompletos.categorias.laboratorios, 'track-laboratorios');
  renderizarCategoria(datosCompletos.categorias.cafetines, 'track-cafetines');
  inicializarCarruseles();

  function renderizarCategoria(items, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;
    let html = items.map(item => `
      <div class="card">
        <div class="card-img-container">
          <img src="${item.img}" alt="${item.nombre}" onerror="this.onerror=null; this.src='https://via.placeholder.com/400x200/001f3f/ffffff?text=${encodeURIComponent(item.nombre)}';">
        </div>
        <div class="card-body">
          <h3>${item.nombre}</h3>
          <p>${item.desc}</p>
          <button class="btn-select" onclick="${item.tipo === 'complejo' ? `window.abrirModalPisos('${item.id}')` : `window.abrirSimulacion('${item.nombre}', '${item.media || item.img}', '${item.tipoMedia || 'imagen'}', '${item.id}')`}">
            <span class="material-icons" style="font-size:18px; vertical-align: middle;">360</span> Entrar
          </button>
        </div>
      </div>
    `).join('');
    contenedor.innerHTML = html;
  }

  function inicializarCarruseles() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.anim-element').forEach((el) => observer.observe(el));

    document.querySelectorAll('.contenedor-slider').forEach(contenedor => {
      const sliderTrack = contenedor.querySelector('.carousel-track');
      const botonAnterior = contenedor.querySelector('.boton-slider.anterior');
      const botonSiguiente = contenedor.querySelector('.boton-slider.siguiente');
      if (sliderTrack && botonAnterior && botonSiguiente) {
        let cantidadDesplazamiento = 0;
        const card = sliderTrack.querySelector('.card');
        const anchoSlide = card ? card.offsetWidth + 20 : 320;
        function actualizarVisibilidadBotones() {
          botonAnterior.style.display = cantidadDesplazamiento <= 0 ? 'none' : 'flex';
          botonSiguiente.style.display = cantidadDesplazamiento >= sliderTrack.scrollWidth - sliderTrack.clientWidth - 10 ? 'none' : 'flex';
        }
        botonSiguiente.addEventListener('click', () => {
          const desplazamientoMaximo = sliderTrack.scrollWidth - sliderTrack.clientWidth;
          cantidadDesplazamiento = Math.min(cantidadDesplazamiento + anchoSlide, desplazamientoMaximo);
          sliderTrack.scrollTo({ left: cantidadDesplazamiento, behavior: 'smooth' });
          setTimeout(actualizarVisibilidadBotones, 300);
        });
        botonAnterior.addEventListener('click', () => {
          cantidadDesplazamiento = Math.max(cantidadDesplazamiento - anchoSlide, 0);
          sliderTrack.scrollTo({ left: cantidadDesplazamiento, behavior: 'smooth' });
          setTimeout(actualizarVisibilidadBotones, 300);
        });
        sliderTrack.addEventListener('wheel', (e) => {
          sliderTrack.scrollLeft += e.deltaY;
          cantidadDesplazamiento = sliderTrack.scrollLeft;
          actualizarVisibilidadBotones();
        }, { passive: true });
        sliderTrack.addEventListener('scroll', () => {
          cantidadDesplazamiento = sliderTrack.scrollLeft;
          actualizarVisibilidadBotones();
        });
        actualizarVisibilidadBotones();
      }
    });
  }
});

function calcularDistancia(coord1, coord2) {
    if (!coord1 || !coord2) return 0;
    const R = 6371e3;
    const φ1 = coord1[0] * Math.PI / 180;
    const φ2 = coord2[0] * Math.PI / 180;
    const Δφ = (coord2[0] - coord1[0]) * Math.PI / 180;
    const Δλ = (coord2[1] - coord1[1]) * Math.PI / 180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

document.addEventListener('DOMContentLoaded', function () {
  let mapa;
  let userMarker;
  let markerPulse;
  let lineaRuta = null;
  let rutaActiva = null;
  let pasoActual = 0;
  let userLocation = null;
  
  const sitiosUNI = {
    "Edificio Rigoberto Lopez Perez": [12.131795792366901, -86.26988943520622],
    "Edificio Posgrado": [12.131009312952209, -86.27012610686415],
    "Laboratorios robotica": [12.131584651748083, -86.27005832378829],
    "Laboratorios redes": [12.12897799279944, -86.26963729145416],
    "Cajero": [12.128732715683613, -86.26999540370072],
    "Cafetin el chele": [12.130425471825298, -86.27054166943908],
    "Cafetin El Duarte": [12.130516172843175, -86.26998792094867],
    "Cafetin EL Gueguense": [12.132155478384627, -86.2704627539127],
    "La mita": [12.12981213040029, -86.26985736622525],
    "Batidos Miranda": [12.13216668645582, -86.27065887811888],
    "Pabellon 1 IES": [12.131981369972088, -86.27086467145331],
    "Pabellon 2 IES": [12.132192465418543, -86.27090490458653],
    "Pabellon 3 IES": [12.132315713614327, -86.27097061870413],
    "Edificio Albert Einstein": [12.131887915661862, -86.2704855286818],
    "Laboratorios IES": [12.132152859333264, -86.27083395225783],
    "Copias UNI": [12.13053395719282, -86.27045150893927],
    "Autoservicio de impresiones": [12.129091217122017, -86.27057892767442],
    "Entrada Principal": [12.129222488740314, -86.27027854062317],
    "Entrada IES": [12.13144814009071, -86.27106191565036],
    "Entrada Trasera": [12.132836010391078, -86.26883320255943],
    "Parqueo Posgrado": [12.130806261883121, -86.27004596357038],
    "Parqueo edificio rigoberto": [12.132240605882307, -86.26940334418464],
    "Registro academico": [12.129346707202687, -86.27020754103975],
    "Edificio Arquitectura": [12.129290529982416, -86.26991042954135],
    "Edificio Quimica": [12.12891915159251, -86.26961484455204],
    "Piscina": [12.12945410736998, -86.2699139108461],
    "Auditorio Salomon de la Selva": [12.131729141982937, -86.27069090194155],
    "Edificio Carlos Santos Berroterán": [12.131721857663178, -86.27102664352297],
    "Biblioteca": [12.131143624844496, -86.27087762197696],
    "Cafetin El Deportivo": [12.130877631060027, -86.27074259503898],
    "Cafetin El Comal": [12.129897227413625, -86.27048857927917],
    "Cafetin La Fritanga": [12.130201, -86.270503]
  };

  const conexionesRed = {
    "Entrada Principal": ["Registro academico", "Autoservicio de impresiones", "Edificio Arquitectura", "Piscina"],
    "Registro academico": ["Entrada Principal", "Edificio Arquitectura", "Cajero", "Cafetin el chele", "Cafetin El Comal"],
    "Edificio Arquitectura": ["Entrada Principal", "Registro academico", "Edificio Quimica", "Piscina"],
    "Edificio Quimica": ["Edificio Arquitectura", "Laboratorios redes"],
    "Piscina": ["Entrada Principal", "Edificio Arquitectura", "La mita"],
    "Cajero": ["Registro academico", "Laboratorios redes"],
    "Laboratorios redes": ["Edificio Quimica", "Cajero", "La mita"],
    "Autoservicio de impresiones": ["Entrada Principal"],
    "Cafetin El Comal": ["Registro academico", "Cafetin el chele", "Cafetin La Fritanga"],
    "Cafetin La Fritanga": ["Cafetin El Comal", "Cafetin el chele"],
    "Cafetin el chele": ["Registro academico", "Cafetin El Comal", "Cafetin La Fritanga", "Cafetin El Deportivo", "Biblioteca"],
    "Cafetin El Deportivo": ["Cafetin el chele", "Biblioteca"],
    "Biblioteca": ["Cafetin el chele", "Cafetin El Deportivo", "Entrada IES", "Edificio Rigoberto Lopez Perez", "Edificio Posgrado"],
    "Copias UNI": ["Parqueo Posgrado", "Edificio Posgrado"],
    "Parqueo Posgrado": ["Copias UNI", "Edificio Posgrado"],
    "Edificio Posgrado": ["Parqueo Posgrado", "Copias UNI", "Cafetin El Duarte", "La mita", "Laboratorios robotica", "Edificio Rigoberto Lopez Perez", "Biblioteca"],
    "Cafetin El Duarte": ["Edificio Posgrado", "La mita"],
    "La mita": ["Edificio Posgrado", "Cafetin El Duarte", "Piscina", "Laboratorios redes"],
    "Laboratorios robotica": ["Edificio Posgrado", "Edificio Rigoberto Lopez Perez"],
    "Edificio Rigoberto Lopez Perez": ["Biblioteca", "Edificio Posgrado", "Laboratorios robotica", "Entrada IES", "Edificio Albert Einstein", "Auditorio Salomon de la Selva", "Cafetin EL Gueguense", "Batidos Miranda", "Parqueo edificio rigoberto", "Edificio Carlos Santos Berroterán", "Pabellon 1 IES"],
    "Entrada IES": ["Biblioteca", "Edificio Rigoberto Lopez Perez", "Edificio Albert Einstein", "Pabellon 1 IES"],
    "Edificio Albert Einstein": ["Edificio Rigoberto Lopez Perez", "Entrada IES", "Pabellon 1 IES"],
    "Pabellon 1 IES": ["Edificio Rigoberto Lopez Perez", "Entrada IES", "Edificio Albert Einstein", "Pabellon 2 IES", "Laboratorios IES"],
    "Pabellon 2 IES": ["Pabellon 1 IES", "Pabellon 3 IES", "Laboratorios IES"],
    "Pabellon 3 IES": ["Pabellon 2 IES"],
    "Laboratorios IES": ["Pabellon 1 IES", "Pabellon 2 IES"],
    "Auditorio Salomon de la Selva": ["Edificio Rigoberto Lopez Perez", "Edificio Carlos Santos Berroterán"],
    "Edificio Carlos Santos Berroterán": ["Edificio Rigoberto Lopez Perez", "Auditorio Salomon de la Selva"],
    "Cafetin EL Gueguense": ["Edificio Rigoberto Lopez Perez", "Batidos Miranda"],
    "Batidos Miranda": ["Edificio Rigoberto Lopez Perez", "Cafetin EL Gueguense"],
    "Parqueo edificio rigoberto": ["Edificio Rigoberto Lopez Perez", "Entrada Trasera"],
    "Entrada Trasera": ["Parqueo edificio rigoberto"]
  };

  function encontrarRutaOptimaEnRed(origen, destino) {
    if (origen === destino) return { puntos: [sitiosUNI[origen]], nodosRuta: [origen], distancia: 0 };
    if (conexionesRed[origen] && conexionesRed[origen].includes(destino)) {
      return { puntos: [sitiosUNI[origen], sitiosUNI[destino]], nodosRuta: [origen, destino], distancia: calcularDistancia(sitiosUNI[origen], sitiosUNI[destino]) };
    }
    const distancias = {}, anterior = {}, visitados = new Set(), noVisitados = new Set(Object.keys(sitiosUNI));
    for (let n of noVisitados) distancias[n] = Infinity;
    distancias[origen] = 0;
    while (noVisitados.size > 0) {
      let nodoActual = null, menorDistancia = Infinity;
      for (let n of noVisitados) { if (distancias[n] < menorDistancia) { menorDistancia = distancias[n]; nodoActual = n; } }
      if (nodoActual === null || nodoActual === destino || distancias[nodoActual] === Infinity) break;
      noVisitados.delete(nodoActual); visitados.add(nodoActual);
      for (let v of (conexionesRed[nodoActual] || [])) {
        if (visitados.has(v)) continue;
        const d = distancias[nodoActual] + calcularDistancia(sitiosUNI[nodoActual], sitiosUNI[v]);
        if (d < distancias[v]) { distancias[v] = d; anterior[v] = nodoActual; }
      }
    }
    if (!anterior[destino] && origen !== destino) return null;
    const ruta = [destino]; let actual = destino;
    while (anterior[actual]) { actual = anterior[actual]; ruta.unshift(actual); }
    let distTotal = 0; const pts = ruta.map(n => sitiosUNI[n]);
    for (let i = 1; i < pts.length; i++) distTotal += calcularDistancia(pts[i-1], pts[i]);
    return { puntos: pts, nodosRuta: ruta, distancia: distTotal };
  }

  function mapearRutaAutomatica(origenCoords, destinoCoords, nombreOrigen, nombreDestino) {
    console.log('===== MAPEO CON RED OPTIMIZADA =====');
    console.log(`   Origen: ${nombreOrigen} → Destino: ${nombreDestino}`);
    const origenEsSitio = !!sitiosUNI[nombreOrigen], destinoEsSitio = !!sitiosUNI[nombreDestino];
    let puntoRedOrigen = origenEsSitio ? { nombre: nombreOrigen, coordenadas: sitiosUNI[nombreOrigen], distancia: 0 } : encontrarPuntoMasCercano(origenCoords);
    let puntoRedDestino = destinoEsSitio ? { nombre: nombreDestino, coordenadas: sitiosUNI[nombreDestino], distancia: 0 } : encontrarPuntoMasCercano(destinoCoords);
    if (puntoRedOrigen.nombre === puntoRedDestino.nombre && origenEsSitio && destinoEsSitio) {
      return { ruta: [origenCoords], distanciaTotal: 0, instrucciones: [{ punto: destinoCoords, texto: `Ya te encuentras en ${nombreDestino}`, distancia: 0 }] };
    }
    const rutaRed = encontrarRutaOptimaEnRed(puntoRedOrigen.nombre, puntoRedDestino.nombre);
    const distLineaRecta = calcularDistancia(puntoRedOrigen.coordenadas, puntoRedDestino.coordenadas);
    let rutaElegida, nodosUsados = [];
    if (rutaRed) {
      const pctExtra = (rutaRed.distancia - distLineaRecta) / distLineaRecta;
      if ((distLineaRecta < 60 && pctExtra > 0.5) || (pctExtra > 0.6 && rutaRed.nodosRuta.length > 3)) {
        rutaElegida = { puntos: [puntoRedOrigen.coordenadas, puntoRedDestino.coordenadas], nodosRuta: [puntoRedOrigen.nombre, puntoRedDestino.nombre], distancia: distLineaRecta };
        console.log(`   Atajo directo (${Math.round(distLineaRecta)}m vs red ${Math.round(rutaRed.distancia)}m)`);
      } else { rutaElegida = rutaRed; console.log(`   Red: ${rutaRed.nodosRuta.join(' → ')} (${Math.round(rutaRed.distancia)}m)`); }
    } else {
      rutaElegida = { puntos: [puntoRedOrigen.coordenadas, puntoRedDestino.coordenadas], nodosRuta: [puntoRedOrigen.nombre, puntoRedDestino.nombre], distancia: distLineaRecta };
      console.log(`   Linea recta (sin ruta en red): ${Math.round(distLineaRecta)}m`);
    }
    nodosUsados = rutaElegida.nodosRuta || [puntoRedOrigen.nombre, puntoRedDestino.nombre];
    const puntosRuta = [origenCoords], instrucciones = [];
    let distanciaTotal = 0, puntoAnterior = origenCoords;
    if (!origenEsSitio && puntoRedOrigen.distancia > 8) {
      puntosRuta.push(puntoRedOrigen.coordenadas);
      instrucciones.push({ punto: puntoRedOrigen.coordenadas, texto: `Camina ${Math.round(puntoRedOrigen.distancia)}m hacia ${puntoRedOrigen.nombre}`, distancia: puntoRedOrigen.distancia, tipo: 'inicio' });
      distanciaTotal += puntoRedOrigen.distancia; puntoAnterior = puntoRedOrigen.coordenadas;
    }
    if (rutaElegida.puntos.length >= 2) {
      for (let i = 0; i < rutaElegida.puntos.length; i++) {
        const punto = rutaElegida.puntos[i];
        if (Math.abs(punto[0]-puntoAnterior[0])<0.000001 && Math.abs(punto[1]-puntoAnterior[1])<0.000001) continue;
        const dist = calcularDistancia(puntoAnterior, punto);
        if (dist < 0.5) continue;
        puntosRuta.push(punto);
        let nombreNodo = ""; for (let s in sitiosUNI) { if (Math.abs(sitiosUNI[s][0]-punto[0])<0.000001 && Math.abs(sitiosUNI[s][1]-punto[1])<0.000001) { nombreNodo = s; break; } }
        const esUltimoNodo = (i === rutaElegida.puntos.length - 1);
        const esPrimerNodoRed = (i === 0);
        let textoInst;
        if (rutaElegida.puntos.length === 2 && nodosUsados.length === 2) {
          textoInst = `Ve directo a ${nombreNodo} (${Math.round(dist)}m)`;
        } else if (esUltimoNodo) {
          textoInst = `Llegas a ${nombreNodo} (${Math.round(dist)}m)`;
        } else if (esPrimerNodoRed && !origenEsSitio) {
          textoInst = `Desde ${nombreNodo}, continúa (${Math.round(dist)}m)`;
        } else {
          textoInst = `Pasa por ${nombreNodo} (${Math.round(dist)}m)`;
        }
        instrucciones.push({ punto, texto: textoInst, distancia: dist, nombre: nombreNodo });
        distanciaTotal += dist; puntoAnterior = punto;
      }
    }
    if (!destinoEsSitio && puntoRedDestino.distancia > 8) {
      const df = calcularDistancia(puntoAnterior, destinoCoords);
      if (df > 1) { puntosRuta.push(destinoCoords); instrucciones.push({ punto: destinoCoords, texto: `Camina ${Math.round(df)}m hasta ${nombreDestino}`, distancia: df, tipo: 'final' }); distanciaTotal += df; }
    }
    instrucciones.push({ punto: destinoCoords, texto: `Has llegado a ${nombreDestino}`, distancia: 0, tipo: 'llegada' });
    console.log(`   Distancia total: ${Math.round(distanciaTotal)}m`);
    console.log('===== MAPEO COMPLETADO =====');
    return { ruta: puntosRuta, distanciaTotal, instrucciones, nodosUsados, puntoRedOrigen, puntoRedDestino };
  }

  function encontrarPuntoMasCercano(coordenada) {
    let puntoMasCercano = null;
    let distanciaMinima = Infinity;
    for (let sitio in sitiosUNI) {
      const distancia = calcularDistancia(coordenada, sitiosUNI[sitio]);
      if (distancia < distanciaMinima) {
        distanciaMinima = distancia;
        puntoMasCercano = { nombre: sitio, coordenadas: sitiosUNI[sitio], distancia: distancia };
      }
    }
    return puntoMasCercano;
  }

  function mostrarResumenRuta(resultadoRuta, nombreOrigen, nombreDestino) {
    const panel = document.getElementById("panelNavegacion");
    if (!panel) return;
    const textoInstruccion = document.getElementById("textoInstruccion");
    const metrosRestantes = document.getElementById("metrosRestantes");
    const esMovil = window.innerWidth < 768;
    
    if (resultadoRuta.distanciaTotal === 0) {
      if (textoInstruccion) {
        textoInstruccion.innerHTML = `<div style="background:#e8f5e9;padding:${esMovil?'8px':'12px'};border-radius:8px;text-align:center;"><p style="color:#2e7d32;margin:0;font-size:${esMovil?'0.85em':'0.95em'};">Ya te encuentras en <strong>${nombreDestino}</strong></p></div>`;
      }
      if (metrosRestantes) metrosRestantes.textContent = "0 m";
      panel.style.display = "block";
      return;
    }
    
    let html = "";
    if (esMovil) {
      html = `<div style="display:flex;align-items:center;justify-content:space-between;background:#001f3f;color:white;padding:8px 12px;border-radius:8px;gap:8px;flex-wrap:wrap;">
        <span style="font-size:0.75em;font-weight:bold;max-width:45%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${nombreOrigen} → ${nombreDestino}</span>
        <span style="color:#00c8f5;font-weight:bold;font-size:0.9em;">${Math.round(resultadoRuta.distanciaTotal)}m</span>
        <button onclick="var d=document.getElementById('detalleRutaMovil');d.style.display=d.style.display==='none'?'block':'none'" style="background:#00c8f5;color:#001f3f;border:none;padding:4px 10px;border-radius:4px;font-size:0.7em;font-weight:bold;cursor:pointer;">Ver ▾</button>
      </div>
      <div id="detalleRutaMovil" style="display:none;background:#fff;padding:6px 8px;border-radius:6px;border:1px solid #e0e0e0;margin-top:4px;max-height:120px;overflow-y:auto;font-size:0.7em;">`;
      const pasos = resultadoRuta.instrucciones.filter(inst => inst.distancia > 0);
      if (pasos.length === 0) { html += `<p style="color:#666;text-align:center;margin:4px 0;">Ruta directa</p>`; }
      else { pasos.forEach((inst,i) => { html += `<div style="display:flex;align-items:center;padding:3px 5px;background:${i%2===0?'#fafafa':'#f5f8ff'};border-radius:3px;margin-bottom:1px;gap:5px;"><span style="color:#00c8f5;font-weight:bold;min-width:28px;text-align:right;font-size:0.85em;">${Math.round(inst.distancia)}m</span><span style="color:#333;">${inst.nombre?'<b>'+inst.nombre+'</b> ':''}${inst.texto.replace(inst.nombre||'','').replace(/[()]/g,'').trim()}</span></div>`; }); }
      html += `</div>`;
    } else {
      html = `<div style="background:#001f3f;color:white;padding:10px 12px;border-radius:8px 8px 0 0;"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:5px;"><span style="font-weight:bold;font-size:0.95em;">${nombreOrigen} → ${nombreDestino}</span><span style="color:#00c8f5;font-weight:bold;font-size:1em;">${Math.round(resultadoRuta.distanciaTotal)}m</span></div>${resultadoRuta.nodosUsados&&resultadoRuta.nodosUsados.length>2?`<div style="font-size:0.7em;color:#aaa;margin-top:3px;">Red: ${resultadoRuta.nodosUsados.join(' → ')}</div>`:''}</div><div style="background:#fff;padding:8px 10px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;border-top:none;max-height:250px;overflow-y:auto;">`;
      const pasos = resultadoRuta.instrucciones.filter(inst => inst.distancia > 0);
      if (pasos.length === 0) { html += `<p style="color:#666;text-align:center;font-size:0.85em;">Ruta directa</p>`; }
      else { pasos.forEach((inst,i) => { html += `<div style="display:flex;align-items:flex-start;padding:5px 6px;background:${i%2===0?'#fafafa':'#f5f8ff'};border-radius:4px;margin-bottom:2px;font-size:0.8em;gap:6px;"><span style="color:${i===pasos.length-1?'#ff6b35':'#00c8f5'};font-weight:bold;min-width:35px;text-align:right;">${Math.round(inst.distancia)}m</span><span style="flex:1;color:#444;">${inst.nombre?'<strong style="color:#001f3f;">'+inst.nombre+'</strong> ':''}${inst.texto.replace(inst.nombre||'','').replace(/[()]/g,'').trim()}</span></div>`; }); }
      html += `</div>`;
    }
    
    if (textoInstruccion) textoInstruccion.innerHTML = html;
    if (metrosRestantes) metrosRestantes.textContent = `${Math.round(resultadoRuta.distanciaTotal)} m`;
    panel.style.display = "block";
  }

  let ultimoResultado = null;
  window.addEventListener('resize', () => { if (ultimoResultado) mostrarResumenRuta(ultimoResultado, ultimoResultado._origen||'', ultimoResultado._destino||''); });

  function dibujarRutaPersonalizada(origenNombre, destinoNombre) {
    let origenCoords;
    if (origenNombre === "gps" || origenNombre === "Ubicación GPS") {
      if (!userLocation) { Swal.fire("Error","GPS no detectado.","error"); return; }
      origenCoords = userLocation; origenNombre = "Tu ubicación";
    } else if (sitiosUNI[origenNombre]) { origenCoords = sitiosUNI[origenNombre]; }
    else { Swal.fire("Error",`No se encontró: ${origenNombre}`,"error"); return; }
    let destinoCoords;
    if (sitiosUNI[destinoNombre]) { destinoCoords = sitiosUNI[destinoNombre]; }
    else { Swal.fire("Error",`No se encontró: ${destinoNombre}`,"error"); return; }
    
    console.log('========================================');
    console.log('CALCULANDO RUTA POR RED OPTIMIZADA');
    console.log('========================================');
    
    const resultadoRuta = mapearRutaAutomatica(origenCoords, destinoCoords, origenNombre, destinoNombre);
    resultadoRuta._origen = origenNombre; resultadoRuta._destino = destinoNombre; ultimoResultado = resultadoRuta;
    
    if (lineaRuta) mapa.removeLayer(lineaRuta);
    if (resultadoRuta.ruta.length >= 2) {
      const esLineaRecta = resultadoRuta.nodosUsados && resultadoRuta.nodosUsados.length <= 2;
      lineaRuta = L.polyline(resultadoRuta.ruta, { color: esLineaRecta?"#ff6b35":"#00c8f5", weight:5, opacity:0.85, dashArray:esLineaRecta?"8,6":null }).addTo(mapa);
      mapa.fitBounds(lineaRuta.getBounds(), { padding: [50,50] });
    }
    
    mostrarResumenRuta(resultadoRuta, origenNombre, destinoNombre);
    rutaActiva = resultadoRuta.instrucciones; pasoActual = 0;
    if (rutaActiva.length > 0) { actualizarPanelRuta(rutaActiva[0].texto, rutaActiva[0].distancia||resultadoRuta.distanciaTotal); hablar("Ruta calculada. " + rutaActiva[0].texto); }
  }

  function actualizarPanelRuta(texto, distancia) {
    const mr = document.getElementById("metrosRestantes");
    if (mr && distancia !== undefined) mr.textContent = distancia < 1000 ? `${Math.round(distancia)} m` : `${(distancia/1000).toFixed(1)} km`;
  }

  function hablar(texto) {
    if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); let m = new SpeechSynthesisUtterance(texto); m.lang='es-ES'; m.rate=0.9; window.speechSynthesis.speak(m); }
  }

  function verificarPasoRuta() {
    if (!rutaActiva || !userLocation || pasoActual >= rutaActiva.length) return;
    const d = calcularDistancia(userLocation, rutaActiva[pasoActual].punto);
    actualizarPanelRuta(rutaActiva[pasoActual].texto, d);
    if (d <= 10) {
      pasoActual++;
      if (pasoActual < rutaActiva.length) { actualizarPanelRuta(rutaActiva[pasoActual].texto, calcularDistancia(userLocation, rutaActiva[pasoActual].punto)); hablar(rutaActiva[pasoActual].texto); }
      else { actualizarPanelRuta("Has llegado a tu destino", 0); hablar("Has llegado a tu destino"); rutaActiva = null; }
    }
  }

  if (document.getElementById('uni-mapa')) {
    const capaSatelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 });
    const capaOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 });

    mapa = L.map('uni-mapa', { center: [12.131932, -86.269389], zoom: 17, layers: [capaSatelite] });
    L.control.layers({ "Vista Satélite": capaSatelite, "Calles": capaOSM }).addTo(mapa);
    L.control.scale({ imperial: false, metric: true, position: 'bottomleft' }).addTo(mapa);

    const select = document.getElementById('destino');
    if (select) {
      for (let nombre in sitiosUNI) {
        let option = document.createElement('option');
        option.value = nombre; option.text = nombre;
        select.appendChild(option);
      }
    }

    for (let nombre in sitiosUNI) {
      const coords = sitiosUNI[nombre];
      L.marker(coords).addTo(mapa).bindPopup(`
        <div style="font-family: sans-serif; min-width: 170px;">
          <strong style="color: #001f3f; font-size: 0.9em;"> ${nombre}</strong>
          <hr style="margin: 5px 0; border: none; border-top: 1px solid #ddd;">
          <span style="font-size: 0.75em; color: #666;">Latitud: ${coords[0].toFixed(6)}</span><br>
          <span style="font-size: 0.75em; color: #666;">Longitud: ${coords[1].toFixed(6)}</span>
        </div>
      `);
    }

    const btnCentrar = document.getElementById('btnCentrar');
    if (btnCentrar) btnCentrar.onclick = () => { if (userLocation) mapa.setView(userLocation, 19); };

    const btnActivarGPS = document.getElementById('btnActivarGPS');
    if (btnActivarGPS) {
      btnActivarGPS.onclick = function () {
        if (!navigator.geolocation) return Swal.fire("Error", "GPS no soportado.", "error");
        Swal.fire({ title: 'Buscando ubicación...', didOpen: () => { Swal.showLoading(); } });
        navigator.geolocation.watchPosition(
          (pos) => {
            Swal.close();
            userLocation = [pos.coords.latitude, pos.coords.longitude];
            verificarPasoRuta();
            const statusGPS = document.getElementById('statusGPS');
            if (statusGPS) statusGPS.innerHTML = `<span style="color: #28a745; font-weight: bold;"><i class="fa-solid fa-location-dot"></i> GPS Conectado</span>`;
            if (btnCentrar) btnCentrar.style.display = 'inline-flex';
            if (!userMarker) {
              markerPulse = L.circleMarker(userLocation, { radius: 20, fillColor: '#00c8f5', color: '#00c8f5', weight: 1, opacity: 0.3, fillOpacity: 0.1 }).addTo(mapa);
              userMarker = L.circleMarker(userLocation, { radius: 8, fillColor: '#ff6b35', color: 'white', weight: 2, opacity: 1, fillOpacity: 0.9 }).addTo(mapa).bindPopup(" Tú estás aquí");
              mapa.setView(userLocation, 18);
              hablar("GPS conectado.");
            } else {
              userMarker.setLatLng(userLocation);
              markerPulse.setLatLng(userLocation);
            }
          },
          (err) => { Swal.fire("GPS no disponible", "Permite el acceso a la ubicación.", "warning"); },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      };
    }
    
    const btnIr = document.getElementById('btnIr');
    if (btnIr) {
      btnIr.onclick = function () {
        const origenNombre = document.getElementById('origen').value;
        const destinoNombre = document.getElementById('destino').value;
        if (!destinoNombre) return Swal.fire("Atención", "Selecciona un destino.", "info");
        if (origenNombre === "gps") {
          Swal.fire({ title: 'Calculando ruta...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
          navigator.geolocation.getCurrentPosition(
            function (pos) {
              Swal.close();
              userLocation = [pos.coords.latitude, pos.coords.longitude];
              if (!userMarker) {
                markerPulse = L.circleMarker(userLocation, { radius: 20, fillColor: '#00c8f5', color: '#00c8f5', weight: 1, opacity: 0.3, fillOpacity: 0.1 }).addTo(mapa);
                userMarker = L.circleMarker(userLocation, { radius: 8, fillColor: '#ff6b35', color: 'white', weight: 2, opacity: 1, fillOpacity: 0.9 }).addTo(mapa).bindPopup(" Tu ubicación");
              } else {
                userMarker.setLatLng(userLocation);
                markerPulse.setLatLng(userLocation);
              }
              mapa.setView(userLocation, 18);
              dibujarRutaPersonalizada("Ubicación GPS", destinoNombre);
            },
            function () { Swal.fire("GPS no disponible", "No se pudo obtener tu ubicación.", "error"); },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        } else {
          dibujarRutaPersonalizada(origenNombre, destinoNombre);
        }
      };
    }
    
    console.log('Sistema con red de puntos optimizada inicializado');
  }
});

window.abrirSimulacion = async function(lugar, mediaUrl = '', tipoMedia = 'imagen', itemId = '') {
  const modal = document.getElementById('videoModal');
  const title = document.getElementById('modalTitle');
  if(title) title.innerText = 'Ruta hacia: ' + lugar;
  
  const videoContainer = modal.querySelector('.video-container');
  if (videoContainer) {
      if (mediaUrl) {
          videoContainer.innerHTML = tipoMedia === 'imagen' ? 
              `<img src="${mediaUrl}" alt="${lugar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;">` :
              `<video src="${mediaUrl}" controls style="width: 100%; height: 100%; border-radius: inherit;"></video>`;
      } else {
          videoContainer.innerHTML = `<p><span class="material-icons" style="font-size: 48px; color: var(--accent-color);">play_circle</span><br>Recorrido no disponible</p>`;
      }
  }

  const listaIndicaciones = document.getElementById("lista-indicaciones");
  if (listaIndicaciones) {
      listaIndicaciones.innerHTML = "<li>Cargando indicaciones...</li>";
      try {
          if (!indicacionesData) {
              const res = await fetch('Json/indicaciones.json');
              indicacionesData = await res.json();
          }
          let idBuscado = itemId;
          if (!idBuscado && datosCompletos) {
              for(let cat in datosCompletos.categorias) {
                  let encontrado = datosCompletos.categorias[cat].find(i => i.nombre === lugar);
                  if(encontrado) { idBuscado = encontrado.id; break; }
              }
          }
          let pasos = indicacionesData[idBuscado] || ["Dirígete a tu destino siguiendo las indicaciones del mapa principal."];
          listaIndicaciones.innerHTML = "";
          pasos.forEach(paso => {
              let li = document.createElement("li");
              li.textContent = paso;
              listaIndicaciones.appendChild(li);
          });
      } catch (error) {
          listaIndicaciones.innerHTML = "<li>Sigue la ruta marcada en el mapa.</li>";
      }
  }
  if(modal) modal.classList.add('active');
}

window.cerrarSimulacion = function () {
  const modal = document.getElementById('videoModal');
  if(modal) {
      modal.classList.remove('active');
      const video = modal.querySelector('video');
      if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
      const videoContainer = modal.querySelector('.video-container');
      if (videoContainer) videoContainer.innerHTML = '';
  }
}

window.abrirModalPisos = function (edificioId) {
  edificioActualId = edificioId || "rigoberto";
  const modal = document.getElementById('modalPisos');

  if(modal) modal.classList.add('active');
  window.cambiarPestanaRigoberto('info'); 
  
  const imgEdificio = document.getElementById('img-info-edificio');
  if (imgEdificio && datosCompletos) {
      let edificioData = null;
      for (let cat in datosCompletos.categorias) {
          edificioData = datosCompletos.categorias[cat].find(e => e.id === edificioActualId);
          if (edificioData) break;
      }
      if (edificioData && edificioData.img) {
          imgEdificio.src = edificioData.img;
      }
  }

  if(datosCompletos && datosCompletos.detallesEdificios && datosCompletos.detallesEdificios[edificioActualId]) {
      const pisosData = datosCompletos.detallesEdificios[edificioActualId].pisos;
      const trackPisos = document.getElementById('track-pisos');
      if(trackPisos) {
          trackPisos.innerHTML = "";
          pisosData.forEach(piso => {
              let btn = document.createElement('button');
              btn.className = 'piso-btn';
              btn.innerText = piso.label.toUpperCase();
              btn.onclick = function() { window.seleccionarPiso(piso.id, piso.label, this); };
              trackPisos.appendChild(btn);
          });
      }
  }
}

window.cerrarModalPisos = function () {
  const modal = document.getElementById('modalPisos');
  if (modal) modal.classList.remove('active');
  const opcionesAula = document.getElementById('opciones-aula');
  if (opcionesAula) opcionesAula.style.display = 'none';
  document.querySelectorAll('.piso-btn').forEach(b => b.classList.remove('activo'));
  const trackPisos = document.getElementById('track-pisos');
  if (trackPisos) trackPisos.scrollTo({ left: 0 });
}

window.cambiarPestanaRigoberto = function (pestana) {
    const btnInfo = document.getElementById('btn-tab-info');
    const btnAulas = document.getElementById('btn-tab-aulas');
    const contenidoInfo = document.getElementById('contenido-info-rigoberto');
    const contenidoAulas = document.getElementById('contenido-aulas-rigoberto');

    if (pestana === 'info') {
        if (contenidoInfo) contenidoInfo.style.display = 'block';
        if (contenidoAulas) contenidoAulas.style.display = 'none';
    } else {
        if (contenidoInfo) contenidoInfo.style.display = 'none';
        if (contenidoAulas) contenidoAulas.style.display = 'block';
    }
}
window.desplazarCarruselPisos = function (cantidad) {
  const track = document.getElementById('track-pisos');
  if (track) track.scrollBy({ left: cantidad, behavior: 'smooth' });
}

window.seleccionarPiso = function (pisoId, pisoLabel, botonHtml) {
  document.querySelectorAll('.piso-btn').forEach(b => b.classList.remove('activo'));
  if (botonHtml) botonHtml.classList.add('activo');

  const opcionesAula = document.getElementById('opciones-aula');
  if (opcionesAula) opcionesAula.style.display = 'block';

  const inputPiso = document.getElementById('input-piso-actual');
  if (inputPiso) inputPiso.value = pisoLabel;

  const contenedorTarjetas = document.getElementById('contenedor-tarjetas-aula');
  if (!contenedorTarjetas) return;

  contenedorTarjetas.innerHTML = "";

  if (datosCompletos && datosCompletos.detallesEdificios[edificioActualId] && datosCompletos.detallesEdificios[edificioActualId].aulas[pisoId]) {
    const selectLado = document.getElementById('select-lado-aula');
    const ladoActual = selectLado ? selectLado.value : 'A';

    const aulasDelPiso = datosCompletos.detallesEdificios[edificioActualId].aulas[pisoId][ladoActual] || [];

    if (aulasDelPiso.length === 0) {
      contenedorTarjetas.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-gray);">No hay aulas registradas en el Lado ${ladoActual} de este piso.</p>`;
      return;
    }

    aulasDelPiso.forEach(aula => {
      contenedorTarjetas.innerHTML += `
        <div class="tarjeta-aula-modal">
          <h4>${aula.nombre}</h4>
          <button onclick="window.abrirModalAulaVirtual('${aula.nombre}', '${aula.media || ''}', '${aula.tipoMedia || 'imagen'}')">
            <span class="material-icons">image</span> Ver Imagen
          </button>
        </div>
      `;
    });
  } else {
    contenedorTarjetas.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-gray);">Datos no disponibles para este piso aún.</p>`;
  }
}

document.addEventListener('change', function (e) {
  if (e.target && e.target.id === 'select-lado-aula') {
    const btnActivo = document.querySelector('.piso-btn.activo');
    if (btnActivo) {
      btnActivo.click();
    }
  }
});

window.abrirModalAulaVirtual = function(aula, mediaUrl = '', tipoMedia = 'imagen') {
  const titulo = document.getElementById('titulo-aula-virtual');
  if(titulo) titulo.innerText = 'Destino: ' + aula;
  
  const modal = document.getElementById('modalAulaVirtual');
  const videoContainer = modal.querySelector('.video-container');
  if (videoContainer) {
      if (mediaUrl) {
          videoContainer.innerHTML = tipoMedia === 'video' ? 
              `<video src="${mediaUrl}" controls style="width: 100%; height: 100%; border-radius: inherit;"></video>` :
              `<img src="${mediaUrl}" alt="${aula}" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;">`;
      } else {
          videoContainer.innerHTML = `<p style="text-align: center;"><span class="material-icons" style="font-size: 60px; color: var(--accent-color);">play_circle</span><br><br>Recorrido no disponible</p>`;
      }
  }

  window.cerrarModalPisos();
  if(modal) modal.classList.add('active');
}

window.cerrarModalAulaVirtual = function () {
  const modal = document.getElementById('modalAulaVirtual');
  if(modal) {
      modal.classList.remove('active');
      const video = modal.querySelector('video');
      if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
      const videoContainer = modal.querySelector('.video-container');
      if (videoContainer) videoContainer.innerHTML = '';
  }
}

document.addEventListener('click', function (e) {
  const mVideo = document.getElementById('videoModal');
  const mPisos = document.getElementById('modalPisos');
  const mAula = document.getElementById('modalAulaVirtual');
  if (e.target === mVideo) window.cerrarSimulacion();
  if (e.target === mPisos) window.cerrarModalPisos();
  if (e.target === mAula) window.cerrarModalAulaVirtual();
});

document.addEventListener("DOMContentLoaded", function () {
    const destinoGuardado = localStorage.getItem("destinoBuscado");
    if (destinoGuardado) {
        try {
            const destino = JSON.parse(destinoGuardado);
            setTimeout(() => {
                const selectDestino = document.getElementById("destino");
                const btnIr = document.getElementById("btnIr");
                if (selectDestino && btnIr) {
                    let optionExists = Array.from(selectDestino.options).some(opt => opt.value === destino.nombre);
                    if (!optionExists) {
                        let opt = document.createElement('option');
                        opt.value = destino.nombre; opt.text = destino.nombre;
                        selectDestino.appendChild(opt);
                    }
                    selectDestino.value = destino.nombre;
                    btnIr.click();
                    document.getElementById("navegacion-asistida").scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 800);
        } catch(e) {}
        localStorage.removeItem("destinoBuscado");
    }

    const destinoSimple = localStorage.getItem("destinoBuscadoSimple");
    if (destinoSimple) {
        setTimeout(() => {
            const selectDestino = document.getElementById("destino");
            const btnIr = document.getElementById("btnIr");
            if (selectDestino && btnIr) {
                let optionExists = Array.from(selectDestino.options).some(opt => opt.value === destinoSimple);
                if (!optionExists) {
                    let opt = document.createElement('option');
                    opt.value = destinoSimple; opt.text = destinoSimple;
                    selectDestino.appendChild(opt);
                }
                selectDestino.value = destinoSimple;
                btnIr.click();
                document.getElementById("navegacion-asistida").scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 800);
        localStorage.removeItem("destinoBuscadoSimple");
    }
});

console.log('Sistema UNI Navigator - Red optimizada + Panel mejorado + Tarjeta reparada');