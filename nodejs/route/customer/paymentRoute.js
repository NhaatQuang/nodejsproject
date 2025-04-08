const express = require("express");
const router = express.Router();
const paymentController = require("../../controller/customer/paymentController");

router.get("/form", (req, res) => {
    res.render("customer/paymentForm");
});

router.post("/create", paymentController.createPayment);
router.get("/return", paymentController.paymentReturn);

module.exports = router;