//Se importa configuración y nombre de HTML a redirigir
import config from "./config.js";
const html = config.htmlmenu;

//Función con la que se obtiene el usuario y contraseña y redirecciona a la página especificada e la configuración
function LOGI() {
  let usermin = document.getElementById("user").value;
  let user = usermin.toUpperCase();
  let pass = document.getElementById("pass").value;
  let url = html + "?user=" + user;

  if (
    (user == "GRD1" && pass == "1234") ||
    (user == "SAT2" && pass == "1234") ||
    (user == "SAT3" && pass == "1234") ||
    (user == "SAT4" && pass == "1234") ||
    (user == "GRT2" && pass == "1234") ||
    (user == "PLT2" && pass == "1234")
  ) {
    window.location = url;
  } else {
    alert("Usuario o contraseña son incorrectos");
  }
}

document
  .getElementById("loginform")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    LOGI();
  });
