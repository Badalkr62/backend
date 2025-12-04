import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    brand: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
    },
    oldPrice: {
      type: Number,
      default: 0,
    },
    // newPrice: {
    //   type: Number,
    //   default: 0,
    // },
    catName: {
      type: String,
      default: "",
    },
    catId: {
      type: String,
      default: "",
    },
    subCatId: {
      type: String,
      default: "",
    },
    sale: {
      type: Number,
      default: 0,
    },
    subCatName: {
      type: String,
      default: "",
    },
    thirdsubCatName: {
      type: String,
      default: "",
    },
    thirdsubCatId: {
      type: String,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    countInStock: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
      required: true,
    },
    productRam: [
      {
        type: String,
        default: [],
      },
    ],

    size: [
      {
        type: String,
        default: [],
      },
    ],
    productWeight: [
      {
        type: String,
        default: [],
      },
    ],
    bannerimages: [
      {
        type: String,
        required: true,
      },
    ],
    bannerTitlename: {
      type: String,
      required: true,
    },
    isDisplayOnHomeBanner: {
      type: Boolean,
      default: false,
    },

    dateCreated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("Product", productSchema);

export default ProductModel;
