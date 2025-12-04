import { Router } from 'express';
import upload from "../middlewares/multer.js"
import auth from '../middlewares/auth.js';
import { createCategory, getCategoriesCount, getCategory, getCategories,getSubCategoriesCount,uploadImages, removeImageFromCloudinary, deleteCategory, updateCategory, } from '../controllers/category.controller.js';



const categoryRoute = Router();
// Upload Images
categoryRoute.post('/uplaodImages',auth,upload.array("images"), uploadImages);
// create Images
categoryRoute.post('/create',auth,createCategory);
// get category details
categoryRoute.get('/',getCategories);
// count the category
categoryRoute.get('/get/count',getCategoriesCount);
// count the sub-category
categoryRoute.get('/get/count/subCat',getSubCategoriesCount);
//get category
categoryRoute.get('/:id',getCategory);
//delete images
categoryRoute.delete('/deleteImage', auth, removeImageFromCloudinary); 
// delete by id
categoryRoute.delete('/:id', auth, deleteCategory); 
// update categorty
categoryRoute.put('/:id', auth, updateCategory);


export default categoryRoute;