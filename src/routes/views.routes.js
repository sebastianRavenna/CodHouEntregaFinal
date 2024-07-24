import express from "express";
import ProductManager from "../public/js/ProductManager.js";
const router = express.Router();

let productManager = new ProductManager();
router.get("/", async (req, res) => {
  let limite = req.query.limit;
  
  try {
    if (limite) {
      if (limite <= 0 || isNaN(limite)) {
        const msj = {
          msj: "el valor límite de productos a mostrar debe ser un número mayor a 0",
          status: 400,
        };
        return res.status(400).render("error", { msj });
      }
      const productos = await productManager.getProducts();
      const productosObtenidos = productos.slice(0, limite);
      res.render("home", { productosObtenidos, style: "style.css" });
    } else {
      const productosObtenidos = await productManager.getProducts();
      res.render("home", {
        productosObtenidos,
        style: "style.css",
      });
    }
  } catch (e) {
    res.status(500).render("error", e.message);
  }
});

router.get("/realtimeproducts", async (req, res) => {
  res.render("realTimeProducts", { style: "style.css" });
});

router.get("/chat", (req, res) => {
  res.render("chat", {style: "style.css"});
});

export default router;
