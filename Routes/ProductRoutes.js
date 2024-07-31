const express = require("express")
const { getAllProducts, createProduct, getSingleProduct, updateProduct, deleteProduct } = require("../Controllers/ProductController")
const router = express.Router()


router.route("/getAllProducts").get(getAllProducts)
router.route("/admin/newProduct").post(createProduct)
router.route("/product/:id").get(getSingleProduct).put(updateProduct).delete(deleteProduct)

module.exports = router;
// export default router;
