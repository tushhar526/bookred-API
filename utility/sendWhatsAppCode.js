const axios = require('axios');

const sendWhatsAppCode = async (phoneNumber, code) => {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN; 
    const fromPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    const response = await axios.post(
      `https://graph.facebook.com/v15.0/${fromPhoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: phoneNumber, // User's WhatsApp number in international format
        type: "text",
        text: {
          body: `Your verification code is: ${code}`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("WhatsApp message sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error.response?.data || error.message);
    throw new Error("Could not send WhatsApp message");
  }
};

module.exports = sendWhatsAppCode;
