// import axios from "axios";

// export async function callAIApi(cid: string, text: string): Promise<Blob> {
//   const postData any;
//   postData = new postData();
//   postData.append("voice_file", file);
//   postData.append("text", "http://www.gutenberg.org/files/11/11-0.txt");

//   try {
//     const response = await axios.post("https://chloe-audiogen.hf.space/api/voice-transfer", {"cid": cid, "text", }, {
//       responseType: "arraybuffer", // Required for binary data
//       headers: {
//         // Add headers if needed
//         "Content-Type": "application/json", // Adjust based on postData
//       },
//     });
//     const mp3Blob = new Blob([response.data], { type: "audio/mpeg" });

//     // Verify content type (optional)
//     const contentType = response.headers["content-type"];
//     if (contentType !== "audio/mpeg" && contentType !== "audio/mp3") {
//       console.warn(`Unexpected Content-Type: ${contentType}`);
//     }

//     return { mp3Blob };
//   } catch (error) {
//     console.error("Failed to fetch MP3:", error);
//     throw error;
//   }

//   return response.data;
// }

// export async function generateTTS(text: string, modelId: string): Promise<string> {
//   const response = await axios.post(
//     "https://api.elevenlabs.io/v1/text-to-speech",
//     { text, model_id: modelId },
//     { headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY } },
//   );
//   return response.data.url;
// }
