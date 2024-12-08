import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

const url = "https://web-zero-web-zero.hf.space/api/v1/run/new?stream=false";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content } = body;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input_value: content,
        output_type: "chat",
        input_type: "chat",
        tweaks: {},
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response Error:", errorText);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    const code =
      data?.outputs?.[0]?.outputs?.[0]?.outputs?.message?.message?.text || "";

    if (!code) {
      throw new Error("No code generated from the API response");
    }

    const formattedCode = code.replace(/^```tsx\n|\n```$/g, "");

    const id = uuidv4();
    const generatedDir = path.resolve(
      process.cwd(),
      "src",
      "components",
      "generated"
    );
    const filename = path.join(generatedDir, `${id}.tsx`);

    await fs.mkdir(generatedDir, { recursive: true });

    await fs.writeFile(filename, formattedCode, "utf8");

    return NextResponse.json({
      id,
      from: "ai",
      content: formattedCode,
    });
  } catch (error) {
    console.error("Error in sendMessage API:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process the request",
      },
      { status: 500 }
    );
  }
}
