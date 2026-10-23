import axios from "axios"

export const getAiConfig = () => {
  const endpoint = process.env.HF_ENDPOINT;
  const model = process.env.HF_MODEL;
  const apiKey = process.env.HF_API_KEY;
  const isConfigured = Boolean(
    endpoint &&
    model &&
    apiKey &&
    apiKey.trim() !== "" &&
    apiKey.toLowerCase() !== "none"
  );
  return { endpoint, model, apiKey, isConfigured };
};

export const isAiEnabled = () => getAiConfig().isConfigured;

export async function aiChat(messages, { maxTokens = 128, temperature = 0.6 } = {}) {
  const { endpoint, model, apiKey, isConfigured } = getAiConfig();
  if (!isConfigured) {
    console.log("[Hungry AI] HF API key is 'none' or not configured — skipping AI call gracefully");
    return null;
  }
  try {
    const url = `${endpoint.replace(/\/$/, "")}/chat/completions`
    const { data } = await axios.post(
      url,
      {
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 45000,
      }
    )
    return data?.choices?.[0]?.message?.content?.trim() || null
  } catch (error) {
    const detail = error?.response?.data?.error?.message || error?.message || "unknown"
    console.log(`[Hungry AI] call failed (${detail}) — continuing without AI`)
    return null
  }
}
