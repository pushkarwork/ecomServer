const express = require('express');
const { isAuthenticated_User, Authorize_Roles } = require('../Middlewares/AuthMiddleware');
const { newOrder, singleOrder, myOrders, allOrders, updateOrder, DeleteOrder } = require('../Controllers/orderController');
const router = express.Router();

router.route("/order/new").post(isAuthenticated_User, newOrder)
router.route("/order/:id").get(isAuthenticated_User, singleOrder)
router.route("/myorders").get(isAuthenticated_User, myOrders)
router.route("/admin/allorders").get(isAuthenticated_User, Authorize_Roles("admin"), allOrders)
router.route("/admin/order/:id").put(isAuthenticated_User, Authorize_Roles("admin"), updateOrder).delete(isAuthenticated_User, Authorize_Roles("admin"), DeleteOrder)





module.exports = router;