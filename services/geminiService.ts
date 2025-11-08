import { GoogleGenAI, Type } from "@google/genai";
import { Conversation, ExploreTopic, Interaction, MarketData } from '../types.ts';

function base64ToGenerativePart(base64: string) {
    const match = base64.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
        throw new Error("Invalid base64 string format");
    }
    const mimeType = match[1];
    const data = match[2];
    return {
      inlineData: {
        data,
        mimeType,
      },
    };
}

export const askOrvantaStream = async function* (prompt: string, imageBase64?: string | null): AsyncGenerator<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  if ((!prompt || prompt.trim() === '') && !imageBase64) {
    throw new Error("Prompt cannot be empty.");
  }

  const model = 'gemini-2.5-flash';
  
  let contentsPayload: string | { parts: any[] };

  if (imageBase64) {
      const parts = [];
      parts.push(base64ToGenerativePart(imageBase64));
      if (prompt && prompt.trim() !== '') {
          parts.push({ text: prompt });
      }
      contentsPayload = { parts };
  } else {
      contentsPayload = prompt;
  }


  try {
    const response = await ai.models.generateContentStream({
      model: model,
      contents: contentsPayload,
      config: {
        systemInstruction: `You are a friendly and encouraging AI guide, like a cool mentor for students in India. Your main goal is to make complex topics simple and easy to remember, especially for exams.

**Your Response Style:**
- **Tone:** Super friendly, positive, and encouraging. Use simple, common words and short sentences. Use emojis to add fun! ✨
- **Structure:** Always structure your answer for clarity, from an exam point-of-view first, then with a simple example. Follow this flow secretly, without using any labels or headings:
    1.  **Exact Definition (Exam POV):** Start with a precise, textbook-like definition of the term or concept. This should be clear and accurate, perfect for an exam answer. Make key terms **bold**.
    2.  **Real-Life Example:** Immediately follow up with a simple, relatable, real-life example. Use phrases like "For example..." or "Think of it this way...". This makes the definition easy to understand and remember.
    3.  **Fun Fact (Optional):** If you can find a cool and relevant fun fact, add it to make things more interesting!
    4.  **Engaging Follow-Up:** Always end by asking a question to encourage more conversation.

**CRITICAL INSTRUCTIONS:**
- Do NOT use labels like "Definition:", "Example:", etc. The structure should be invisible to the user.
- Always provide the definition *before* the example.
- Keep the language simple and conversational, even in the definition.

**Example Interaction:**
User: "What is GDP?"

From an exam point of view, **Gross Domestic Product (GDP)** is the total monetary value of all the finished goods and services produced within a country's borders in a specific time period. 📝

Think of it this way: Imagine India is a giant shop. The GDP is the total bill for everything the shop sold in one year—all the cars, software, crops, and even services like doctor's visits. It's the country's economic scorecard!

A cool fact is that services make up the largest part of India's GDP!

Does that help clarify it? We could look at the difference between GDP and GNP next if you're curious!`,
      },
    });
    for await (const chunk of response) {
      yield chunk.text;
    }
  } catch (error) {
    console.error("Error calling Gemini API in askOrvantaStream:", error);
    throw new Error("I hit a snag trying to find an answer. Please try again in a moment.");
  }
};

const parseJsonTopics = (jsonString: string): { topics: ExploreTopic[] } => {
    const cleanedString = jsonString.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const data = JSON.parse(cleanedString);
    if (!data.topics || !Array.isArray(data.topics)) {
        throw new Error("I got a bit of a mixed signal! The topic structure seems off.");
    }
    return data;
}

