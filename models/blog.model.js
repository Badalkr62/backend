import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const BlogModel = mongoose.model("blog", blogSchema);

export default BlogModel;
