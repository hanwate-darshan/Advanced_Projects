import Order from "../models/order.model.js"
import Item from "../models/item.model.js"
import Shop from "../models/shop.model.js"
import { aiChat } from "../utils/ai.js"

export const getRecommendations = async (req, res) => {
  try {
    const { city } = req.query
    if (!city) {
      return res.status(400).json({ message: "city is required" })
    }

    // 1. What has this user ordered before?
    const orders = await Order.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("shopOrders.shopOrderItems")
      .lean()

    const orderedItemIds = new Set()
    const orderedItemNames = new Set()
    orders.forEach((order) => {
      (order.shopOrders || []).forEach((so) => {
        (so.shopOrderItems || []).forEach((i) => {
          if (i.item) orderedItemIds.add(String(i.item))
          if (i.name) orderedItemNames.add(i.name)
        })
      })
    })

    // Categories this user tends to order from
    const orderedCategories = new Set()
    if (orderedItemIds.size > 0) {
      const orderedItems = await Item.find({ _id: { $in: [...orderedItemIds] } })
        .select("category")
        .lean()
      orderedItems.forEach((i) => i.category && orderedCategories.add(i.category))
    }

    // 2. Items available in this city
    const shops = await Shop.find({ city: { $regex: new RegExp(`^${city}$`, "i") } })
      .select("_id")
      .lean()
    const shopIds = shops.map((s) => s._id)
    let cityItems = []
    if (shopIds.length > 0) {
      cityItems = await Item.find({ shop: { $in: shopIds } }).lean()
    }

    // 3. Candidate pool: same categories as past orders, excluding already-ordered
    let candidates = []
    if (orderedCategories.size > 0) {
      candidates = cityItems.filter(
        (i) => i.category && orderedCategories.has(i.category) && !orderedItemIds.has(String(i._id))
      )
    }

    // Fallback: nothing personalized available -> top-rated items in the city
    if (candidates.length === 0) {
      candidates = cityItems.filter((i) => !orderedItemIds.has(String(i._id)))
    }

    const scored = candidates.map((i) => ({
      score: (i.category && orderedCategories.has(i.category) ? 1 : 0) * 2 + (i.rating?.average || 0),
      item: i,
    }))
    scored.sort(
      (a, b) => b.score - a.score || (b.item.rating?.count || 0) - (a.item.rating?.count || 0)
    )

    const top = scored.slice(0, 6).map((s) => s.item)

    // 4. Optional AI "why this?" reasons (single call, graceful fallback)
    if (top.length > 0) {
      const reasonMap = await generateReasons(orderedItemNames, top)
      top.forEach((item) => {
        item.reason = reasonMap[String(item._id)] || null
      })
    }

    return res.status(200).json(top)
  } catch (error) {
    return res.status(500).json({ message: `recommendations error ${error}` })
  }
}

async function generateReasons(orderedNames, items) {
  const prompt = [
    "You are a friendly food recommendation assistant for the Hungry food delivery app.",
    `The user has previously ordered: ${[...orderedNames].slice(0, 10).join(", ") || "nothing yet"}.`,
    "Given the candidate dishes below (id: name), write ONE short, appetizing reason per dish explaining why this user would like it.",
    'Respond ONLY with valid JSON in the format {"<id>": "reason"}. No extra text.',
    "Candidates:",
    ...items.map((i) => `${i._id}: ${i.name} (${i.category}, ${i.foodType})`),
  ].join("\n")

  const content = await aiChat(
    [
      { role: "system", content: "You output only valid JSON." },
      { role: "user", content: prompt },
    ],
    { maxTokens: 200, temperature: 0.6 }
  )

  if (!content) return {}
  try {
    const parsed = JSON.parse(content.replace(/```json|```/g, "").trim())
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch (e) {
    return {}
  }
}
