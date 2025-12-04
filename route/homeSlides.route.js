import { Router } from "express";
import upload from "../middlewares/multer.js";
import auth from "../middlewares/auth.js";
import {
  addSlide,
  deleteMultipleSlide,
  deleteSlide,
  getHomeSlides,
  getSlide,
  removeImageFromCloudinary,
  updateSlide,
  uploadImages,
} from "../controllers/homeSlider.controller.js";

const homeSlidesRouter = Router();

homeSlidesRouter.post(
  "/uploadImages",
  auth,
  upload.array("images"),
  uploadImages
);
homeSlidesRouter.post("/add", auth, addSlide);
homeSlidesRouter.get("/", getHomeSlides);
homeSlidesRouter.get("/:id", getSlide);
homeSlidesRouter.delete("/deleteImage", auth, removeImageFromCloudinary);
homeSlidesRouter.delete("/deleteMultiple", deleteMultipleSlide);
homeSlidesRouter.delete("/:id", auth, deleteSlide);
homeSlidesRouter.put("/:id", auth, updateSlide);

export default homeSlidesRouter;
