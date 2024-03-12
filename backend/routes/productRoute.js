const express = require("express");
const { getAllProducts, createProduct , updateProduct, deleteProduct,getproductDetails,createProductReview,getProductReviews,deleteReview, getAdminProducts} = require("../controllers/productControllers");
const { isAuthenticateduser,authorizedRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/products").get(getAllProducts);
router.route("/admin/products").get(isAuthenticateduser, authorizedRoles("admin"), getAdminProducts)
router.route("/admin/product/new").post(isAuthenticateduser,authorizedRoles("admin"),createProduct);
router.route("/admin/product/:id")
.put(isAuthenticateduser,authorizedRoles("admin"),updateProduct)
.delete(isAuthenticateduser,authorizedRoles("admin"),deleteProduct)
router.route("/product/:id").get(getproductDetails);

router.route("/review").put(isAuthenticateduser, createProductReview);
router
  .route("/reviews")
  .get(getProductReviews)
  .delete(isAuthenticateduser, deleteReview);

module.exports = router;