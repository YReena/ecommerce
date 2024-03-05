const express = require("express");
const {isAuthenticateduser, authorizedRoles }= require("../middleware/auth");
const {registerUser, loginUser, logout, forgotPassword, resetPassword,getUserDetails, updatePassword, updateProfile, getAllUser, getSingleUser, updateUserRole, deleteUser} = require("../controllers/userControllers");

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/logout").get(logout);
router.route("/me").get(isAuthenticateduser, getUserDetails);
router.route("/password/update").put(isAuthenticateduser, updatePassword);
router.route("/me/update").put(isAuthenticateduser, updateProfile);
router.route("/admin/users").get(isAuthenticateduser,authorizedRoles("admin"), getAllUser);
router.route("/admin/user/:id").get(isAuthenticateduser,authorizedRoles("admin"),getSingleUser)
.put(isAuthenticateduser, authorizedRoles("admin"),updateUserRole)
.delete(isAuthenticateduser, authorizedRoles("admin"), deleteUser);


module.exports = router;

