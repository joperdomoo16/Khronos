// Controla los videos de bienvenida y la entrada al tablero

function inicializarInicio() {
  const raiz = document.getElementById("raiz");
  const escena = document.getElementById("escena");
  const videoInicio = document.getElementById("video de inicio");
  const videoTransicion = document.getElementById("video de transicion");
  const formularioAcceso = document.getElementById("formulario de sesion");
  const campoUsuario = document.getElementById("usuario de sesion");
  const campoClave = document.getElementById("clave de sesion");
  const textoError = document.getElementById("error de sesion");

  const segundoEnBlanco = 6.75;
  const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let alEntrar = null;
  let entrando = false;
  let aplicacionVisible = false;
  let transicionPedida = false;

  function cambiarFase(fase) {
    raiz.className = "k-root is-" + fase;
  }

  function mostrarVideo() {
    videoInicio.classList.add("is-ready");
  }

  if (videoInicio.readyState >= 2) {
    mostrarVideo();
  } else {
    videoInicio.addEventListener("loadeddata", mostrarVideo, { once: true });
  }

  if (!sinMovimiento) {
    videoInicio.play().catch(function() {
      // Si el navegador bloquea el autoplay se deja el fotograma inicial
    });
  }

  // Precarga el video de transicion despues del video principal
  function cargarTransicion() {
    if (transicionPedida || sinMovimiento) {
      return;
    }
    transicionPedida = true;
    videoTransicion.preload = "auto";
    videoTransicion.load();
  }

  if (videoInicio.readyState >= 4) {
    setTimeout(cargarTransicion, 1500);
  } else {
    videoInicio.addEventListener("canplaythrough", function() {
      setTimeout(cargarTransicion, 1500);
    }, { once: true });
  }
  setTimeout(cargarTransicion, 6000);

  function mostrarError(mensaje) {
    textoError.textContent = mensaje;
    textoError.hidden = false;
    formularioAcceso.classList.remove("is-shake");
    requestAnimationFrame(function() {
      formularioAcceso.classList.add("is-shake");
    });
  }

  function actualizarFormulario() {
    textoError.hidden = true;
    textoError.textContent = "";
    const listo = campoUsuario.value.trim() !== "" && campoClave.value !== "";
    formularioAcceso.classList.toggle("is-ready", listo);
  }

  function mostrarAplicacion(usuario) {
    if (aplicacionVisible) {
      return;
    }
    aplicacionVisible = true;
    cambiarFase("app");
    document.body.classList.add("en-aplicacion");
    window.scrollTo(0, 0);
    if (alEntrar) {
      alEntrar(usuario);
    }
    setTimeout(function() {
      videoTransicion.pause();
      videoInicio.pause();
      escena.hidden = true;
    }, 800);
  }

  // Revisa el tiempo del video para pasar al tablero justo en el fondo crema
  function vigilarBlanco(usuario) {
    function revisar() {
      if (aplicacionVisible) {
        return;
      }
      if (videoTransicion.currentTime >= segundoEnBlanco || videoTransicion.ended) {
        mostrarAplicacion(usuario);
        return;
      }
      requestAnimationFrame(revisar);
    }
    revisar();
  }

  function entrar(usuario) {
    entrando = true;
    document.activeElement.blur();
    if (sinMovimiento) {
      mostrarAplicacion(usuario);
      return;
    }
    cargarTransicion();
    videoTransicion.currentTime = 0;
    videoTransicion.addEventListener("error", function() {
      mostrarAplicacion(usuario);
    }, { once: true });
    videoTransicion.play().then(function() {
      cambiarFase("cross");
      vigilarBlanco(usuario);
    }).catch(function() {
      mostrarAplicacion(usuario);
    });
  }

  formularioAcceso.addEventListener("focusin", cargarTransicion);
  formularioAcceso.addEventListener("pointerenter", cargarTransicion);

  campoUsuario.addEventListener("input", actualizarFormulario);
  campoClave.addEventListener("input", actualizarFormulario);

  formularioAcceso.addEventListener("submit", function(evento) {
    evento.preventDefault();
    if (entrando) {
      return;
    }
    const mensaje = validateLoginForm(campoUsuario.value, campoClave.value);
    if (mensaje !== "") {
      mostrarError(mensaje);
      return;
    }
    entrar(campoUsuario.value.trim());
  });

  return {
    alIniciarSesion: function(funcion) {
      alEntrar = funcion;
    }
  };
}

const inicio = inicializarInicio();
