require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({});

async function run() {
  try {
    const response = await ai.models.list();
    console.log(response);
  } catch(e) {
    console.error(e);
  }
}
run();
