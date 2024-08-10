const express = require("express")
const { getAllProducts, createProduct, getSingleProduct, updateProduct, deleteProduct, DeleteReview, createReview, GetReviews } = require("../Controllers/ProductController")
const { isAuthenticated_User, Authorize_Roles } = require("../Middlewares/AuthMiddleware")
const router = express.Router()


router.route("/getAllProducts").get(getAllProducts)
router.route("/admin/newProduct").post(isAuthenticated_User, createProduct)
router.route("/product/:id").get(getSingleProduct).put(updateProduct).delete(deleteProduct)
router.route("/reviews").put(isAuthenticated_User, createReview)
router.route("/allReviews").get(GetReviews)
router.route("/review/delete").delete(isAuthenticated_User,Authorize_Roles("admin"),DeleteReview)

module.exports = router;
// export default router;
