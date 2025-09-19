import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { PolicyData } from '../types';

export const extractDataFromImage = async (
    imageB64: string,
    mimeType: string
): Promise<Partial<PolicyData>> => {
    // FIX: Per guidelines, API key is sourced from process.env.API_KEY and not passed in.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const imagePart = {
        inlineData: {
            data: imageB64,
            mimeType: mimeType,
        },
    };

    const textPart = {
        text: 'Analyze the document image and extract customer and policy information. Use YYYY-MM-DD format for dates.',
    };

    // FIX: Using responseSchema for reliable JSON output as per Gemini API guidelines.
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

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            }
        });

        // FIX: The response is clean JSON with responseSchema, so no need to clean up ```json markers.
        const parsedData = JSON.parse(response.text);
        return parsedData as Partial<PolicyData>;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to extract data from image. Please check the console for details.");
    }
};