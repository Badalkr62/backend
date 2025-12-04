import { Router } from "express";
import upload from "../middlewares/multer.js";
import auth from "../middlewares/auth.js";
import {
  addBlog,
  deleteBlog,
  getBlog,
  getBlogs,
  removeImageFromCloudinary,
  updateBlog,
  uploadImages,
} from "../controllers/blog.controller.js";

const blogRoute = Router();

// Upload Images
blogRoute.post("/uplaodImages", auth, upload.array("images"), uploadImages);
// create blog
blogRoute.post("/add", auth, addBlog);
// get banner details
blogRoute.get("/", getBlog);
// delete by id
blogRoute.delete("/:id", auth, deleteBlog);
// update banner
blogRoute.put("/:id", auth, updateBlog);
//get banner by id
blogRoute.get("/:id", getBlogs);
//delete images
blogRoute.delete("/deleteImage", auth, removeImageFromCloudinary);

export default blogRoute;
