import axios from "axios";

// INITIALIZE PAYMENT
export const initializePayment = async (req, res) => {
  try {
    const { email, amount, metadata } = req.body;

    console.log("Incoming payment data:", req.body);
    console.log("Secret key exists:", !!process.env.PAYSTACK_SECRET_KEY);

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount,
        callback_url: "http://localhost:5173/payment-success",
        metadata
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Paystack response:", response.data);

    res.status(200).json({
      success: true,
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference
    });
  } catch (error) {
    console.error("FULL PAYSTACK ERROR:");
    console.error(error.response?.data || error.message || error);

    res.status(500).json({
      success: false,
      message: error.response?.data?.message || "Payment initialization failed"
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