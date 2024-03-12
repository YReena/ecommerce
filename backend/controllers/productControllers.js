const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require("../middleware/catchAsyncError");
const ApiFeatures = require('../utils/apifeatures');
const cloudinary = require('cloudinary');


exports.createProduct = catchAsyncErrors(async (req, res, next) => {

  let image = [];
  if (typeof req.body.image === "string") {
    image.push(req.body.image);
  }
  else {
    image = req.body.image;
  }

  const imagesLinks = [];

  for (let i = 0; i < image.length; i++) {
    const result = await cloudinary.v2.uploader.upload(image[i], {
      folder: "products",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }
  req.body.image = imagesLinks;
  req.body.user = req.user.id;
  

  const product = await Product.create(req.body);
  console.log(product);
  res.status(201).json({
    success: true,
    product
  });
});

exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
  const productCount = await Product.countDocuments();
  const apifeatures = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
  const products = await apifeatures.query;
  console.log(products);
  res.status(201).json({
    success: true,
    products,
    productCount
  });
});

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  console.log(req.body);
  let product = await Product.findById(req.params.id);

  if (!product) {
     res.status(500).json({
      success: false,
      message: "Product not found"
    })
  }
  // Images Start Here
  let image = [];
  if (typeof req.body.image === "string") {
    image.push(req.body.image);
  }
  else {
    image = req.body.image;
  }
  console.log(image);
  if (image !== undefined) {
    // Deleting Images From Cloudinary
    for (let i = 0; i < product.image.length; i++) {
      await cloudinary.v2.uploader.destroy(product.image[i].public_id);
    }

    const imagesLinks = [];

    for (let i = 0; i < image.length; i++) {
      const result = await cloudinary.v2.uploader.upload(image[i], {
        folder: "products",
      });
  
      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
    req.body.image = imagesLinks;
    console.log(req.body);
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    product
  })
})


exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(500).json({
      success: false,
      message: "Product not found"
    })
  }
  // Deleting Images From Cloudinary
  for (let i = 0; i < product.image.length; i++) {
    await cloudinary.v2.uploader.destroy(product.image[i].public_id);
  }


  await product.deleteOne();
  res.status(200).json({
    success: true,
    message: "Product delete successfully"
  })

})

exports.getproductDetails = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  res.status(200).json({
    success: true,
    product
  })
})


// create new reviews or update the review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };
  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
})

// Get All Reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

// Get All Product (Admin)
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});