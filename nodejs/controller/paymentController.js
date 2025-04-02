// controller/paymentController.js
const axios = require('axios');
const crypto = require('crypto');

const accessKey = process.env.MOMO_ACCESS_KEY;
const secretKey = process.env.MOMO_SECRET_KEY;

const paymentController = {
    createPayment: async (req, res) => {
        try {
            const { amount } = req.body;
            const orderId = `MOMO${Date.now()}`;
            
            const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=&ipnUrl=${process.env.IPN_URL}&orderId=${orderId}&orderInfo=Pay with MoMo&partnerCode=MOMO&redirectUrl=${process.env.REDIRECT_URL}&requestId=${orderId}&requestType=payWithMethod`;

            const signature = crypto.createHmac('sha256', secretKey)
                .update(rawSignature)
                .digest('hex');

            const requestBody = {
                partnerCode: "MOMO",
                partnerName: "Your App Name",
                storeId: "MomoTestStore",
                requestId: orderId,
                amount: amount.toString(),
                orderId: orderId,
                orderInfo: "Pay with MoMo",
                redirectUrl: process.env.REDIRECT_URL,
                ipnUrl: process.env.IPN_URL,
                requestType: "payWithMethod",
                signature: signature,
                lang: "vi"
            };

            const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody);
            res.status(200).json(response.data);
        } catch (error) {
            res.status(500).json({ error: "Payment creation failed" });
        }
    },

    handleCallback: async (req, res) => {
        console.log("Callback data:", req.body);
        res.status(200).json(req.body);
    },

    checkTransactionStatus: async (req, res) => {
        const { orderId } = req.body;
        const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;

        const signature = crypto.createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');

        const requestBody = {
            partnerCode: "MOMO",
            requestId: orderId,
            orderId: orderId,
            signature: signature,
            lang: "vi"
        };

        try {
            const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/query', requestBody);
            res.status(200).json(response.data);
        } catch (error) {
            res.status(500).json({ error: "Failed to check transaction status" });
        }
    }
};

module.exports = paymentController;