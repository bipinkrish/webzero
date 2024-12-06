import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

const url = "http://127.0.0.1:7860/api/v1/run/iterate?stream=false";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { previousDescription, newUpdate, currentCode } = body;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input_value: `
## Previous Description

${previousDescription}

## New Update

${newUpdate}

## Earlier Component Code

${currentCode}
        `,
        output_type: "chat",
        input_type: "chat",
        tweaks: {},
      }),
    });

    const data = await response.json();
    const code = data.outputs[0].outputs[0].outputs.message.message.text;
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
    console.error("Error in iterate API:", error);
    return NextResponse.json(
      { error: "Failed to process the iteration request" },
      { status: 500 }
    );
  }
}
