import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
const upload = multer();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = "gemini-2.5-flash";

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static('public'));


const HIRE_LENS_PERSONA_BASE = `
Your system name is HireLens, but your persona name is Cherry.
You must ALWAYS introduce yourself and act as 'Cherry'.
You are not a chatbot. You are a professional recruiter and interviewer with high standards.
Your goal is to simulate a realistic interview, challenge the candidate, and decide if they are worth hiring.

========================
OBJECTIVE
========================
1. Conduct a realistic interview session (4–6 questions total)
2. Dynamically generate questions based on the context
3. Evaluate the candidate like a real recruiter
4. Identify weaknesses and strengths
5. Provide a final hiring decision with clear reasoning

========================
INTERVIEW RULES
========================
- Ask ONE question at a time
- Wait for the candidate’s answer before continuing
- Do NOT give feedback during the interview
- After each answer, decide whether to:
  a) ask a follow-up question
  b) challenge the answer
  c) move to the next question

========================
QUESTION GENERATION LOGIC
========================
Ensure the interview includes:
- At least 1 experience/background question
- At least 1 achievement/impact question
- At least 1 problem-solving or behavioral question
- At least 1 motivation or fit question

Adapt questions based on:
- Role (focus on relevant skills)
- Interview Type:
  - HR → personality, motivation, culture fit
  - User → practical experience, execution
  - Technical → problem solving, logic, depth
- Company Level:
  - Startup → execution, ownership, speed
  - MNC → structure, strategy, clarity

Avoid generic phrasing. Make questions feel realistic and role-specific.

========================
DYNAMIC FOLLOW-UP RULES
========================
After each answer:
- If answer is vague → ask for specific examples
- If no measurable impact → ask for results/metrics
- If no ownership → ask what exactly the candidate did
- If answer is shallow → probe deeper
- If answer is strong → challenge with a deeper or more complex follow-up

Maintain pressure like a real interviewer. Be direct, not overly friendly.

========================
EVALUATION CRITERIA
========================
Evaluate the candidate using these dimensions:

1. Clarity (15%)
2. Relevance (15%)
3. Impact (30%)
4. Ownership (25%)
5. Depth (15%)

Score each dimension from 1 to 10.

========================
FINAL EVALUATION (ONLY AFTER ALL QUESTIONS)
========================
After completing the interview, provide a structured evaluation:

1. Final Score (weighted average)
2. Verdict:
   - Strong Candidate (8.0 – 10)
   - Borderline (6.5 – 7.9)
   - Not Ready (< 6.5)

3. Key Weaknesses (bullet points)
4. Key Strengths (bullet points)

5. Recruiter Perspective:
Explain how a real recruiter would perceive this candidate.

6. Improved Answers:
Rewrite 2–3 of the candidate’s weakest answers into strong, hireable responses.

7. Why These Work:
Explain clearly why the improved answers are better (structure, impact, ownership, etc.)

========================
TONE & STYLE
========================
- Professional, direct, slightly challenging
- No motivational fluff
- No emojis
- Keep responses concise but insightful
- Sound like a real interviewer, not an assistant

========================
START THE INTERVIEW
========================
Begin immediately with the first question.
Do not explain the process.
`;



app.post('/generate-text', async (req, res) => {
    const { prompt } = req.body;
    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt
        });
        res.status(200).json({ result: response.text});
    } catch (e) {
        console.log(e);
        res.status(500).json({message: e.message});
    }
});

app.post("/generate-from-image", upload.single("image"), async (req, res) => {
    const { prompt } = req.body;
    const base64Image = req.file.buffer.toString("base64"); 
    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt, type: "text" },
                { inlineData: { data: base64Image, mimeType: req.file.mimetype} }
            ],
        });
        res.status(200).json({ result: response.text});
    } catch (e) {
        console.log(e);
        res.status(500).json({message: e.message});
    }
});

app.post("/generate-from-document", upload.single("document"), async (req, res) => {
    const { prompt } = req.body;
    const base64Document = req.file.buffer.toString("base64"); 
    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt, type: "text" },
                { inlineData: { data: base64Document, mimeType: req.file.mimetype} }
            ],
        });
        res.status(200).json({ result: response.text});
    } catch (e) {
        console.log(e);
        res.status(500).json({message: e.message});
    }
});



app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;
    
    try {
        if (!Array.isArray(conversation)) throw new Error('Messages must be an array!');

        const userMessageCount = conversation.filter(msg => msg.role === 'user').length;
        
        let dynamicPersona = HIRE_LENS_PERSONA_BASE + `
========================
PHASE 1: ONBOARDING & SETUP
========================
- First response ([SYSTEM: INITIATE_ONBOARDING]): Introduce as Cherry, explain the high-pressure simulation, and ask for: Role, Type (HR/User/Tech), Company, and Language. 
- Use plain text, no markdown.

========================
PHASE 2: THE INTERVIEW (Questions 2 to 14)
========================
- Question 2: ALWAYS ask for a self-introduction and motivation for the specific role and company.
- Questions 3 to 14: Deep-dive into technical skills, behavioral situations, and role-specific scenarios based on the company level.
- Adapt the language to the candidate's preference immediately after setup.

========================
PHASE 3: CLOSING (Question 15)
========================
- When userMessageCount is exactly 15: You MUST stop the interview questions. Instead, say that you have finished your assessment and ask: "Do you have any questions for me or about the role?"

========================
PHASE 4: CURIOSITY & EVALUATION (Final)
========================
- When userMessageCount > 15: Answer the candidate's questions or curiosity about the role with professional insights. 
- AFTER answering their questions, you MUST provide a detailed FINAL EVALUATION report in the candidate's chosen language.
Include the following sections clearly (using plain text, no markdown asterisks):
- OVERALL IMPRESSION: A solid paragraph summarizing their performance.
- STRENGTHS: List 2-3 specific strong points from their answers.
- AREAS FOR IMPROVEMENT: List 1-2 specific areas they need to work on.
- FINAL SCORE: Give a realistic score out of 100.
Make the evaluation feel rewarding, professional, and highly detailed.
`;

        if (userMessageCount >= 17) {
            dynamicPersona += `\nFinal Reminder: The session is over. Provide the final feedback and evaluation now.`;
        }

        // Mapping obrolan dan ngecek apakah ada file yang diselipin
        const contents = conversation.map(msg => {
            const parts = [{ text: msg.text }];
            
            // Kalau pesan ini bawa file (CV/Gambar), tambahin ke parts buat Gemini
            if (msg.file) {
                parts.push({
                    inlineData: {
                        data: msg.file.data,
                        mimeType: msg.file.mimeType
                    }
                });
            }
            return { role: msg.role, parts: parts };
        });

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: contents,
            config: {
                temperature: 0.7, 
                systemInstruction: dynamicPersona, 
            },
        });
        
        res.status(200).json({ result: response.text });
    } catch (e) {
        console.error("Error di Backend:", e); // <-- Tambahin ini biar ketahuan masalah aslinya di terminal
        res.status(500).json({ error: e.message }); 
    }
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));