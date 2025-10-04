const axios = require("axios");
const crypto = require("crypto");
const momoConfig = require("../../config/momoConfig");
const sanphamDB = require('../../model/customer/sanphamDB');

exports.createPayment = async (req, res) => {
  try {
    const { total } = req.body;

    amount = total;
    orderInfo = "Pay with MoMo";

    const partnerCode = momoConfig.partnerCode;
    const accessKey = momoConfig.accessKey;
    const secretKey = momoConfig.secretKey;
    const redirectUrl = momoConfig.returnUrl;
    const ipnUrl = momoConfig.notifyUrl;
//tạo các tham số request
    const requestType = "payWithMethod";
    const orderId = `${partnerCode}${Date.now()}`;
    const requestId = orderId;
    const extraData = "";
    const orderGroupId = "";
    const autoCapture = true;
    const lang = "vi";

    const rawSignature = 
      `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");
// tạo body gủi đến API momo
    const requestBody = {
      partnerCode,
      partnerName: "Test",
      storeId: "MomoTestStore",
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang,
      requestType,
      autoCapture,
      extraData,
      orderGroupId,
      signature,
    };

    const options = {
      method: "POST",
      url: momoConfig.endpoint,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
      },
      data: requestBody,
    };

    const response = await axios(options);

    if (response.data.resultCode === 0) {
      sanphamDB.orderCart((data) => {}, req.body, req.cookies.dataLogin.ID);
      res.redirect(response.data.payUrl);
    } else {
      res.status(400).json({ message: "Payment creation failed", error: response.data });
    }

  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

exports.paymentReturn = (req, res) => {
  const { resultCode } = req.query;

  if (resultCode === "0") {
    res.redirect('/customer/home');
  } else {
    res.render("customer/paymentFailure", { message: "Payment failed!" });
  }
};