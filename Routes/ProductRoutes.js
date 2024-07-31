import express from "express";
import { getAllProducts } from "../Controllers/ProductController.js";
const router = express.Router()


router.route("/getAllProducts").get(getAllProducts)

// module.exports = router;
export default router;
