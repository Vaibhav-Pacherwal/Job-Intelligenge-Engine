import express from 'express';
import connectDB from './config/db.js';
import Job from './models/job.model.js';
import dotenv from 'dotenv';
import sendWhatsAppMessage from './services/whatsapp.service.js';
dotenv.config();

const app = express();
const port = process.env.Port || 8000;

const main = async () => {
    app.listen(port, () => {
        console.log(`server is running on port ${port}`);
    });
    await connectDB();
}

main();

app.use(express.json());

app.get("/webhook/whatsapp", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (
        mode === "subscribe" &&
        token === process.env.WHATSAPP_VERIFY_TOKEN
    ) {
        console.log("WhatsApp webhook verified!");

        return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
});

app.post("/webhook/whatsapp", (req, res) => {
    console.log("WhatsApp webhook received!");
    const message = req.body.entry[0].changes[0].value.messages[0];

    if(!message) {
        return res.sendStatus(200);
    }

    let from = message.from;
    let text = message.text.body;
    text = text.toLowerCase();
    console.log(`From: +${from}`);
    console.log(`Text: ${text}`);

    switch (text) {
        case "hi": sendWhatsAppMessage(from, "Are you looking for a job or internship?");
    }

    res.sendStatus(200);
});

app.get("/privacy", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Privacy Policy - Job Intelligence Engine</title>
        </head>
        <body>
            <h1>Privacy Policy</h1>

            <p>
                Job Intelligence Engine provides job and internship
                information through WhatsApp.
            </p>

            <h2>Information We Collect</h2>
            <p>
                When you interact with our WhatsApp service, we may process
                your WhatsApp phone number and messages so that we can
                provide job and internship search services.
            </p>

            <h2>How We Use Information</h2>
            <p>
                We use this information only to provide and improve our
                job-search and messaging service.
            </p>

            <h2>Data Sharing</h2>
            <p>
                We do not sell your personal information to third parties.
            </p>

            <h2>Contact</h2>
            <p>
                If you have questions about this privacy policy, please
                contact the Job Intelligence Engine team.
            </p>
        </body>
        </html>
    `);
});