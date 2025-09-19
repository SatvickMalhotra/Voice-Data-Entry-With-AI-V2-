import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { Handler } from "@netlify/functions";

const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured on the server.' }) };
    }

    try {
        const { imageB64, mimeType } = JSON.parse(event.body || '{}');
        if (!imageB64 || !mimeType) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing image data or mime type.' }) };
        }
        
        const ai = new GoogleGenAI({ apiKey });

        const imagePart = { inlineData: { data: imageB64, mimeType } };
        const textPart = { text: 'Analyze the document image and extract customer and policy information. Use YYYY-MM-DD format for dates.' };
        
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                partnerName: { type: Type.STRING },
                productDetails: { type: Type.STRING },
                premium: { type: Type.NUMBER },
                branchName: { type: Type.STRING },
                branchCode: { type: Type.STRING },
                region: { type: Type.STRING },
                customerName: { type: Type.STRING },
                gender: { type: Type.STRING, description: 'Should be "Male", "Female", or "Other"' },
                dateOfBirth: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
                mobileNumber: { type: Type.STRING },
                customerId: { type: Type.STRING },
                enrolmentDate: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
                savingsAcNo: { type: Type.STRING },
                csbCode: { type: Type.STRING },
                d2cCode: { type: Type.STRING },
                nomineeName: { type: Type.STRING },
                nomineeDob: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
                nomineeRelationship: { type: Type.STRING },
                nomineeMobileNumber: { type: Type.STRING },
                nomineeGender: { type: Type.STRING, description: 'Should be "Male", "Female", or "Other"' },
            },
        };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            }
        });

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: response.text,
        };

    } catch (error) {
        console.error("Error in Netlify function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to process image with the Gemini API.' }),
        };
    }
};

export { handler };
