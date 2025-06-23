import axios from "axios";

export async function callAIApi(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axios.post("https://api.elevenlabs.io/v1/voice-cloning", formData, {
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY },
  });
  return response.data.modelId;
}

export async function generateTTS(text: string, modelId: string): Promise<string> {
  const response = await axios.post(
    "https://api.elevenlabs.io/v1/text-to-speech",
    { text, model_id: modelId },
    { headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY } },
  );
  return response.data.url;
}
