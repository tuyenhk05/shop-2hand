const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/payment.controller');

router.post('/create_payment_url', controller.createPaymentUrl);
router.post('/verify', controller.verifyPayment);

module.exports = router;
