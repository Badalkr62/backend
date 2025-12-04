import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js";
// create  Address
export async function addAddressController(req, res) {
  try {
    const {
      address_line1,
      city,
      state,
      pincode,
      country,
      mobile,
      addressType,
      landmark,
    } = req.body;

    const userId = req.userId;

    if (
      !address_line1 ||
      !city ||
      !state ||
      !pincode ||
      !country ||
      !mobile ||
      !landmark ||
      !addressType
    ) {
      return res.status(400).json({
        message: "Please provide all the fileds ",
        error: true,
        success: false,
      });
    }

    const address = new AddressModel({
      address_line1,
      city,
      state,
      pincode,
      country,
      mobile,
      landmark,
      userId,
      addressType,
    });

    const saveAddress = await address.save();

    // const updateAddress = await UserModel.updateOne(
    //   { _id: userId },
    //   {
    //     $push: {
    //       address_details: saveAddress?._id,
    //     },
    //   }
    // );

    const updateAddress = await UserModel.updateOne(
      { _id: userId },
      {
        $push: {
          address_details: saveAddress, // store full address object
        },
      }
    );

    // Send success response
    return res.status(200).json({
      success: true,
      error: false,
      message: "Address add successfully",
      data: saveAddress,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

// Get all addresses for a user
export async function getAddressController(req, res) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "User ID is required",
      });
    } else {
      const updateUser = await UserModel.updateOne(
        { _id: req.query.userId },
        {
          $push: {
            address_details: userId,
          },
        }
      );
    }

    const addresses = await AddressModel.find({ userId });

    return res.status(200).json({
      success: true,
      error: false,
      message: "Addresses fetched successfully",
      data: addresses,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

// for selected
// export async function selectAddressController(req, res) {
//   try {
//     const userId = req.userId.id;

//     const address = await AddressModel.find({
//       _id: req.params.id,
//       userId:userId
//     });

//     const updateAddress = await AddressModel.find(
//      {
//       userId:userId
//      }
//   )

//     if (!address) {
//       return res.status(500).json({
//         success: false,
//         error: true,
//         message: error.message || error,
//       });
//     } else {
//       const updateAddress = await AddressModel.findByIdAndUpdate(
//         req.params.id,
//         {
//           selected: false,
//         },
//         {
//           new: true,
//         }
//       );

//       return res.status(200).json({
//         success: true,
//         error: false,
//         message: "Address marked as selected",
//         data: updateAddress,
//       });
//     }

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       error: true,
//       message: error.message || "Internal server error",
//     });
//   }
// }

// delete address
export async function deleteAddressController(req, res) {
  try {
    const userId = req.userId; // midleware
    const _id = req.params.id;

    if (!_id) {
      return res.status(400).json({
        message: "Please provide addressId",
        error: true,
        success: false,
      });
    }

    const deleteAddress = await AddressModel.deleteOne({
      _id: _id,
      userId: userId,
    });

    if (deleteAddress.deletedCount === 0) {
      // Check deletedCount instead
      return res.status(400).json({
        message: "Address not found or already deleted",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "Address Remove Successfully",
      error: false,
      success: true,
      data: deleteAddress,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || error,
    });
  }
}

// for Edits
export async function editAddressController(req, res) {
  try {
    const id = req.params.id;

    const {
      address_line1,
      city,
      state,
      pincode,
      country,
      mobile,
      addressType,
      landmark,
    } = req.body;

    // Check if the address belongs to the user
    const address = await AddressModel.findByIdAndUpdate(
      id,
      {
        address_line1: address_line1,
        city: city,
        state: state,
        pincode: pincode,
        country: country,
        mobile: mobile,
        addressType: addressType,
        landmark: landmark,
      },
      { new: true }
    );
    if (!address) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Address not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "Address updated successfully",
      data: address,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

// get single address by id
export async function getSingleAddressController(req, res) {
  try {
    const id = req.params.id;
    const address = await AddressModel.findOne({ _id: id });
    if (!address) {
      return res.status(404).json({
        message: "Address not found",
        error: true,
        success: false,
      });
    }
    return res.status(200).json({
      error: false,
      success: true,
      data: address,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}
