const express = require("express")
const { getAllProducts } = require("../Controllers/ProductController")
const router = express.Router()


router.route("/getAllProducts").get(getAllProducts)

module.exports = router;
// export default router;
