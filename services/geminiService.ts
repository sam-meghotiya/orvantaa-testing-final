
import { GoogleGenAI, Type, GenerateContentParameters, GenerateContentResponse } from "@google/genai";
import { Conversation, ExploreTopic, Interaction, MarketData } from '../types.ts';

// --- Helper Functions ---

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

// --- "Pre-settled System": Centralized Instructions & API Wrappers ---

/**
 * This is the core "pre-settled" instruction that defines the Orvantaa persona.
 * All general conversational chats will use this system instruction.
 */
const ORVANTAA_SYSTEM_INSTRUCTION = `You are Orvantaa, a friendly and concise study AI. Your goal is to provide clear, direct, and easy-to-understand answers.

**CRITICAL STYLE RULE: You MUST follow these specific formatting rules in all your responses:**

*   **Emoji Usage:** Enhance your answer by including one or two relevant and helpful emojis. For example, use a brain emoji 🧠 for a complex topic or a lightbulb emoji 💡 for a new idea. Choose emojis that genuinely add value and match the tone of the answer.
*   **Symbol Usage:**
    *   When providing an example or describing a diagram, use: 📊
    *   When giving a reminder, use: 🔔
    *   When listing key points, start each point with a bullet: •

---

**General Response Guidelines (Apply these to every response):**
1.  **Be Direct:** Start with the most important information or a direct answer.
2.  **Be Concise:** Explain concepts clearly but briefly. Use simple language.
3.  **Use Structure:** Use bullet points or short numbered lists for key information.
4.  **Emphasize Key Terms:** Use Markdown bolding (e.g., **word**) to highlight the most important concepts or keywords. Do this appropriately to add clarity.
5.  **Stay Relevant:** Only provide information that directly answers the question.
6.  **Concluding Question:** After fully answering the user's query, end your response with a single, relevant follow-up question to encourage further thought.`;

/**
 * Centralized wrapper for making non-streaming calls to the Gemini API.
 * This handles client instantiation and re-throws errors for specific handling.
 */
async function callGemini(params: GenerateContentParameters): Promise<GenerateContentResponse> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.models.generateContent(params);
}

// --- Public Service Functions ---

export const askOrvantaStream = async function* (
  prompt: string,
  imageBase64: string | null | undefined,
  useWebSearch: boolean
): AsyncGenerator<{ text?: string; sources?: { uri: string; title: string }[] }> {
  if ((!prompt || prompt.trim() === '') && !imageBase64) {
    throw new Error("Prompt cannot be empty.");
  }

  let finalPrompt = prompt;
  const config: any = {
    systemInstruction: ORVANTAA_SYSTEM_INSTRUCTION,
  };

  if (useWebSearch) {
    finalPrompt = `Using Google Search to gather information from a variety of trusted and reputable educational sources, synthesize a comprehensive and original answer for a student in India. Your answer must be aligned with the NCERT and CBSE curriculum. It is crucial that you do not directly quote or copy from your sources. Instead, provide the information in your own words. Question: "${prompt}"`;
    config.tools = [{ googleSearch: {} }];
  } else {
    // For standard queries, prioritize speed by disabling the thinking budget.
    config.thinkingConfig = { thinkingBudget: 0 };
  }

  let contentsPayload: string | { parts: any[] };
  if (imageBase64) {
    const parts = [];
    parts.push(base64ToGenerativePart(imageBase64));
    if (finalPrompt && finalPrompt.trim() !== '') {
      parts.push({ text: finalPrompt });
    }
    contentsPayload = { parts };
  } else {
    contentsPayload = finalPrompt;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const stream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: contentsPayload,
      config,
    });

    let sourcesSent = false;
    for await (const chunk of stream) {
      if (chunk.text) {
        yield { text: chunk.text };
      }

      const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (!sourcesSent && groundingChunks && groundingChunks.length > 0) {
        const sources = groundingChunks
          .map((c: any) => (c.web ? { uri: c.web.uri, title: c.web.title } : null))
          .filter((s: any): s is { uri: string; title: string } => s && s.uri && s.title);

        if (sources.length > 0) {
          yield { sources };
          sourcesSent = true;
        }
      }
    }
  } catch (error) {
    console.error("Error from Gemini API in askOrvantaStream:", error);
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
  try {
    const response = await callGemini({
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
  try {
    const response = await callGemini({
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
    const response = await callGemini({
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

// --- HISTORY AI FUNCTIONS ---

export const summarizeAndTagConversation = async (interactions: Interaction[]): Promise<{ title: string; tags: string[] }> => {
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
    const response = await callGemini({
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
        thinkingConfig: { thinkingBudget: 0 },
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
        const response = await callGemini({
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
                },
                thinkingConfig: { thinkingBudget: 0 },
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
