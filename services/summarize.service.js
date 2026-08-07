import connectDB from "../config/db.js";
import Job from "../models/job.model.js";
import getGroqResponse from "../config/groq.instance.js";
import getGeminiResponse from "../config/gemini.instance.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const clients = [
    { provider: "groq", instance: getGroqResponse },
    { provider: "gemini", instance: getGeminiResponse },
    { provider: "groq", instance: getGroqResponse },
    { provider: "gemini", instance: getGeminiResponse },
    { provider: "groq", instance: getGroqResponse },
    { provider: "gemini", instance: getGeminiResponse },
    { provider: "groq", instance: getGroqResponse },
    { provider: "gemini", instance: getGeminiResponse },
    { provider: "groq", instance: getGroqResponse },
    { provider: "gemini", instance: getGeminiResponse },
    { provider: "groq", instance: getGroqResponse },
    { provider: "gemini", instance: getGeminiResponse },
    { provider: "groq", instance: getGroqResponse },
    { provider: "gemini", instance: getGeminiResponse },
];

const summarizeDescription = async () => {
  try {
    await connectDB();

    let count = 0;
    while (true) {
      const jobs = await Job.find({ "status.summarized": false }).limit(14);
      if(jobs.length === 0) {
        console.log("No more jobs to summarize. Exiting loop.");
        break;
      }

      await Promise.allSettled(jobs.map(async (job, index) => {
        try {
          const client = clients[index % clients.length];
          const summary = await JSON.parse(await client.instance(
            `You are an expert technical recruiter.

            Your task is to convert a job posting into structured JSON.

            Rules:
            - Output MUST be valid JSON.
            - Output MUST begin with '{' and end with '}'.
            - Do NOT wrap the JSON in markdown.
            - Do NOT use \`\`\`json or \`\`\` fences.
            - Do NOT include any explanation, notes, headings, or extra text.
            - If a field is unavailable, use an empty string ("") or an empty array ([]).
            - Never invent information.

            Instructions:
            1. Ignore company marketing, culture, benefits, compensation, legal notices, equal opportunity statements, and promotional language.
            2. Focus only on information useful to job seekers.
            3. Merge duplicate or similar requirements.
            4. Extract years of experience only if explicitly stated.
            5. Keep required skills to a maximum of 8.
            6. Summarize responsibilities into 3–5 concise bullet points.
            7. Keep the total content under 180 words.

            Return exactly this JSON schema:

            {
              "summary": "",
              "experience": "",
              "education": [],
              "requiredSkills": [],
              "preferredSkills": [],
              "responsibilities": []
            }

            Job Description:
            ${job.description}`, index
          ));

          job.ai = summary;
          job.status.summarized = true;
          await job.save();

        } catch(error) {
          console.log(`Error occurred while summarizing job with ID ${job._id}`);
        }
      }));
      console.log(`Batch ${++count} of jobs summarized successfully.`);
    }
  } catch(error) {
    console.error("Error occurred while summarizing jobs:", error);
  }
}

summarizeDescription();

export default summarizeDescription;