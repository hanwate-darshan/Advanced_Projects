import axios from "axios"

const endpoint = process.env.HF_ENDPOINT
const model = process.env.HF_MODEL
const apiKey = process.env.HF_API_KEY

export const isAiEnabled = Boolean(endpoint && model && apiKey)

export async function aiChat(messages, { maxTokens = 128, temperature = 0.6 } = {}) {
  if (!isAiEnabled) {
    console.log("[Hungry AI] HF not configured — skipping AI call")
    return null
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
