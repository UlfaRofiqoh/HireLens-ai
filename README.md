# 🎯 HireLens: Professional AI Interview Simulation

![UI Preview] <img width="962" height="619" alt="image" src="https://github.com/user-attachments/assets/4fd630c5-757a-4251-99a7-e641bf26785b" />
<img width="1366" height="768" alt="2" src="https://github.com/user-attachments/assets/5e733975-b093-43d0-82dd-558275dff60f" />



HireLens is an advanced, AI-powered interview simulation platform designed to put candidates in the "hot seat." Powered by the Gemini API, it goes beyond generic chatbot interactions to deliver highly contextual, pressure-tested interview scenarios.

## 👥 Target Audience
This tool is built for **job seekers, fresh graduates, and professionals** looking to sharpen their interview skills. Whether you are aiming for an intensive Management Trainee program, a financial analyst role, or a technical engineering position, HireLens adapts to your specific target.

## 💡 How It Helps
Interviews can be intimidating. HireLens solves this by providing a safe yet challenging environment to practice. 
* It reads your actual CV/Portfolio before the interview starts.
* It challenges your behavioral and technical answers just like a real recruiter.
* It removes the guesswork by providing a detailed, objective evaluation of your strengths and areas for improvement.

## ✨ Key Features
* **📄 Document Context (CV Parsing):** Upload your CV (PDF/Image) and the AI will tailor its questions based on your real background and past projects (Max 2MB to ensure smooth performance).
* **🎭 Dynamic Persona:** The AI acts as "Cherry," a strict but professional recruiter.
* **🔄 Phased Interview Flow:** A structured 15-question journey, moving from onboarding, behavioral/technical deep-dives, to a final Q&A session.
* **📊 Comprehensive Evaluation:** Receive a detailed "Report Card" at the end of the session, complete with a final score (0-100), strengths, and precise areas to improve.
* **💅 Glassmorphism UI:** A sleek, distraction-free, and immersive user interface built from scratch.

## 🧠 Under the Hood (The Logic)
What makes HireLens different is its **Stateful Prompt Engineering** and **Context Window Management**. 

Instead of letting the LLM wander freely, the backend actively tracks the `userMessageCount` and dynamically injects instructions into the Gemini system prompt based on the current phase:
1. **Phase 1 (Setup):** Forces the AI to extract 4 key parameters (Role, Type, Level, Language).
2. **Phase 2 (Deep Dive):** The AI is instructed to challenge the user based on the uploaded CV and their previous answers.
3. **Phase 3 (Role Reversal):** At exactly the 15th interaction, the system forcibly stops the interview questions and invites the user to ask questions about the company.
4. **Phase 4 (Scoring):** Once the user finishes asking questions, the backend triggers a strict formatting rule, forcing the AI to output a structured evaluation.

## 🛠️ Tech Stack
* **Frontend:** Vanilla HTML5, CSS3 (Custom Variables, Glassmorphism), Vanilla JavaScript.
* **Backend:** Node.js, Express.js.
* **AI Engine:** Google Generative AI (Gemini Flash Model) via `@google/genai` SDK.

## 🚀 Getting Started

### Prerequisites
* Node.js installed on your machine.
* A Gemini API Key from Google AI Studio.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/UlfaRofiqoh/hirelens-ai.git
2. Navigate to the project directory and install dependencies:
   ```Bash
   cd hirelens-ai
   npm install
3. Set up your environment variables:
   * Create a .env file in the root directory.
   * Add your API key:
   ```env
     GEMINI_API_KEY=your_api_key_here
     PORT=3000
     ```
4. Start the server:
   ```Bash
   node index.js --watch
5. Open your browser and visit http://localhost:3000.

## 📜 License
Created by Ulfatur Rofiqoh.
