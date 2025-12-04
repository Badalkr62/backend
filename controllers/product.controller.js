import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import ProductModel from "../models/product.model.js";
import ProductRAMSModel from "../models/productRAMS.js";
import ProductSizeModel from "../models/productSIZE.js";
import ProductWeightModel from "../models/productWEIGHT.js";

// for image connection between DB to cloudinary
// Configuration
cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret, // Click 'View API Keys' above to copy your API secret
});

//  FOR PRODUCT CONTROLLER
// image Upload
var imageArr = [];
export async function uploadImages(req, res) {
  try {
    imageArr = [];
    const images = req.files;

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.uploader.upload(
        images[i].path,
        options,
        function (error, result) {
          imageArr.push(result.secure_url);
          fs.unlinkSync(`uploads/${req.files[i].filename}`);
        }
      );
    }

    return res.status(200).json({
      images: imageArr,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//Upload banner Images
var bannerImage = [];
export async function uploadBannerImages(req, res) {
  try {
    bannerImage = [];
    const images = req.files;

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.uploader.upload(
        images[i].path,
        options,
        function (error, result) {
          bannerImage.push(result.secure_url);
          fs.unlinkSync(`uploads/${req.files[i].filename}`);
        }
      );
    }

    return res.status(200).json({
      images: bannerImage,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// create Product
export async function createProductController(req, res) {
  try {
    const images = req.body.images || [];

    let product = new ProductModel({
      name: req.body.name,
      bannerTitlename: req.body.bannerTitlename,
      isDisplayOnHomeBanner: req.body.isDisplayOnHomeBanner,
      description: req.body.description,
      images: imageArr,
      bannerimages: bannerImage,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      newPrice: req.body.newPrice,
      oldPrice: req.body.oldPrice,
      catName: req.body.catName,
      catId: req.body.catId,
      subCatId: req.body.subCatId,
      subCatName: req.body.subCatName,
      thirdsubCatName: req.body.thirdsubCatName,
      thirdsubCatId: req.body.thirdsubCatId,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      isFeatured: req.body.isFeatured,
      discount: req.body.discount,
      productRam: req.body.productRam,
      size: req.body.size,
      productWeight: req.body.productWeight,
    });

    product = await product.save();

    if (!product) {
      res.status(500).json({
        message: "Product not Created",
        error: true,
        success: false,
      });
    }

    imageArr = [];

    return res.status(200).json({
      message: "Product Created Successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// get all Product
export async function getAllProduct(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res.status(404).json({
        message: "Page not found",
        error: true,
        success: false,
      });
    }

    const product = await ProductModel.find()
      .populate("category")
      .skip((page - 1) * perPage)
      .sort({ createdAt: -1 })
      .limit(perPage);
    // .exec();

    if (!product) {
      return res.status(500).json({
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "Product fetched successfully",
      products: product,
      totalPages: totalPages,
      page: page,
      totalPosts: totalPosts,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// ✅ Server-side search + pagination
export async function getAllProducts(req, res) {
  try {
    const { search = "", page = 1, perPage = 10 } = req.query;

    // 🔍 Create a search query
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { catName: { $regex: search, $options: "i" } },
            { subCatName: { $regex: search, $options: "i" } },
            { thirdsubCatName: { $regex: search, $options: "i" } },
            {
              $expr: {
                $regexMatch: {
                  input: { $toString: "$price" },
                  regex: search,
                  options: "i",
                },
              },
            },
          ],
        }
      : {};

    // 🔢 Pagination logic
    const skip = (page - 1) * parseInt(perPage);
    const limit = parseInt(perPage);

    // ⚙️ Fetch filtered + paginated products
    const totalPosts = await ProductModel.countDocuments(query);
    const products = await ProductModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // optional

    res.status(200).json({
      error: false,
      products,
      totalPosts,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
}

// getAll Product By Category Id
export async function getAllProductByCatId(req, res) {
  try {
    const catId = req.params.catId;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    const totalPosts = await ProductModel.countDocuments({ catId: catId });
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res.status(404).json({
        message: "Page not found",
        error: true,
        success: false,
      });
    }

    const products = await ProductModel.find({ catId: catId })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products || products.length === 0) {
      return res.status(200).json({
        success: true,
        error: false,
        message: "No Product found",
        page: page,
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      products: products,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// getAll Product By Category name
export async function getAllProductByCatName(req, res) {
  try {
    const catName = req.query.catName;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;

    const totalPosts = await ProductModel.countDocuments({ catName: catName });
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res.status(404).json({
        message: "Page not found",
        error: true,
        success: false,
      });
    }

    const product = await ProductModel.find({
      catName: catName,
    })
      .populate("category") // assumes category is a ref
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!product) {
      return res.status(500).json({
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "Product fetched successfully",
      Product: product,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// getAll Product By Sub Category Id
export async function getAllProductBySubCatId(req, res) {
  try {
    const subCatId = req.params.subCatId;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    const totalPosts = await ProductModel.countDocuments({
      subCatId: subCatId,
    });
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res.status(404).json({
        message: "Page not found",
        error: true,
        success: false,
      });
    }

    const products = await ProductModel.find({
      subCatId: subCatId,
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products || products.length === 0) {
      return res.status(200).json({
        success: true,
        error: false,
        products: products,
        totalPages: totalPages,
        page: page,
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      products: products,
      totalPages: totalPosts,
      page: page,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// getAll Product By Sub Category name
export async function getAllProductBySubCatName(req, res) {
  try {
    const subCatName = req.query.subCatName;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;

    const totalPosts = await ProductModel.countDocuments({
      subCatName: subCatName,
    });
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res.status(404).json({
        message: "Page not found",
        error: true,
        success: false,
      });
    }

    const product = await ProductModel.find({
      subCatName: subCatName,
    })
      .populate("category") // assumes category is a ref
      .skip((page - 1) * perPage)
      .limit(perPage)
      // .sort({ createdAt: -1 })
      .exec();

    if (!product) {
      return res.status(500).json({
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "Product fetched successfully",
      Product: product,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// getAll Product By Third Level sub Category Id
export async function getAllProductByThirdLevelSubCatId(req, res) {
  try {
    const thirdsubCatId = req.params.thirdsubCatId;

    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    // Fix: use thirdsubCatId for counting
    const totalPosts = await ProductModel.countDocuments({
      thirdsubCatId: thirdsubCatId,
    });
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res.status(404).json({
        message: "Page not found",
        error: true,
        success: false,
      });
    }

    const products = await ProductModel.find({ thirdsubCatId: thirdsubCatId })
      .populate("category") // optional: add other fields if needed
      .skip((page - 1) * perPage)
      .limit(perPage);

    if (!products || products.length === 0) {
      return res.status(200).json({
        success: true,
        error: false,
        message: "No Product found",
        product: [],
        totalPages,
        page,
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      products: products,
      totalPages,
      page,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// getAll Product By Third Level Sub Category name
export async function getAllProductByThirdLevelSubCatName(req, res) {
  try {
    const thirdsubCatName = req.query.thirdsubCatName;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10000;

    const totalPosts = await ProductModel.countDocuments({
      thirdsubCatName: thirdsubCatName,
    });
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res.status(404).json({
        message: "Page not found",
        error: true,
        success: false,
      });
    }

    const product = await ProductModel.find({
      thirdsubCatName: thirdsubCatName,
    })
      .populate("category") // assumes category is a ref
      .skip((page - 1) * perPage)
      .limit(perPage)
      // .sort({ createdAt: -1 })
      .exec();

    if (!product) {
      return res.status(500).json({
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "Product fetched successfully",
      Product: product,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// get all Product by price
export async function getAllProductByPrice(req, res) {
  try {
    const { catId, subCatId, thirdsubCatId, minPrice, maxPrice } = req.query;

    const query = {};

    if (catId) query.catId = catId;
    if (subCatId) query.subCatId = subCatId;
    if (thirdsubCatId) query.thirdsubCatId = thirdsubCatId;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const product = await ProductModel.find(query).populate("category");

    return res.status(200).json({
      product,
      totalPages: 0,
      page: 0,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// get all Product by rating
export async function getAllProductByRating(req, res) {
  try {
    const { catId, subCatId, thirdsubCatId, minPrice, maxPrice, rating } =
      req.query;

    const query = {};

    let product = [];
    if (catId) query.catId = catId;
    if (subCatId) query.subCatId = subCatId;
    if (thirdsubCatId) query.thirdsubCatId = thirdsubCatId;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (rating) query.rating = Number(rating);

    if (catId !== undefined) {
      product = await ProductModel.find({ rating, catId }).populate("category");
    }

    if (subCatId !== undefined) {
      product = await ProductModel.find({ rating, subCatId }).populate(
        "category"
      );
    }

    if (thirdsubCatId !== undefined) {
      product = await ProductModel.find({ rating, thirdsubCatId }).populate(
        "category"
      );
    }

    return res.status(200).json({
      product,
      totalPages: 0,
      page: 0,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// get All Product count
export async function getAllProductCount(req, res) {
  try {
    const productCount = await ProductModel.countDocuments();

    if (!productCount) {
      res.status(500).json({
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      Total_Product: productCount,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// getAll featued Product
export async function getAllFeaturedProduct(req, res) {
  try {
    const product = await ProductModel.find({
      isFeatured: true,
    }).populate("category");

    if (!product) {
      return res.status(500).json({
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      Product: product,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// delete Product
export async function deleteProduct(req, res) {
  try {
    const product = await ProductModel.findById(req.params.id).populate(
      "category"
    );

    if (!product) {
      return res.status(500).json({
        error: true,
        success: false,
        message: "Product not found",
      });
    }

    let img = [];
    const images = product.images;
    for (img of images) {
      const imgUrl = img;
      const urlArr = imgUrl.split("/");
      const imageWithExtension = urlArr[urlArr.length - 1]; // e.g., "1749791204341_Screenshot.png"
      const imageName = imageWithExtension.split(".")[0]; // e.g., "1749791204341_Screenshot"

      if (imageName) {
        cloudinary.uploader.destroy(imageName, (error, result) => {});
      }
    }

    const deleteProduct = await ProductModel.findByIdAndDelete(req.params.id);

    if (!deleteProduct) {
      res.status(404).json({
        message: "Product not deleted!",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      Product: product,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// delete Multiple Product
export async function deleteMultipleProduct(req, res) {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Invalid input. Expected array of IDs.",
      });
    }

    // Delete images from Cloudinary
    for (const id of ids) {
      const product = await ProductModel.findById(id);
      if (product && Array.isArray(product.images)) {
        for (const imgUrl of product.images) {
          const imageName = imgUrl.split("/").pop().split(".")[0];
          if (imageName) {
            cloudinary.uploader.destroy(imageName);
          }
        }
      }
    }

    await ProductModel.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      error: false,
      message: "Products deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || "Server error during deletion",
    });
  }
}

// get single Product
export async function getProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id).populate("category");

    if (!product) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "The Product is not found",
      });
    }

    return res.status(200).json({
      data: product,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// Delete Image
export async function removeImageFromCludinary(req, res) {
  try {
    const imgUrl = req.query.img;
    if (!imgUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Image URL is required" });
    }

    // Split URL and extract public_id
    const urlArr = imgUrl.split("/");
    const imageWithExtension = urlArr[urlArr.length - 1]; // e.g., "1749791204341_Screenshot.png"
    const imageName = imageWithExtension.split(".")[0]; // e.g., "1749791204341_Screenshot"

    // Optional: prepend folder name if applicable
    const folderName = urlArr.includes("upload")
      ? ""
      : urlArr[urlArr.length - 2];
    const publicId = folderName ? `${folderName}/${imageName}` : imageName;

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return res
        .status(200)
        .json({ success: true, message: "Image deleted successfully", result });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Image deletion failed", result });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server Error" });
  }
}

// Update Product
export async function updateProduct(req, res) {
  try {
    const { id } = req.params;

    const product = await ProductModel.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        bannerTitlename: req.body.bannerTitlename,
        isDisplayOnHomeBanner: req.body.isDisplayOnHomeBanner,
        description: req.body.description,
        images: req.body.images,
        bannerimages: req.body.bannerimages,
        brand: req.body.brand,
        price: req.body.price,
        newPrice: req.body.newPrice,
        oldPrice: req.body.oldPrice,
        catName: req.body.catName,
        catId: req.body.catId,
        subCat: req.body.subCat,
        subCatId: req.body.subCatId,
        thirdsubCatName: req.body.thirdsubCatName,
        thirdsubCatId: req.body.thirdsubCatId,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        isFeatured: req.body.isFeatured,
        discount: req.body.discount,
        productRam: req.body.productRam,
        size: req.body.size,
        productWeight: req.body.productWeight,
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product cannot be updated!",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "The Product is updated!",
      error: false,
      success: true,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Server Error",
    });
  }
}
// End Product Controller

// FOR RAM CONTROLLER

// Create RAMS
export async function createProductRAMS(req, res) {
  try {
    let productRAMS = new ProductRAMSModel({
      name: req.body.name,
    });

    productRAMS = await productRAMS.save();

    if (!productRAMS) {
      res.status(500).json({
        message: "Product not Created",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "Product RAMS Created Successfully",
      error: false,
      success: true,
      productRAMS: productRAMS,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// get single Product RAMS
export async function getProductRAMSById(req, res) {
  try {
    const { id } = req.params;
    const productRAM = await ProductRAMSModel.findById(id);

    if (!productRAM) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "The Product RAM is not found",
      });
    }

    return res.status(200).json({
      productRAM: productRAM,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// delete Product RAMS
export async function deleteProductRAM(req, res) {
  try {
    const productRAMS = await ProductRAMSModel.findById(req.params.id);

    if (!productRAMS) {
      return res.status(500).json({
        error: true,
        success: false,
        message: "ProductRAMS not found",
      });
    }

    const deleteProductRAMS = await ProductRAMSModel.findByIdAndDelete(
      req.params.id
    );

    if (!deleteProductRAMS) {
      res.status(404).json({
        message: "Product RAMS not deleted!",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      productRAMS: productRAMS,
      message: "Product RAMS deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// delete Multiple Product
export async function deleteMultipleProductRAMS(req, res) {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Invalid input. Expected array of IDs.",
      });
    }

    await ProductRAMSModel.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      error: false,
      message: "All product RAMS deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || "Server error during deletion",
    });
  }
}

// Update Product RAMS
export async function updateProductRAMS(req, res) {
  try {
    const { id } = req.params;

    const productRAM = await ProductRAMSModel.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
      },
      { new: true }
    );

    if (!productRAM) {
      return res.status(404).json({
        message: "Product RAMS cannot be updated!",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "Product RAMS  is updated!",
      error: false,
      success: true,
      data: productRAM,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Server Error",
    });
  }
}
// Update Product RAMS
// export async function updateProductRAMS(req, res) {
//   try {
//     const { id } = req.params;
//     const { name, qty, subTotal, size, ram, weight } = req.body;

//     const productRAM = await ProductRAMSModel.findByIdAndUpdate(
//       id,
//       {
//         ...(name && { name }),
//         ...(qty && { qty }),
//         ...(subTotal && { subTotal }),
//         ...(size && { size }),
//         ...(ram && { ram }),
//         ...(weight && { weight }),
//       },
//       { new: true }
//     );

//     if (!productRAM) {
//       return res.status(404).json({
//         message: "Product RAMS cannot be updated!",
//         error: true,
//         success: false,
//       });
//     }

//     return res.status(200).json({
//       message: "Product RAMS is updated!",
//       error: false,
//       success: true,
//       data: productRAM,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       error: true,
//       message: error.message || "Server Error",
//     });
//   }
// }

// get all Product RAMS
export async function getAllProductRAM(req, res) {
  try {
    const productRAM = await ProductRAMSModel.find();

    if (!productRAM) {
      return res.status(500).json({
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "Product RAMS fetched successfully",
      data: productRAM,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// FOR WEIGHT CONTROLLER
// Create Weight
export async function createProductWeight(req, res) {
  try {
    let productWeight = new ProductWeightModel({
      name: req.body.name,
    });

    productWeight = await productWeight.save();

    if (!productWeight) {
      res.status(500).json({
        message: "Product Weight not Created",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "Product Weight Created Successfully",
      error: false,
      success: true,
      data: productWeight,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// get single Product Weight
export async function getProductWeightById(req, res) {
  try {
    const { id } = req.params;
    const productWeight = await ProductWeightModel.findById(id);

    if (!productWeight) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "The Product Weight is not found",
      });
    }

    return res.status(200).json({
      data: productWeight,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// delete Product Weight
export async function deleteProductWeight(req, res) {
  try {
    const productWeight = await ProductWeightModel.findById(req.params.id);

    if (!productWeight) {
      return res.status(500).json({
        error: true,
        success: false,
        message: "Product Weight not found",
      });
    }

    const deleteProductWeight = await ProductWeightModel.findByIdAndDelete(
      req.params.id
    );

    if (!deleteProductWeight) {
      res.status(404).json({
        message: "Product Weight not deleted!",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      data: productWeight,
      message: "Product Weight deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// delete Multiple Weight
export async function deleteMultipleProductWeight(req, res) {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Invalid input. Expected array of IDs.",
      });
    }

    await ProductWeightModel.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      error: false,
      message: "All Product Weight deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || "Server error during deletion",
    });
  }
}

// Update Product Weight
export async function updateProductWeight(req, res) {
  try {
    const { id } = req.params;

    const productWeight = await ProductWeightModel.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
      },
      { new: true }
    );

    if (!productWeight) {
      return res.status(404).json({
        message: "Product Weight cannot be updated!",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "Product RAMS  is updated!",
      error: false,
      success: true,
      data: productWeight,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Server Error",
    });
  }
}

// get all Product Weight
export async function getAllProductWeight(req, res) {
  try {
    const productWeight = await ProductWeightModel.find();

    if (!productWeight) {
      return res.status(500).json({
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "Product Weight fetched successfully",
      data: productWeight,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// FOR SIZE CONTROLLER
// Create SIZE
export async function createProductSize(req, res) {
  try {
    let productSize = new ProductSizeModel({
      name: req.body.name,
    });

    productSize = await productSize.save();

    if (!productSize) {
      res.status(500).json({
        message: "Product Size not Created",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "Product Size Created Successfully",
      error: false,
      success: true,
      data: productSize,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// get single Product Size
export async function getProductSizeById(req, res) {
  try {
    const { id } = req.params;
    const productSize = await ProductSizeModel.findById(id);

    if (!productSize) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "The Product Size is not found",
      });
    }

    return res.status(200).json({
      data: productSize,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// delete Product Size
export async function deleteProductSize(req, res) {
  try {
    const productSize = await ProductSizeModel.findById(req.params.id);

    if (!productSize) {
      return res.status(500).json({
        error: true,
        success: false,
        message: "ProductWeight not found",
      });
    }

    const deleteProductSize = await ProductSizeModel.findByIdAndDelete(
      req.params.id
    );

    if (!deleteProductSize) {
      res.status(404).json({
        message: "Product Size not deleted!",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      data: productSize,
      message: "Product Size deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// delete Multiple Product
export async function deleteMultipleProductSize(req, res) {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Invalid input. Expected array of IDs.",
      });
    }

    await ProductSizeModel.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      error: false,
      message: "All product size deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || "Server error during deletion",
    });
  }
}

// Update Product RAMS
export async function updateProductSize(req, res) {
  try {
    const { id } = req.params;

    const productSize = await ProductSizeModel.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
      },
      { new: true }
    );

    if (!productSize) {
      return res.status(404).json({
        message: "Product Size cannot be updated!",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "Product Size  is updated!",
      error: false,
      success: true,
      data: productSize,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Server Error",
    });
  }
}

// get all Product RAMS
export async function getAllProductSize(req, res) {
  try {
    const productSize = await ProductSizeModel.find();

    if (!productSize) {
      return res.status(500).json({
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "Product Size fetched successfully",
      data: productSize,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// end of weight

// *************************************
// for filter of product
export async function filter(req, res) {
  try {
    const {
      catId = [],
      subCatId = [],
      thirdsubCatId = [],
      minPrice = 0,
      maxPrice = 50000,
      page = 1,
      // limit = 10,
      rating,
    } = req.body;

    const limit = 5;

    let query = {};

    if (catId.length > 0) {
      query.catId = { $in: catId }; // no ObjectId conversion, because it's String
    }

    if (subCatId.length > 0) {
      query.subCatId = { $in: subCatId };
    }

    if (thirdsubCatId.length > 0) {
      query.thirdsubCatId = { $in: thirdsubCatId };
    }

    query.price = { $gte: minPrice, $lte: maxPrice };

    // ✅ Rating filter (assuming rating is stored as a Number in product schema)
    if (rating && Number(rating) > 0) {
      query.rating = Number(rating);
    }

    const skip = (page - 1) * limit;

    const products = await ProductModel.find(query).skip(skip).limit(limit);
    const total = await ProductModel.countDocuments(query);

    return res.json({
      error: false,
      success: true,
      data: products,
      // total,
      // page,
      // totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message,
    });
  }
}

// sort by Name and Price
export async function sortBy(req, res) {
  try {
    let {
      sortBy,
      order,
      page = 1,
      limit = 10,
      catId = [],
      subCatId = [],
      thirdsubCatId = [],
      minPrice = 0,
      maxPrice = 999999,
      rating,
    } = req.body;

    page = Math.max(1, parseInt(page) || 1);
    limit = Math.max(1, parseInt(limit) || 5);

    // sort
    let sortOption = {};
    if (sortBy === "name") sortOption.name = order === "asc" ? 1 : -1;
    if (sortBy === "price") sortOption.price = order === "asc" ? 1 : -1;

    // filter query
    let query = {
      price: { $gte: minPrice, $lte: maxPrice },
    };
    if (catId.length) query.catId = { $in: catId };
    if (subCatId.length) query.subCatId = { $in: subCatId };
    if (thirdsubCatId.length) query.thirdsubCatId = { $in: thirdsubCatId };
    if (rating) query.rating = rating;

    // count + fetch
    const totalProducts = await ProductModel.countDocuments(query);
    const products = await ProductModel.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      products,
      page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// for all page searching
export async function searchProductController(req, res) {
  try {
    const { query, page, limit } = req.body;

    if (!query) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Query is required",
      });
    }

    const items = await ProductModel.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
        { catName: { $regex: query, $options: "i" } },
        { subCatName: { $regex: query, $options: "i" } },
        { thirdsubCatName: { $regex: query, $options: "i" } },
      ],
    })
      .populate("category")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await items.length;

    return res.status(200).json({
      error: false,
      success: true,
      data: items,
      total: 1,
      page: parseInt(page),
      // totalPages: Math.ceil(total / limit),
      totalPages: 1,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}
