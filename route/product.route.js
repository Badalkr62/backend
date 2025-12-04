import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import {
  createProductController,
  deleteMultipleProduct,
  deleteProduct,
  getAllFeaturedProduct,
  getAllProduct,
  getAllProductCount,
  getAllProductByCatId,
  getAllProductByCatName,
  getAllProductByPrice,
  getAllProductByRating,
  getAllProductBySubCatId,
  getAllProductBySubCatName,
  getAllProductByThirdLevelSubCatId,
  getAllProductByThirdLevelSubCatName,
  getProduct,
  removeImageFromCludinary,
  updateProduct,
  uploadImages,
  // for product Ram
  createProductRAMS,
  deleteProductRAM,
  deleteMultipleProductRAMS,
  updateProductRAMS,
  getAllProductRAM,
  getProductRAMSById,
  // for product Weight
  createProductWeight,
  deleteProductWeight,
  deleteMultipleProductWeight,
  updateProductWeight,
  getAllProductWeight,
  getProductWeightById,
  // for product size
  createProductSize,
  deleteProductSize,
  deleteMultipleProductSize,
  updateProductSize,
  getAllProductSize,
  getProductSizeById,
  uploadBannerImages,
  filter,
  sortBy,
  getAllProducts,
  searchProductController,
} from "../controllers/product.controller.js";

const productRouter = Router();
productRouter.post("/uploadImages", auth, upload.array("images"), uploadImages);
productRouter.post(
  "/uploadBannerImages",
  auth,
  upload.array("bannerimages"),
  uploadBannerImages
);
productRouter.post("/create", auth, createProductController);
productRouter.get("/AllProductss", getAllProducts);

productRouter.get("/AllProducts", getAllProduct);
productRouter.get("/getAllProductByCatId/:catId", getAllProductByCatId);
productRouter.get("/getAllProductByCatName", getAllProductByCatName);
productRouter.get(
  "/getAllProductBySubCatId/:subCatId",
  getAllProductBySubCatId
);
productRouter.get("/getAllProductByCatName", getAllProductBySubCatName);
productRouter.get(
  "/getAllProductByThirdLevelCatId/:thirdsubCatId",
  getAllProductByThirdLevelSubCatId
);
productRouter.get(
  "/getAllProductByThirdLevelsubCatName",
  getAllProductByThirdLevelSubCatName
);
productRouter.get("/getAllProductByPrice", getAllProductByPrice);
productRouter.get("/getAllProductsByRating", getAllProductByRating);
productRouter.get("/getAllProductCount", getAllProductCount);
productRouter.get("/getAllFeaturedProduct", getAllFeaturedProduct);
productRouter.delete("/delete-multiple", deleteMultipleProduct);
// filter
productRouter.post("/filters", filter);
productRouter.delete("/:id", deleteProduct);
productRouter.get("/:id", getProduct);
productRouter.delete("/deleteImage", auth, removeImageFromCludinary);
productRouter.put("/updateProduct/:id", updateProduct);

// for Product Ram Router
productRouter.post("/productRAMS/create", auth, createProductRAMS);
productRouter.get("/productRAMS/get", getAllProductRAM);
productRouter.put("/productRAMS/:id", auth, updateProductRAMS);
productRouter.delete("/productRAMS/:id", deleteProductRAM);
productRouter.delete(
  "/productRAMS/deleteMultipleRAMS",
  deleteMultipleProductRAMS
);
productRouter.get("/productRAMS/:id", getProductRAMSById);

// for Product Weight Router
productRouter.post("/productWeight/create", auth, createProductWeight);
productRouter.get("/productWeight/get", getAllProductWeight);
productRouter.put("/productWeight/:id", auth, updateProductWeight);
productRouter.delete(
  "/productWeight/deleteMultipleWeight",
  deleteMultipleProductWeight
);
productRouter.delete("/productWeight/:id", deleteProductWeight);

productRouter.get("/productWeight/:id", getProductWeightById);

// for Product Size Router
productRouter.post("/productSize/create", auth, createProductSize);
productRouter.get("/productSize/get", getAllProductSize);
productRouter.put("/productSize/:id", auth, updateProductSize);
productRouter.delete(
  "/productRAMS/deleteMultipleSize",
  deleteMultipleProductSize
);
productRouter.delete("/productSize/:id", deleteProductSize);

productRouter.get("/productSize/:id", getProductSizeById);
productRouter.post("/sortBy", sortBy);

// searching for all page
productRouter.post("/search/get", searchProductController);

export default productRouter;
