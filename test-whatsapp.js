import sendWhatsAppMessage from "./services/whatsapp.service.js";

const test = async () => {
    await sendWhatsAppMessage(
        "919643657800",
        "🚀 Hello! This message was sent by my Job Intelligence Engine."
    );
}

test();