import express from "express";
import handlebars from "express-handlebars";
import __dirname from "./utils.js";
import { Server } from "socket.io";
import viewRouter from "./routes/views.routes.js";
import ProductManager from "./public/js/ProductManager.js";

const app = express();
const PORT = 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const hbs = handlebars.create({
  helpers: {
    formatear: function (amount) {
      const formateado = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
      }).format(amount);
      return formateado;
    },
  },
});
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

app.use(express.static(__dirname + "/public"));
app.use("/", viewRouter);

const httpServer = app.listen(PORT, () =>
  console.log("Listening on port ", PORT)
);


const productManager = new ProductManager();
const socketServer = new Server(httpServer);
const conversacion = [];
const usuarios = [];

socketServer.on("connection", async (socket) => {
  const productosObtenidos = await productManager.getProducts();
  socket.emit("infoProductos", productosObtenidos);

  socket.on("nuevoProducto", async (data) => {
    try {
      await productManager.addProduct(
        data.title,
        data.price,
        data.code,
        data.stock,
        data.description,
        data.status,
        data.category
      );
    } catch (e) {
      socket.emit("errorAgregar", e.message);
    }
    const productosObtenidos = await productManager.getProducts();
    socketServer.emit("infoProductos", productosObtenidos);
  });

  socket.on("Borrar", async (data) => {
    try {
      await productManager.deleteProductByID(parseInt(data));
    } catch (e) {
      socket.emit("errormsj", e.message);
    }
    const productosObtenidos = await productManager.getProducts();
    socketServer.emit("infoProductos", productosObtenidos);
  });

  socket.on("Editar", async (data) => {
    try {
      await productManager.updateProductByID(
        parseInt(data.IDamodificar),
        data.propiedad,
        data.valor
      );
    } catch (e) {
      socket.emit("errorModificar", e.message);
    }
    const productosObtenidos = await productManager.getProducts();
    socketServer.emit("infoProductos", productosObtenidos);
  });

  // Chat events
  socket.on("mensaje", (data) => {
    conversacion.push(data);
    socketServer.emit("conversacion", conversacion);
  });

  socket.on("nuevoUsuario", (nuevoUsuario) => {
    usuarios.push({ ...nuevoUsuario, id: socket.id });
    socket.emit("conversacion", conversacion);
    socketServer.emit("conectados", usuarios);
    socketServer.emit("numeroUsuarios", usuarios.length);
  });

  socket.on("disconnect", () => {
    const index = usuarios.findIndex((user) => user.id === socket.id);
    if (index != -1) {
      usuarios.splice(index, 1);
    }
    socketServer.emit("conectados", usuarios);
    socketServer.emit("numeroUsuarios", usuarios.length);
  });
});
