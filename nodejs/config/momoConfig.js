module.exports = {
    partnerCode: "MOMO",
    accessKey: "F8BBA842ECF85",
    secretKey: "K951B6PE1waDMi640xX08PD3vg6EkVlz",
    endpoint: "https://test-payment.momo.vn/v2/gateway/api/create",
    returnUrl: process.env.MOMO_RETURN_URL || 'http://localhost:3000/payment/momo/callback',
    notifyUrl: "http://localhost:3000/payment/notify",
  };