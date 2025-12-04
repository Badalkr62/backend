import CartProductModel from "../models/cartProduct.model.js";

// add to cart Item
export async function addToCartItemController(req, res) {
  try {
    const userId = req.userId; // from middleware
    const {
      productTitle,
      images,
      rating,
      price,
      quantity,
      subTotal,
      productId,
      countInStock,
      brand,
      oldPrice,
      discount,
      size,
      weight,
      ram,
    } = req.body;

    if (!productId) {
      return res.status(402).json({
        message: "Provide ProductId",
        success: false,
        error: true,
      });
    }

    const checkItemCart = await CartProductModel.findOne({
      userId: userId,
      productId: productId,
    });

    if (checkItemCart) {
      return res.status(400).json({
        message: "Item already in cart",
        success: false,
        error: true,
      });
    }

    const cartItem = new CartProductModel({
      productTitle: productTitle,
      images: images,
      rating: rating,
      price: price,
      quantity: quantity,
      subTotal: subTotal,
      productId: productId,
      countInStock: countInStock,
      userId: userId,
      brand: brand,
      oldPrice: oldPrice,
      discount: discount,
      size: size,
      weight: weight,
      ram: ram,
    });

    const save = await cartItem.save();

    return res.status(200).json({
      message: "Item added successfully",
      data: save,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Something went wrong",
    });
  }
}

// get cart
// export async function getCartItemController(req, res) {
//   try {
//     const userId = req.userId;

//     const cartItems = await CartProductModel.find({
//       userId: userId,
//     });

//     return res.status(200).json({
//       data: cartItems,
//       error: false,
//       success: true,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       error: true,
//       message: error.message || error,
//     });
//   }
// }

export async function getCartItemController(req, res) {
  try {
    const userId = req.userId;

    const cartItems = await CartProductModel.find({ userId }).populate(
      "productId"
    ); // ✅ get full product details

    return res.status(200).json({
      data: cartItems,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || error,
    });
  }
}

// update
// export async function updateCartItemQtyController(req, res) {
//   try {
//     const userId = req.userId;
//     const { _id, qty, subTotal, size, ram, weight } = req.body;

//     if (!_id || !qty) {
//       return res.status(400).json({
//         message: "Provide _id, qty",
//       });
//     }

//     const updateCartItem = await CartProductModel.updateMany(
//       {
//         _id: _id,
//         userId: userId,
//       },
//       {
//         quantity: qty,
//         subTotal: subTotal,
//         size: size,
//         weight: weight,
//         ram: ram,
//       },
//       { new: true }
//     );

//     return res.status(200).json({
//       message: "Update cart item",
//       success: true,
//       error: false,
//       data: updateCartItem,
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       error: true,
//       message: error.message || error,
//     });
//   }
// }

// Update cart item controller
export async function updateCartItemQtyController(req, res) {
  try {
    const userId = req.userId;
    const { _id, qty, subTotal, size, ram, weight } = req.body;

    // Validate required fields
    if (!_id || !qty) {
      return res.status(400).json({
        message: "Provide _id and qty",
        success: false,
        error: true,
      });
    }

    // Update single cart item and return the updated document
    const updatedCartItem = await CartProductModel.findOneAndUpdate(
      { _id: _id, userId: userId },
      { quantity: qty, subTotal, size, ram, weight },
      { new: true } // returns the updated document
    );

    if (!updatedCartItem) {
      return res.status(404).json({
        message: "Cart item not found",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      message: "Cart item updated successfully",
      error: false,
      success: true,
      data: updatedCartItem,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      success: false,
      error: true,
    });
  }
}

// delete cart Item Qty Controller
export async function deleteCartItemQtyController(req, res) {
  try {
    const userId = req.userId; // middleware
    const { id } = req.params; // <-- change _id to id

    if (!id) {
      return res.status(400).json({
        message: "Provide Id",
        error: true,
        success: false,
      });
    }

    const deleteCartItem = await CartProductModel.deleteOne({
      _id: id, // match Mongo _id with param id
      userId: userId,
    });

    if (deleteCartItem.deletedCount === 0) {
      return res.status(400).json({
        message: "The Product in the cart is not found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "Item Removed",
      error: false,
      success: true,
      data: deleteCartItem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || error,
    });
  }
}

export const emptyCartController = async (req, res) => {
  try {
    const userId = req.params.id; //middleware

    await CartProductModel.deleteMany({ userId: userId });

    return res.status(200).json({
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message,
    });
  }
};
