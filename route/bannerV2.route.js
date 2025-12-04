import { Router } from "express";
import upload from "../middlewares/multer.js";
import auth from "../middlewares/auth.js";
import {
  addBannerV2,
  deleteBannerV2,
  getBannersV2,
  getBannerV2,
  removeImageFromCloudinary,
  updateBannerV2,
  uplaodImagesV2,
} from "../controllers/bannerV2.conroller.js";

const bannerV2Route = Router();
bannerV2Route.post("/uploadImagesV2", auth, upload.array("images"), uplaodImagesV2);

// create Images
bannerV2Route.post("/add", auth, addBannerV2);
bannerV2Route.get("/", getBannerV2);
bannerV2Route.delete("/:id", auth, deleteBannerV2);
bannerV2Route.put("/:id", auth, updateBannerV2);
bannerV2Route.get("/:id", getBannersV2);
bannerV2Route.delete("/deleteImage", auth, removeImageFromCloudinary);

export default bannerV2Route;
