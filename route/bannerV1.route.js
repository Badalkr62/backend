import { Router } from "express";
import upload from "../middlewares/multer.js";
import auth from "../middlewares/auth.js";
import {
  addBannerV1,
  deleteBannerV1,
  getBannersV1,
  getBannerV1,
  removeImageFromCloudinary,
  updateBannerV1,
  uploadImages,
} from "../controllers/bannerV1.controller.js";

const bannerV1Route = Router();
// Upload Images
bannerV1Route.post("/uplaodImages", auth, upload.array("images"), uploadImages);
// create Images
bannerV1Route.post("/add", auth, addBannerV1);
// get banner details
bannerV1Route.get("/", getBannerV1);
// delete by id
bannerV1Route.delete("/:id", auth, deleteBannerV1);
// update banner
bannerV1Route.put("/:id", auth, updateBannerV1);
//get banner by id
bannerV1Route.get("/:id", getBannersV1);
//delete images
bannerV1Route.delete("/deleteImage", auth, removeImageFromCloudinary);

export default bannerV1Route;
