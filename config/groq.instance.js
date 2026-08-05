import Groq from "groq-sdk";
import dotenv from 'dotenv';
dotenv.config({ path: "../.env" });

const groqClients = [
    new Groq({ apiKey: process.env.GROQ_API_KEY_1 }),
    new Groq({ apiKey: process.env.GROQ_API_KEY_2 }),
    new Groq({ apiKey: process.env.GROQ_API_KEY_3 }),
    new Groq({ apiKey: process.env.GROQ_API_KEY_4 }),
    new Groq({ apiKey: process.env.GROQ_API_KEY_5 }),
    new Groq({ apiKey: process.env.GROQ_API_KEY_6 }),
    new Groq({ apiKey: process.env.GROQ_API_KEY_7 })
];

export async function getGroqResponse(prompt, index) {
  const groq = groqClients[index % groqClients.length];
  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "openai/gpt-oss-20b",
  });

  console.log(response.choices[0]?.message?.content || "");
}

export default getGroqResponse;