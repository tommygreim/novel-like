import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { currentStory, scenario, userChoice, apiKey, model } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    // Build the prompt
    let prompt = "";

    if (!currentStory) {
      // Starting a new story
      if (scenario && typeof scenario === "string" && scenario.trim()) {
        prompt = `You are a creative storyteller. Start an interactive story based on this scenario:

${scenario}

Write the opening of the story (2-3 paragraphs). Make it engaging and end at a point where the protagonist must make a decision.

IMPORTANT FORMATTING RULES FOR DIALOGUE:
- When dialogue first occurs after extended description, place a paragraph break before the dialogue
- Whenever the speaker changes during dialogue scenes, place a paragraph break before the new speaker's dialogue
- Each new speaker should start on a new line/paragraph

Then, provide exactly 3 choices for what the protagonist could do next, plus indicate that there's a custom option. Format your response EXACTLY as follows:

STORY:
[Your story text here]

CHOICES:
1. [First choice]
2. [Second choice]
3. [Third choice]
4. Custom action`;
      } else {
        prompt = `You are a creative storyteller. Start an interactive fantasy adventure story. Write the opening (2-3 paragraphs). Make it engaging and end at a point where the protagonist must make a decision.

IMPORTANT FORMATTING RULES FOR DIALOGUE:
- When dialogue first occurs after extended description, place a paragraph break before the dialogue
- Whenever the speaker changes during dialogue scenes, place a paragraph break before the new speaker's dialogue
- Each new speaker should start on a new line/paragraph

Then, provide exactly 3 choices for what the protagonist could do next, plus indicate that there's a custom option. Format your response EXACTLY as follows:

STORY:
[Your story text here]

CHOICES:
1. [First choice]
2. [Second choice]
3. [Third choice]
4. Custom action`;
      }
    } else {
      // Continuing the story based on user's choice
      const scenarioContext = scenario && typeof scenario === "string" && scenario.trim()
        ? `\n\nScenario context: ${scenario}\n\n`
        : "";

      prompt = `You are a creative storyteller. Continue this interactive story based on the user's choice.${scenarioContext}
Current story so far:
${currentStory}

The user chose to: ${userChoice}

Continue the story (2-3 paragraphs) based on their choice. Make it engaging and end at a point where they must make another decision.

IMPORTANT FORMATTING RULES FOR DIALOGUE:
- When dialogue first occurs after extended description, place a paragraph break before the dialogue
- Whenever the speaker changes during dialogue scenes, place a paragraph break before the new speaker's dialogue
- Each new speaker should start on a new line/paragraph

Then, provide exactly 3 new choices for what they could do next, plus indicate that there's a custom option. Format your response EXACTLY as follows:

STORY:
[Your story continuation here]

CHOICES:
1. [First choice]
2. [Second choice]
3. [Third choice]
4. Custom action`;
    }

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Novel-Like Interactive Story",
      },
      body: JSON.stringify({
        model: model || "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 800,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json(
        { error: errorData.error?.message || "Failed to generate story" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || "";

    // Parse the response
    const storyMatch = generatedText.match(/STORY:\s*([\s\S]*?)(?=CHOICES:|$)/);
    const choicesMatch = generatedText.match(/CHOICES:\s*([\s\S]*?)$/);

    let storyText = "";
    let choices: Array<{ id: string; text: string; isCustom?: boolean }> = [];

    if (storyMatch) {
      storyText = storyMatch[1].trim();
    } else {
      // Fallback: use the whole text if parsing fails
      storyText = generatedText;
    }

    if (choicesMatch) {
      const choicesText = choicesMatch[1];
      const choiceLines = choicesText.split('\n').filter((line: string) => line.trim());

      choiceLines.forEach((line: string, index: number) => {
        // Match patterns like "1. Choice text" or "1) Choice text"
        const match = line.match(/^\d+[.)]\s*(.+)/);
        if (match) {
          const choiceText = match[1].trim();
          if (choiceText.toLowerCase().includes('custom')) {
            choices.push({
              id: `custom`,
              text: "Enter a custom action",
              isCustom: true
            });
          } else {
            choices.push({
              id: `choice-${index}`,
              text: choiceText
            });
          }
        }
      });
    }

    // Ensure we have at least a custom option
    if (!choices.some(c => c.isCustom)) {
      choices.push({
        id: `custom`,
        text: "Enter a custom action",
        isCustom: true
      });
    }

    return NextResponse.json({
      text: storyText,
      choices: choices,
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
