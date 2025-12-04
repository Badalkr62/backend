import mongoose from "mongoose";

const bannerV1Schema = new mongoose.Schema(
  {
    bannerTitlename: {
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
    thirdsubCatId: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    alignInfo:{
      type:String,
      required:true,
      default:""
    }
  },
  { timestamps: true }
);

const BannerV1Model = mongoose.model("bannerV1", bannerV1Schema);

export default BannerV1Model;
