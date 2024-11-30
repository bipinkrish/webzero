import { generateUUID } from "@/lib/utils";
import { promises as fs } from "fs";

const baseUrl = "http://127.0.0.1:7860/api/v1/run/";
const flowId = "542c4118-8056-4a7e-a137-23d8fc24d24b";
const url = `${baseUrl}${flowId}?stream=false`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { content } = req.body;

  try {
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

    const data = await response.json();
    const code = data.outputs[0].outputs[0].outputs.message.message.text;
    const formattedCode = code.replace(/^```tsx\n|\n```$/g, "");

    const id = generateUUID().toString();
    const filename = `generated/${id}.tsx`;

    await fs.mkdir("generated", { recursive: true });
    await fs.writeFile(filename, formattedCode, "utf8");

    res.status(200).json({
      id,
      from: "ai",
      content: formattedCode,
    });
  } catch (error) {
    console.error("Error in sendMessage API:", error);
    res.status(500).json({ error: "Failed to process the request" });
  }
}
