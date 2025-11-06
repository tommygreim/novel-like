import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { context, scenario, apiKey, model } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    if (!context) {
      return NextResponse.json(
        { error: "Context is required" },
        { status: 400 }
      );
    }

    // Build prompt with scenario context
    let prompt = "";

    if (scenario && typeof scenario === "string" && scenario.trim()) {
      prompt = `You are writing a story with the following context:\n\n${scenario}\n\nContinue the story below naturally, maintaining consistency with the scenario and context provided above. Write about 100-200 words:\n\n${context}`;
    } else {
      prompt = `Continue the following text naturally, maintaining the same writing style and tone. Write about 100-200 words:\n\n${context}`;
    }

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Novel-Like Editor",
      },
      body: JSON.stringify({
        model: model || "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json(
        { error: errorData.error?.message || "Failed to generate text" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract the generated text
    const generatedText = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({
      text: generatedText,
      usage: data.usage,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