const INDIA_CENTRIC_PROMPT_BASE = `Using Google Search, generate a list of 4 recent, strictly positive, uplifting, and inspiring news topics STRICTLY related to India. The topics should be student-friendly and suitable for someone preparing for competitive exams or seeking general knowledge.

The "title" and "description" fields must use simple, common, and easy-to-understand language.

**Source topics ONLY from the following categories:**

1.  **Education & Career:** Exam updates (like CBSE, NEET, JEE), new education policies, scholarships, emerging career trends.
2.  **National News:** Major positive government initiatives (like Digital India, Startup India), landmark Supreme Court judgments that are beneficial, major infrastructure projects.
3.  **International News:** India's positive role in global summits (G20, UN, BRICS), successful diplomatic relations, beneficial international agreements.
4.  **Science & Technology:** Recent achievements from ISRO, positive developments in AI/robotics from India, innovations from Indian startups, clean energy tech advancements.
5.  **Economy & Business:** Positive highlights from the Union budget, news about strong GDP growth, success stories of Indian startups and unicorns, beneficial RBI updates.
6.  **Environment & Climate:** Successful wildlife conservation efforts in India, positive news on clean energy adoption (solar, wind), major environmental protection initiatives.
7.  **Sports:** Major achievements by Indian athletes in international tournaments (like Olympics, World Cups), record-breaking performances, stories of rising sports stars.
8.  **Art, Culture & Society:** Positive stories about Indian festivals, traditions, cultural events, social progress (like gender equality, education rights), and literature awards.

**CRITICAL INSTRUCTIONS:**
- **Strictly India-focused.**
- **Strictly POSITIVE news only.**
- **Absolutely no rumors, fake news, unverified stories, negative news, political controversies, crime, or mature themes.**
- For the "category" field, use one of the main category names listed above (e.g., "Education & Career", "Science & Technology").
- For the "prompt" field, create a question that a user would ask to learn more about the topic.

Respond ONLY with a single JSON object that matches this structure: { "topics": [ { "title": "...", "description": "...", "category": "...", "prompt": "..." } ] }. Do not include any markdown formatting like \`\`\`json.`;


export const getExploreTopics = async (): Promise<ExploreTopic[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: INDIA_CENTRIC_PROMPT_BASE,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    
    const jsonResponse = parseJsonTopics(response.text);
    return jsonResponse.topics;

  } catch (error) {
    console.error("Error calling Gemini API in getExploreTopics:", error);
    if (error instanceof SyntaxError) {
        throw new Error("I got a bit of a mixed signal from the cosmos! Could you try refreshing?");
    }
    throw new Error("I couldn't load new topics right now. Maybe try a refresh? 🤔");
  }
};

export const getDiscoveryTopics = async (): Promise<ExploreTopic[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: INDIA_CENTRIC_PROMPT_BASE, // Using the same India-focused prompt
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    
    const jsonResponse = parseJsonTopics(response.text);
    return jsonResponse.topics;
    
  } catch (error) {
    console.error("Error calling Gemini API in getDiscoveryTopics:", error);
     if (error instanceof SyntaxError) {
        throw new Error("I got a bit of a mixed signal from the cosmos! Could you try refreshing?");
    }
    throw new Error("I couldn't load new topics right now. Maybe try a refresh? 🤔");
  }
};

export const getMarketData = async (): Promise<MarketData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Using Google Search to get the most up-to-the-minute market information, provide the latest data for India.
    It is critical that the prices are as accurate as possible. If an exact real-time price isn't available, provide the most recent closing price. Do not invent data.
    - For Gold, get the price for 24K per 10 grams in Delhi.
    - For Silver, get the price per 1 kilogram in Delhi.
    
    The "value" field for all items should be a string containing ONLY the numerical value, without any currency symbols (like '₹' or 'Rs.') or commas.

    Respond ONLY with a single JSON object formatted exactly as follows, without any markdown code fences:
    {
      "nifty50": { "name": "Nifty 50", "value": "string", "change": "string", "changeType": "up|down|neutral" },
      "sensex": { "name": "BSE Sensex", "value": "string", "change": "string", "changeType": "up|down|neutral" },
      "gold": { "name": "Gold (24K, 10g, Delhi)", "value": "string", "change": "string", "changeType": "up|down|neutral" },
      "silver": { "name": "Silver (1kg, Delhi)", "value": "string", "change": "string", "changeType": "up|down|neutral" }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const text = response.text;
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
        throw new SyntaxError("Could not find a valid JSON object in the response.");
    }
    
    const jsonString = text.substring(startIndex, endIndex + 1);
    const marketData = JSON.parse(jsonString);

    if (!marketData.nifty50 || !marketData.sensex || !marketData.gold || !marketData.silver) {
      throw new Error("Received incomplete market data from AI.");
    }

    // Defensively clean the currency symbols and commas from the values.
    for (const key in marketData) {
        if (Object.prototype.hasOwnProperty.call(marketData, key) && marketData[key].value) {
            marketData[key].value = String(marketData[key].value).replace(/[₹,]/g, '').trim();
        }
    }
    
    return marketData as MarketData;

  } catch (error) {
    console.error("Error fetching market data:", error);
    if (error instanceof SyntaxError) {
        throw new Error("The market data seems a bit scrambled. Could you try again?");
    }
    throw new Error("I'm having trouble getting the latest market data. Please try again soon!");
  }
};

