const express = require("express")
const { getAllProducts, createProduct, getSingleProduct, updateProduct, deleteProduct, DeleteReview, createReview, GetReviews, canUserReview, getAdminProducts, uploadProductImages, DeleteProductImage } = require("../Controllers/ProductController")
const { isAuthenticated_User, Authorize_Roles } = require("../Middlewares/AuthMiddleware")
const router = express.Router()


router.route("/getAllProducts").get(getAllProducts)
router.route("/admin/newProduct").post(isAuthenticated_User, Authorize_Roles("admin"), createProduct)
router.route("/admin/products").get(isAuthenticated_User, Authorize_Roles("admin"), getAdminProducts)
router.route("/admin/product/:id").get(isAuthenticated_User, Authorize_Roles("admin"), getSingleProduct).put(isAuthenticated_User, Authorize_Roles("admin"), updateProduct).delete(isAuthenticated_User, Authorize_Roles("admin"), deleteProduct)
router.route("/admin/product/:id/upload_images").put(isAuthenticated_User, Authorize_Roles("admin"), uploadProductImages)
router.route("/admin/product/:id/delete_image").put(isAuthenticated_User, Authorize_Roles("admin"), DeleteProductImage)
router.route("/product/:id").get(getSingleProduct)
router.route("/reviews").put(isAuthenticated_User, createReview)
router.route("/can_review").get(isAuthenticated_User, canUserReview)
router.route("/allReviews").get(GetReviews)
router.route("/review/delete").delete(isAuthenticated_User, Authorize_Roles("admin"), DeleteReview)

module.exports = router;
// export default router;
