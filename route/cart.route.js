import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
  addToCartItemController,
  deleteCartItemQtyController,
  emptyCartController,
  getCartItemController,
  updateCartItemQtyController,
} from "../controllers/cart.controller.js";

const cartRouter = Router();
// add cart
cartRouter.post("/add", auth, addToCartItemController);
// get getCartItemController
cartRouter.get("/get", auth, getCartItemController);
// update car item Qty
cartRouter.put("/update-qty", auth, updateCartItemQtyController);
// delete cartItemQty
cartRouter.delete("/delete-cart-item/:id", auth, deleteCartItemQtyController);
cartRouter.delete("/emptyCart/:id", auth, emptyCartController);

export default cartRouter;
