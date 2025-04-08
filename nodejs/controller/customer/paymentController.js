const axios = require("axios");
const crypto = require("crypto");
const momoConfig = require("../../config/momoConfig");

exports.createPayment = async (req, res) => {
  try {
    const { amount, orderId, orderInfo } = req.body;

    const requestId = `${orderId}-${Date.now()}`;
    const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=&ipnUrl=${momoConfig.notifyUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${momoConfig.partnerCode}&redirectUrl=${momoConfig.returnUrl}&requestId=${requestId}&requestType=captureWallet`;

    const signature = crypto
      .createHmac("sha256", momoConfig.secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode: momoConfig.partnerCode,
      accessKey: momoConfig.accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl: momoConfig.returnUrl,
      ipnUrl: momoConfig.notifyUrl,
      extraData: "",
      requestType: "captureWallet",
      signature,
    };

    const response = await axios.post(momoConfig.endpoint, requestBody);

    if (response.data.resultCode === 0) {
      res.redirect(response.data.payUrl);
    } else {
      res.status(400).json({ message: "Payment creation failed", error: response.data });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

exports.paymentReturn = (req, res) => {
  const { resultCode } = req.query;

  if (resultCode === "0") {
    res.render("customer/paymentSuccess", { message: "Payment successful!" });
  } else {
    res.render("customer/paymentFailure", { message: "Payment failed!" });
  }
};