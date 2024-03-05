const catchAsyncErrors = require("../middleware/catchAsyncError");

const stripe = require("stripe")("sk_test_51OqoogSDrqqOKlpbaDc0PIIB72zTnd8uIkhm9J55cLxBjydcceFmFEQqDKNfj4J9w3QMcN9tR0A4t0bCPU74Ku8j007SVwetTo");

exports.processPayment = catchAsyncErrors(async (req, res, next) => {
  const myPayment = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",
    metadata: {
      company: "Ecommerce",
    },
  });

  res
    .status(200)
    .json({ success: true, client_secret: myPayment.client_secret });
});

exports.sendStripeApiKey = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({ stripeApiKey:"pk_test_51OqoogSDrqqOKlpbYXEPY68jqDgNBZHAqUTRQBLfIsLZ0bxjyL9skgkHfSe6eRdp5Ert5PJShD8yHLhlPX41yG8u00eoCakwB7"});
});