import { Message } from "@/lib/types";
import { generateUUID } from "@/lib/utils";

export async function sendMessage(content: string): Promise<Message> {
  const response = await fetch(
    "http://127.0.0.1:7860/api/v1/run/542c4118-8056-4a7e-a137-23d8fc24d24b?stream=false",
    {
      method: "POST",
      headers: {
        // "Authorization": "Bearer <TOKEN>",
        "Content-Type": "application/json",
        // "x-api-key": "sk-oEGNxo3Lr6gQqrvUlQuTa3gmTrfxV3HLlEbgbrp1tcw"
      },
      body: JSON.stringify({
        input_value: content,
        output_type: "chat",
        input_type: "chat",
        tweaks: {},
      }),
    }
  );

  const data = await response.json();
  const code = data.outputs[0].outputs[0].outputs.message.message.text;
  const formattedCode = code.replace(/^```tsx\n|\n```$/g, '');

  return {
    id: generateUUID().toString(),
    from: 'ai',
    content: formattedCode
  };
}
