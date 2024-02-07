import config from "./config.js";
const html1 = config.html1;
const html2 = config.html2;
const menu1 = "Solicitud de Probadores";
const menu2 = "Reporte de daños DAL";

function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

//Funcion que se ejecuta al cargar la página
window.onload = function () {
  const user = getQueryParam("user");
  const menu = document.getElementById("menu");
  menu.innerHTML = `
  <br>
  <a href="${html1}?user=${encodeURIComponent(
    user
  )}" class="btn btn-success">${menu1}</a>
  <br>
  <br>
  <a href="${html2}?user=${encodeURIComponent(
    user
  )}" class="btn btn-success">${menu2}</a>
`;
};
