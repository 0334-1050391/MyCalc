import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: AI Math Word Problem & Complex STEM Solver
app.post('/api/ai/solve', async (req: Request, res: Response) => {
  try {
    const { prompt, angleMode = 'DEG' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required and must be a string.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(503).json({
        error: 'Gemini API key is not configured. Please check environment variables.',
      });
      return;
    }

    const systemInstruction = `You are OmniCalc AI, a world-class STEM professor and precision scientific problem solver.
Your task is to analyze mathematical, scientific, physical, financial, and arithmetic problems accurately.
Current trigonometric angle mode is set to: ${angleMode}.
Break down problems step-by-step with rigorous mathematical accuracy.
Always return structured JSON adhering strictly to the schema provided.
Include accurate numerical values where applicable so users can insert the result back into the scientific calculator.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'Short title of the problem or concept (e.g., Velocity & Average Speed)',
            },
            solution: {
              type: Type.STRING,
              description: 'The final concise answer with units if applicable (e.g., 53.33 mph (85.83 km/h))',
            },
            numericValue: {
              type: Type.NUMBER,
              description: 'The primary raw numerical result for feeding into a calculator, or null if symbolic only',
            },
            formula: {
              type: Type.STRING,
              description: 'Key equation or mathematical formula used (e.g., v = d / t)',
            },
            summary: {
              type: Type.STRING,
              description: 'A 1-2 sentence executive explanation of the result.',
            },
            steps: {
              type: Type.ARRAY,
              description: 'Step-by-step breakdown of how the solution was derived.',
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  mathExpression: { type: Type.STRING },
                },
                required: ['title', 'explanation'],
              },
            },
            keyConcepts: {
              type: Type.ARRAY,
              description: 'Key mathematical and scientific principles involved',
              items: { type: Type.STRING },
            },
          },
          required: ['title', 'solution', 'summary', 'steps'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      res.status(500).json({ error: 'Model returned empty response.' });
      return;
    }

    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/ai/solve:', error);
    res.status(500).json({
      error: error.message || 'Failed to solve math problem with AI.',
    });
  }
});

// Endpoint: AI Step-by-Step Explanation for Calculator Expressions
app.post('/api/ai/explain-expression', async (req: Request, res: Response) => {
  try {
    const { expression, result, angleMode = 'DEG' } = req.body;

    if (!expression) {
      res.status(400).json({ error: 'Expression is required.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(503).json({
        error: 'Gemini API key is not configured.',
      });
      return;
    }

    const systemInstruction = `You are OmniCalc AI's step-by-step arithmetic analyzer.
The user computed the expression: "${expression}" which evaluated to "${result}".
The calculator was operating in angle mode: ${angleMode}.
Explain the Order of Operations (PEMDAS/BODMAS), identify all parenthetical groupings, powers, roots, functions (trigonometric, logarithmic), and intermediate calculations leading up to the final result.
Provide clear verification and pedagogical insights.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Explain how to evaluate "${expression}" step-by-step to arrive at "${result}".`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            expression: { type: Type.STRING },
            result: { type: Type.STRING },
            summary: { type: Type.STRING, description: 'Quick explanation of the operation' },
            orderOfOperations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of order of operations rules applied here in sequence',
            },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                  subExpression: { type: Type.STRING },
                  subResult: { type: Type.STRING },
                },
                required: ['stepNumber', 'description'],
              },
            },
            verification: { type: Type.STRING, description: 'Confirmation note verifying arithmetic validity' },
          },
          required: ['expression', 'result', 'summary', 'steps', 'verification'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      res.status(500).json({ error: 'Model returned empty response.' });
      return;
    }

    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/ai/explain-expression:', error);
    res.status(500).json({
      error: error.message || 'Failed to explain expression with AI.',
    });
  }
});

// Endpoint: AI Number Insights & Properties
app.post('/api/ai/number-insights', async (req: Request, res: Response) => {
  try {
    const { numberValue } = req.body;

    if (numberValue === undefined || numberValue === null) {
      res.status(400).json({ error: 'numberValue is required.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(503).json({ error: 'Gemini API key is not configured.' });
      return;
    }

    const systemInstruction = `You are a mathematical number theorist and science expert.
Analyze the number ${numberValue}.
Provide interesting mathematical properties (e.g. prime/composite, binary/hex representations, rational vs irrational approximation, physics constants close to it, geometric or historical occurrences).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Analyze number ${numberValue}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            value: { type: Type.STRING },
            isInteger: { type: Type.BOOLEAN },
            properties: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            representations: {
              type: Type.OBJECT,
              properties: {
                scientific: { type: Type.STRING },
                binary: { type: Type.STRING },
                hexadecimal: { type: Type.STRING },
                fraction: { type: Type.STRING },
              },
            },
            scientificTrivia: { type: Type.STRING },
          },
          required: ['value', 'properties', 'scientificTrivia'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      res.status(500).json({ error: 'Model returned empty response.' });
      return;
    }

    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error('Error in /api/ai/number-insights:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch number insights.',
    });
  }
});

// Vite middleware or production static files
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
