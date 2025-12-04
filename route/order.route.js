import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
  captureOrderPaypalController,
  createOrderController,
  createOrderPaypalController,
  getAllOrders,
  getOrderController,
  getOrdersController,
  totalSalesController,
  totalUserController,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const orderRouter = Router();
orderRouter.post("/create", auth, createOrderController);
orderRouter.get("/order-list", auth, getOrderController);
orderRouter.get("/orders-list", auth, getOrdersController);
orderRouter.get("/create-order-paypal", auth, createOrderPaypalController);
orderRouter.post("/capture-order-paypal", auth, captureOrderPaypalController);
orderRouter.put("/order-status/:id", auth, updateOrderStatus);
orderRouter.get("/sales", auth, totalSalesController);
orderRouter.get("/users", auth, totalUserController);
orderRouter.get("/allOrder", auth, getAllOrders);

export default orderRouter;
