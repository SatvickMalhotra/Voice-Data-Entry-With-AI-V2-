import type { PolicyData } from '../types';

export const extractDataFromImage = async (
    imageB64: string,
    mimeType: string
): Promise<Partial<PolicyData>> => {
    try {
        const response = await fetch('/.netlify/functions/gemini-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageB64, mimeType }),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.error || `Request failed with status ${response.status}`);
        }

        return responseData as Partial<PolicyData>;

    } catch (error) {
        console.error("Error calling Netlify function:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to extract data from image.");
    }
};
