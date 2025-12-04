import mongoose, { mongo, Mongoose } from "mongoose";

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        default: "",
        trim: true,
    },
    images: {
        type: [String],
        default: []
    },
    productCatName: {
        type: String,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null
    }

}, { timestamps: true })

const CategoryModel = mongoose.model('Category', categorySchema);

export default CategoryModel;