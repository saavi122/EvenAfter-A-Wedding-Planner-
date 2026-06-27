import { GoogleGenerativeAI } from "@google/generative-ai";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const chatWithPlanner = asyncHandler(async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        throw new ApiError(400, "Messages array is required");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(200).json(
            new ApiResponse(200, {
                text: "⚠️ **Gemini API Key is not configured on the server.**\n\nPlease add `GEMINI_API_KEY` to the server's `.env` file to activate the EvenAfter AI Wedding Planner Assistant."
            }, "API key missing fallback")
        );
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        
        const systemInstruction = `
You are the "EvenAfter AI Wedding Planner", an experienced, professional, friendly, creative, helpful, personalized, and practical wedding planner assistant.
Your goal is to speak naturally and guide users (clients) through planning every aspect of their wedding.

Core Responsibilities:
1. Venue Recommendations: Suggest beach, destination, palace, resort, garden, farmhouse, luxury hotels, banquet halls, rooftop, and heritage venues. Consider budget, guest count, city, weather, indoor vs outdoor, season, and theme.
2. Wedding Planning: Provide guidance on month-wise timelines, checklists, ceremony order (reception, engagement, mehendi, haldi, sangeet, cocktail party), and honeymoon ideas.
3. Budget Planning: Provide budget estimation, cost breakdown, saving tips, and luxury vs affordable options. (e.g. ₹15 lakh budget for 300 guests breakdown).
4. Vendor Suggestions: Suggest categories (photographers, decorators, caterers, makeup artists, DJs, wedding planners, florists, invitation designers). DO NOT recommend specific business names, just general categories.
5. Wedding Themes: Suggest royal, traditional, minimal, vintage, floral, bohemian, rustic, modern luxury, fairytale, and bollywood themes, explaining why they fit the client.
6. Food Planning: Help with vegetarian/non-vegetarian menus, regional cuisines, dessert counters, live food stations, and guest-friendly menu ideas.
7. Decoration Ideas: Suggest stage decoration, floral arrangements, lighting, color palettes, entrance, and table decorations.
8. Outfit Suggestions: Provide ideas for the bride, groom, bridesmaids, and groomsmen based on theme, season, and budget.
9. Wedding Timelines: Generate schedules for 12 months, 6 months, 3 months, 1 month before, wedding week, and wedding day.
10. Destination Weddings: Suggest destinations considering budget, season, travel convenience, and guest count.
11. General Wedding QA: Answer questions about best seasons, number of photographers, seating arrangements, invitation wording, guest management, and etiquette.

Off-Topic and Restricted Topic Rules:
- Off-topic conversations (greetings, basic small talk, motivate/lifestyle related to weddings) are allowed. Answer briefly and friendly, then gently steer the conversation back to wedding planning.
- Restricted topics (politics, religion debates, medical diagnosis, legal advice, financial investment advice, hacking, explicit or adult content, violence, hate speech, dangerous activities) are strictly prohibited. Politely refuse or redirect the conversation back to wedding planning immediately.
`;

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction,
        });

        // Format history for Gemini SDK
        const formattedHistory = [];
        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            const role = msg.sender === 'user' ? 'user' : 'model';
            
            // Skip leading model messages (e.g., initial welcome message) to satisfy SDK requirements
            if (formattedHistory.length === 0 && role === 'model') {
                continue;
            }
            
            formattedHistory.push({
                role: role,
                parts: [{ text: msg.text }]
            });
        }

        if (formattedHistory.length === 0) {
            throw new ApiError(400, "No valid user messages found in history");
        }

        // The last message in history is the new message to send
        const currentMessage = formattedHistory.pop();
        if (currentMessage.role !== 'user') {
            throw new ApiError(400, "The latest message must be from the user");
        }

        const chatSession = model.startChat({
            history: formattedHistory
        });

        const result = await chatSession.sendMessage(currentMessage.parts[0].text);
        const responseText = result.response.text();

        return res.status(200).json(
            new ApiResponse(200, {
                text: responseText
            }, "Chat response retrieved successfully")
        );

    } catch (error) {
        console.error("Gemini AI Chat Error:", error);
        throw new ApiError(500, error.message || "Failed to communicate with AI model");
    }
});
