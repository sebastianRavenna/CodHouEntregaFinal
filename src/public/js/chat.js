const socket = io();
let user = ""; 
const title = document.querySelector("#wellcome"); 
const chatBox = document.querySelector("#send"); 


Swal.fire({
  title: "Ingrese su alias",
  input: "text",
  text: "Para ingresar al chat identificate",
  allowOutsideClick: false,
  inputValidator: (value) => {
    return !value && "Ingresa un nombre por favor!";
  },
}).then((result) => {
  user = result.value;
  /* title.innerText = `Bienvenido al chat ${user}` */;
  socket.emit("nuevoUsuario", { user });
});


chatBox.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    socket.emit("mensaje", { user, mensaje: event.target.value });
    event.target.value = ""; 
  }
});

socket.on("conversacion", (data) => {
  const contenedorChat = document.querySelector("#contenedor-chat");
  contenedorChat.innerHTML = "";
  data.forEach((chat) => {
    const div = document.createElement("div");
    const nombre = document.createElement("p");
    const mensaje = document.createElement("p");
    nombre.classList.add("bold-name");
    mensaje.classList.add("mensaje");

    nombre.innerText = chat.user === user ? "Yo: " : chat.user + ": ";
    mensaje.innerText = chat.mensaje;
    div.appendChild(nombre);
    div.appendChild(mensaje);
    contenedorChat.appendChild(div);
  });

  contenedorChat.scrollTop = contenedorChat.scrollHeight;
});

socket.on("conectados", (listaUsuarios) => {
  const conectadosContainer = document.querySelector("#conectados");
  conectadosContainer.innerHTML = "";

  listaUsuarios.forEach((usuario) => {

    const li = document.createElement("li");
    li.innerText = usuario.user === user ? user + " - (Yo)" : usuario.user;
    conectadosContainer.appendChild(li);
  });
});


socket.on("numeroUsuarios", (numero) => {
  const numeroUsuariosContainer = document.querySelector("#numero-usuarios");
  numeroUsuariosContainer.innerText = `Total: ${numero}`;
});
