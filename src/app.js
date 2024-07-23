import express from "express";
import handlebars from "express-handlebars";
import __dirname from "./utils.js";
import { Server } from "socket.io";
import viewRouter from "./routes/views.routes.js";
import ProductManager from "./public/js/ProductManager.js";

const app = express();
const PORT = 8080;


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


const socketServer = new Server(httpServer);
const productManager = new ProductManager();


socketServer.on("connection", async (socket) => {
  const productosObtenidos = await productManager.getProducts();
  socketServer.emit("infoProductos", productosObtenidos);
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
  socket.on("aBorrar", async (data) => {
    try {
      await productManager.deleteProductByID(parseInt(data));
    } catch (e) {
      socketServer.emit("errormsj", e.message);
    }
    const productosObtenidos = await productManager.getProducts();
    socketServer.emit("infoProductos", productosObtenidos);
  });
  socket.on("aModificar", async (data) => {
    try {
      await productManager.updateProductByID(
        parseInt(data.IDamodificar),
        data.propiedad,
        data.valor
      );
    } catch (e) {
      socketServer.emit("errorModificar", e.message);
    }
    const productosObtenidos = await productManager.getProducts();
    socketServer.emit("infoProductos", productosObtenidos);
  });
});
