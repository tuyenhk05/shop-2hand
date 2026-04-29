const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function listModels() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is not defined in .env");
        return;
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        console.log("Available models:");
        if (data.models) {
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log("No models found or error in response:", data);
        }
    } catch (error) {
        console.error("Error fetching models:", error);
    }
}

listModels();
