/* Escena de inicio en video, inicio de sesion y transicion hacia el panel principal
   Fases de la raiz: intro -> cross (video: cruce, entrada, turbulencia, crema) -> app */

const inicio = (function() {
  const raiz = document.getElementById("raiz");
  const escena = document.getElementById("escena");
  const videoInicio = document.getElementById("video de inicio");
  const videoTransicion = document.getElementById("video de transicion");
  const formulario = document.getElementById("formulario de sesion");
  const campoUsuario = document.getElementById("usuario de sesion");
  const campoClave = document.getElementById("clave de sesion");
  const textoError = document.getElementById("error de sesion");

  /* Segundo del video de transicion en el que la pantalla ya queda en crema plano,
     el mismo color de fondo del panel (cuadro 162 del video) */
  const Segundoenblanco = 6.75;
  /* Si la persona pidio menos movimiento en su sistema, el fondo se queda quieto
     y se entra al panel sin el video de transicion */
  const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let alEntrar = null;
  let entrando = false;
  let aplicacionVisible = false;

  function cambiarFase(fase) {
    raiz.className = "k-root is-" + fase;
  }

  /* El video de inicio aparece suavemente en cuanto tiene su primer fotograma.
     El archivo ya trae el bucle resuelto (su ultimo cuadro empalma con el primero),
     asi que basta con el atributo loop y no hace falta una segunda copia del video. */
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
      /* Si el navegador bloquea la reproduccion automatica, se queda el primer fotograma */
    });
  }

  /* Carga escalonada: primero el video principal y despues el de transicion,
     para que el principal nunca se quede sin datos (eso provoca congelados) */
  let transicionPedida = false;

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
    formulario.classList.remove("is-shake");
    void formulario.offsetWidth; /* reinicia la animacion de temblor */
    formulario.classList.add("is-shake");
  }

  function actualizarFormulario() {
    textoError.hidden = true;
    textoError.textContent = "";
    const listo = campoUsuario.value.trim() !== "" && campoClave.value !== "";
    formulario.classList.toggle("is-ready", listo);
  }

  /* Cuando todo queda en crema: se muestra la aplicacion y entra el menu */
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

  /* Vigila el video fotograma a fotograma para cortar justo en el crema */
  function vigilarBlanco(usuario) {
    function revisar() {
      if (aplicacionVisible) {
        return;
      }
      if (videoTransicion.currentTime >= Segundoenblanco || videoTransicion.ended) {
        mostrarAplicacion(usuario);
        return;
      }
      if (videoTransicion.requestVideoFrameCallback) {
        videoTransicion.requestVideoFrameCallback(revisar);
      } else {
        requestAnimationFrame(revisar);
      }
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

  /* En cuanto la persona va a escribir, se empieza a descargar el video de transicion */
  formulario.addEventListener("focusin", cargarTransicion);
  formulario.addEventListener("pointerenter", cargarTransicion);

  campoUsuario.addEventListener("input", actualizarFormulario);
  campoClave.addEventListener("input", actualizarFormulario);

  formulario.addEventListener("submit", function(evento) {
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
})();
