import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
  addAddressController,
  deleteAddressController,
  editAddressController,
  getAddressController,
  getSingleAddressController,
} from "../controllers/address.controller.js";

const addressRouter = Router();
// add address
addressRouter.post("/add", auth, addAddressController);
// get address
addressRouter.get("/get", auth, getAddressController);
// addressRouter.put("/selectAddress/:id", auth, selectAddressController);
// delete Address
addressRouter.delete("/:id", auth, deleteAddressController);
// edit Address
addressRouter.put("/:id", editAddressController);
// get by id in single product
addressRouter.get("/:id", getSingleAddressController);
export default addressRouter;
