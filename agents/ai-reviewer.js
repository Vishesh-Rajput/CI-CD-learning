// agents/ai-reviewer.js
import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs';
import path from 'node:path';

// Automatically initializes using process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({});

async function runAIAgent() {
    console.log('🤖 Real AI Code Reviewer Agent is initializing...');

    // 1. Gather the code files you want reviewed
    const filesToReview = ['math.js', 'math.test.js'];
    let codebaseContext = '';

    for (const file of filesToReview) {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            codebaseContext += `\n--- FILE: ${file} ---\n${content}\n`;
        }
    }

    // 2. Craft the prompt for the AI
    const prompt = `
    You are an expert, strict Principal Software Engineer and Code Reviewer.
    Analyze the following source code files from a Node.js project. 
    Look for bugs, security vulnerabilities, poor practices, or missing tests.

    Here is the codebase:
    ${codebaseContext}

    Review Instructions:
    1. Provide a brief, professional summary of the code quality.
    2. List any bugs or bad practices found.
    3. You MUST end your response with exactly one of these two tokens on a new line: [REVIEW_PASS] or [REVIEW_FAIL]. 
       Use [REVIEW_FAIL] only if there are critical bugs or severe anti-patterns. Otherwise, use [REVIEW_PASS].
    `;

    try {
        console.log('🧠 Sending code to Gemini for intelligent evaluation...');
        
        // Call Gemini using the modern model format
        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
        });

        const reviewOutput = response.text();
        console.log('\n----------------- AI REVIEW REPORT -----------------');
        console.log(reviewOutput);
        console.log('----------------------------------------------------\n');

        // 3. Agent logic: Parse AI's decision
        if (reviewOutput.includes('[REVIEW_FAIL]')) {
            console.error('❌ AI Agent Verdict: REJECTED. Fix the issues highlighted by the AI.');
            process.exit(1); // Fails the GitHub Actions pipeline
        } else {
            console.log('✨ AI Agent Verdict: APPROVED.');
            process.exit(0); // Passes the pipeline
        }

    } catch (error) {
        console.error('🚨 Error communicating with Gemini API:', error);
        process.exit(1);
    }
}

runAIAgent();