import express from 'express';
import connectDB from './config/db.js';
import Job from './models/job.model.js';
import dotenv from 'dotenv';
import sendWhatsAppMessage from './services/whatsapp.service.js';
import filterJobs from './services/filter.service.js';
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

const users = {};
app.post("/webhook/whatsapp", async (req, res) => {
    console.log("WhatsApp webhook received!");
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if(!message) {
        return res.sendStatus(200);
    }

    let from = message.from;
    let text = message.text.body.toLowerCase().trim();
    console.log(`From: +${from}`);
    console.log(`Text: ${text}`);

    if(!users[from]) {
        users[from] = {
            state: "idle",
            parameters: {
                role: null,
                type: null,
                location: null
            }
        }
    }

    const user = users[from];

    if(text === "hi" || text === "hello") {
        user.state = "awaiting_type";
        await sendWhatsAppMessage(from, "Are you looking for a job or internship?");
        return res.sendStatus(200);
    }

    if(user.state === "awaiting_type") {
        if(text === "internship" || text === "job") {
            user.parameters.type = text;
            user.state = "awaiting_role";
            await sendWhatsAppMessage(from, "What role are you looking for?");
            return res.sendStatus(200);
        }
    }

    if(user.state === "awaiting_role") {
        user.parameters.role = text;
        user.state = "awaiting_location";
        await sendWhatsAppMessage(from, "Which location?");;
        return res.sendStatus(200);
    }

    if(user.state === "awaiting_location") {
        user.parameters.location = text;
        await sendWhatsAppMessage(from, `Searching for ${user.parameters.type}s for ${user.parameters.role} in ${user.parameters.location}...`);
        setTimeout(async () => {
            const relevantJobs = await filterJobs(user.parameters);
            await sendWhatsAppMessage(from, JSON.stringify(relevantJobs));
        });
        user.state = "idle";
        return res.sendStatus(200);
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