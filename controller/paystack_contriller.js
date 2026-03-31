import axios from "axios";

// INITIALIZE PAYMENT
export const initializePayment = async (req, res) => {
  try {
    const { email, amount, metadata } = req.body;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount,
        callback_url: "https://vianney-fashion-home.vercel.app/payment-success://your-frontend-domain.com/payment-success",
        metadata
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.status(200).json({
      success: true,
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Payment initialization failed"
    });
  }
};

// VERIFY PAYMENT
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    res.status(200).json({
      success: true,
      data: response.data.data
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Payment verification failed"
    });
  }
};

// WEBHOOK HANDLER
export const paystackWebhook = async (req, res) => {
  try {
    const event = req.body;

    console.log("Webhook received:", event);

    // For now, just log it
    // Later we can update order payment status here

    res.sendStatus(200);
  } catch (error) {
    console.error(error.message);
    res.sendStatus(500);
  }
};