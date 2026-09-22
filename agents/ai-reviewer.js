// agents/ai-reviewer.js
import { GoogleGenAI, Type } from '@google/genai';
import fs from 'node:fs';
import path from 'node:path';

async function runAIAgent() {
    console.log('🤖 Real AI Code Reviewer Agent is initializing...');

    // Guarantee API key exists before execution
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('🚨 Error: GEMINI_API_KEY environment variable is missing.');
        process.exit(1);
    }

    const ai = new GoogleGenAI({ apiKey });

    // 1. Gather the code files you want reviewed
    const filesToReview = ['math.js', 'math.test.js'];
    let codebaseContext = '';
    let filesFound = 0;

    for (const file of filesToReview) {
        const filePath = path.resolve(process.cwd(), file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            codebaseContext += `\n--- FILE: ${file} ---\n${content}\n`;
            filesFound++;
        }
    }

    if (filesFound === 0) {
        console.error('🚨 Error: None of the targeted files were found in the current workspace.');
        process.exit(1);
    }

    // 2. Craft the prompt
    const prompt = `
You are an expert, strict Principal Software Engineer and Code Reviewer.
Analyze the following source code files from a Node.js project.
Look for bugs, security vulnerabilities, poor practices, or missing tests.

Here is the codebase:
${codebaseContext}

Provide a brief, professional summary of the code quality and list any critical bugs or bad practices found.
`;

    try {
        console.log('🧠 Sending code to Gemini for intelligent evaluation...');
        
        // 3. Request structured JSON output to eliminate text parsing bugs
        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        issues: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        verdict: {
                            type: Type.STRING,
                            enum: ['PASS', 'FAIL']
                        }
                    },
                    required: ['summary', 'issues', 'verdict']
                }
            }
        });

        const reviewText = response.text || '{}';
        const reviewData = JSON.parse(reviewText);

        console.log('\n----------------- AI REVIEW REPORT -----------------');
        console.log(`Summary: ${reviewData.summary}`);
        if (reviewData.issues && reviewData.issues.length > 0) {
            console.log('\nIssues Identified:');
            reviewData.issues.forEach((issue, index) => console.log(` ${index + 1}. ${issue}`));
        } else {
            console.log('\nNo major issues found.');
        }
        console.log('----------------------------------------------------\n');

        // 4. Deterministic pipeline control
        if (reviewData.verdict === 'FAIL') {
            console.error('❌ AI Agent Verdict: REJECTED. Fix the issues highlighted above.');
            process.exit(1);
        } else {
            console.log('✨ AI Agent Verdict: APPROVED.');
            process.exit(0);
        }

    } catch (error) {
        console.error('🚨 Error communicating with Gemini API:', error);
        process.exit(1);
    }
}

runAIAgent();