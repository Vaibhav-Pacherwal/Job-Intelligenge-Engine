import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const sendWhatsAppMessage = async (to, message) => {
    try {
        const url = `https://graph.facebook.com/v23.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
        const response = await axios.post(
            url,
            {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "text",
                text: {
                    body: message
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("WhatsApp message sent!");
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
        
    } catch(err) {
        console.log(
            "WhatsApp message failed:",
            err.response?.data?.error || err.response?.data || err.message
        );
    }
}

export default sendWhatsAppMessage;