export const generateFollowUpQuestions = async (interaction: Interaction): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Use only the first 1000 chars of the response to keep the prompt concise
  const conversationContext = `
    User's query: "${interaction.query}"
    ${interaction.image ? '(User also provided an image.)' : ''}
    Your response: "${interaction.response.substring(0, 1000)}..."
  `;

  const prompt = `
    You are a creative AI assistant that sparks curiosity. Your goal is to generate 3 follow-up questions based on a conversation snippet. These questions should make the user think, "Wow, I never thought of that!"

    **Instructions:**
    1.  Generate exactly 3 questions.
    2.  The questions must be concise, easy to read, and have a similar length to a tweet.
    3.  Frame them as if the user is asking them.
    4.  Make them genuinely interesting by using one of these angles:
        *   **"What if?" scenario:** A hypothetical question that explores possibilities.
        *   **Connecting Concepts:** A question that links the topic to a different field or a real-world problem.
        *   **The "Unexpected" Angle:** A question that asks about a surprising fact, a common myth, or a hidden detail.

    **DO NOT ask simple definitional questions like "What is X?" or "Tell me more about Y."** The goal is to provoke deeper, more creative thinking.

    Conversation:
    ---
    ${conversationContext}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of exactly 3 interesting follow-up questions."
            }
          },
          required: ["questions"]
        },
        thinkingConfig: { thinkingBudget: 0 },
      }
    });

    const result = JSON.parse(response.text);
    if (result.questions && Array.isArray(result.questions)) {
      return result.questions;
    }
    return [];
  } catch (error) {
    console.error("Error in generateFollowUpQuestions:", error);
    // Return empty array on failure so the UI doesn't break
    return [];
  }
};


// --- HISTORY AI FUNCTIONS ---

export const summarizeAndTagConversation = async (interactions: Interaction[]): Promise<{ title: string; tags: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const conversationText = interactions.map(i => `Q: ${i.query}\nA: ${i.response.substring(0, 200)}...`).join('\n\n');
  const prompt = `
    Based on the following conversation, please perform two tasks:
    1. Create a short, concise, and descriptive title (5-8 words max).
    2. Generate 2-4 relevant keyword tags.

    Conversation snippet:
    ---
    ${conversationText}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        },
      }
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error("Error in summarizeAndTagConversation:", error);
    // Fallback in case of AI error
    return {
      title: interactions[0]?.query || "Conversation",
      tags: [],
    };
  }
};

export const findRelevantConversations = async (searchTerm: string, history: Conversation[]): Promise<string[]> => {
    if (!searchTerm.trim()) {
        return history.map(c => c.id);
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const historyForSearch = history.map(c => ({
        id: c.id,
        title: c.title,
        tags: c.tags,
        firstQuery: c.interactions[0]?.query,
    }));

    const prompt = `
        You are an intelligent search assistant for a conversation history. I will provide a user's search query and a JSON list of conversations. Your task is to identify which conversations are semantically relevant to the query.

        The user's search query is: "${searchTerm}"

        Here is the list of conversations:
        ${JSON.stringify(historyForSearch)}

        Based on the user's search query, return the IDs of the conversations that are most relevant. Consider the title, tags, and the first query. Order the IDs from most to least relevant.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        relevantIds: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        const result = JSON.parse(response.text);
        return result.relevantIds || [];
    } catch (error) {
        console.error("Error in findRelevantConversations:", error);
        // Fallback to simple text search
        const lowerSearchTerm = searchTerm.toLowerCase();
        return history
            .filter(c =>
                c.title.toLowerCase().includes(lowerSearchTerm) ||
                c.tags.some(t => t.toLowerCase().includes(lowerSearchTerm)) ||
                c.interactions.some(i => i.query.toLowerCase().includes(lowerSearchTerm))
            )
            .map(c => c.id);
    }
};