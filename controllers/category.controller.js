import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import CategoryModel from "../models/category.models.js";

// Configuration
cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret, // Click 'View API Keys' above to copy your API secret
});

// image Upload
var imageArr = [];
export async function uploadImages(req, res) {
  try {
    imageArr = [];
    const images = req.files;
    console.log(images);

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
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// create category
export async function createCategory(req, res) {
  try {
    let category = new CategoryModel({
      name: req.body.name,
      images: imageArr,
      color: req.body.color,
      productId: req.body.productId,
      productCatName: req.body.productCatName,
    });

    if (!category) {
      res.status(500).json({
        message: "Category not Created",
        error: true,
        success: false,
      });
    }

    category = await category.save();
    imageArr = [];

    return res.status(200).json({
      message: "Category Created",
      error: false,
      success: true,
      category: category,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// get Category
export async function getCategories(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    const totalPosts = await CategoryModel.countDocuments({ productId: null });
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res.status(404).json({
        message: "Page not found",
        error: true,
        success: false,
      });
    }

    const category = await CategoryModel.find({ productId: null })
      .skip((page - 1) * perPage)
      .limit(perPage);

    if (!category) {
      res.status(500).json({
        error: false,
        success: true,
        data: "Blog Not found",
      });
    }

    const categories = await CategoryModel.find();
    const categoryMap = {};

    categories.forEach((cat) => {
      categoryMap[cat._id] = { ...cat._doc, children: [] };
    });

    const rootCategories = [];

    categories.forEach((cat) => {
      if (cat.productId) {
        categoryMap[cat.productId].children.push(categoryMap[cat._id]);
      } else {
        rootCategories.push(categoryMap[cat._id]);
      }
    });

    res.status(200).json({
      error: false,
      success: true,
      data: rootCategories,
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

// get category count
export async function getCategoriesCount(req, res) {
  try {
    const categoryCount = await CategoryModel.countDocuments({
      productId: undefined,
    });

    if (!categoryCount) {
      res.status(500).json({
        success: false,
        error: true,
      });
    } else {
      res.send({
        categoryCount: categoryCount,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// get sub-category count
export async function getSubCategoriesCount(req, res) {
  try {
    const subcat = await CategoryModel.find({ productId: { $ne: undefined } });

    if (!subcat) {
      res.status(500).json({
        success: false,
        error: true,
      });
    } else {
      const subCatList = [];
      for (let cat of subcat) {
        if (cat.productId !== undefined) {
          subCatList.push(cat);
        }
      }

      res.send({
        SubCategoryCount: subcat.length,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// get single category
export async function getCategory(req, res) {
  try {
    const category = await CategoryModel.findById(req.params.id);

    if (!category) {
      res.status(500).json({
        message: "The category with the give ID was not found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      category: category,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// Remove Image
export async function removeImageFromCloudinary(req, res) {
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

// delete main category
export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    const category = await CategoryModel.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
        error: true,
        success: false,
      });
    }

    // Delete images from Cloudinary
    for (let img of category.images) {
      const urlArr = img.split("/");
      const imageWithExt = urlArr[urlArr.length - 1];
      const folder = urlArr[urlArr.length - 2];
      const imageName = imageWithExt.split(".")[0];
      const publicId = `${folder}/${imageName}`;
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete third-level subcategories
    const subCategories = await CategoryModel.find({
      productId: req.params.id,
    });

    for (let sub of subCategories) {
      const thirdLevel = await CategoryModel.find({ productId: sub._id });
      for (let third of thirdLevel) {
        await CategoryModel.findByIdAndDelete(third._id);
      }
      await CategoryModel.findByIdAndDelete(sub._id);
    }

    // Delete the main category
    const deletedMain = await CategoryModel.findByIdAndDelete(req.params.id);

    if (!deletedMain) {
      return res.status(400).json({
        message: "Main category not deleted",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      message: "Category deleted successfully!",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
}

// Updaate category
export async function updateCategory(req, res) {
  try {
    const category = await CategoryModel.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        images: imageArr.length > 0 ? imageArr[0] : req.body.images,
        color: req.body.color,
        productId: req.body.productId,
        productCatName: req.body.productCatName,
      },
      { new: true }
    );

    if (!category) {
      return res.status(500).json({
        message: "Category can not be updated",
        error: true,
        success: false,
      });
    }

    res.status(200).json({
      error: false,
      success: true,
      message: "Category updated successfully",
      category: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
}
