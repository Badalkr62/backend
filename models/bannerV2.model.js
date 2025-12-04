import mongoose from "mongoose";

const bannerV2Schema = new mongoose.Schema(
  {
    bannerTitlename: {
      type: String,
      default: "",
    },
    catId: {
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
    discount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const BannerV2Model = mongoose.model("bannerV21", bannerV2Schema);

export default BannerV2Model;
