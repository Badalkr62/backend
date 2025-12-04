import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import {
  addToMyListController,
  deleteToMyListController,
  getMyListController,
} from "../controllers/mylist.controller.js";

const myListRouter = Router();
// add my list
myListRouter.post("/add", auth, addToMyListController);
//  delete form cart
myListRouter.delete("/remove/:id", auth, deleteToMyListController);
// get MyList
myListRouter.get("/", auth, getMyListController);

export default myListRouter;
