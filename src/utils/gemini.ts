export interface GeminiResponse {
    reply: string;
    mood_change: number;
    feedback: string;
}

export async function sendMessageToGemini(
    message: string,
    apiKey: string
): Promise<GeminiResponse> {
    if (!apiKey) {
        throw new Error("APIキーが設定されていません。右上の歯車アイコンから設定してください。");
    }

    // Use REST API directly to avoid SDK issues
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    console.log("Sending to Gemini...");

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: `
あなたは「Dr.ラッシュ」という厳格な外科医です。
看護師のSBAR報告を聞き、以下のJSON形式で返答してください。
報告が良い場合は褒め、悪い場合（SBARが抜けている等）は厳しく指導してください。

報告内容: ${message}

Response Format (JSON):
{
  "reply": "ドクターの返答（日本語）",
  "mood_change": -10 to 10,
  "feedback": "フィードバック（日本語）"
}
              `,
                        },
                    ],
                },
            ],
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
        throw new Error("AIからの応答がありません");
    }

    // Clean up markdown code blocks if present
    const jsonString = text.replace(/```json|```/g, "").trim();

    try {
        return JSON.parse(jsonString) as GeminiResponse;
    } catch (error) {
        console.error("Failed to parse AI response:", text);
        throw new Error("AIの応答を解析できませんでした");
    }
}
