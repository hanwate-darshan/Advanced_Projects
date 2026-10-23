import express from "express"
import { getRecommendations, chatWithAiAssistant, generateItemDescription } from "../controllers/recommendation.controllers.js"
import isAuth from "../middlewares/isAuth.js"

const recommendationRouter = express.Router()

recommendationRouter.get("/", isAuth, getRecommendations)
recommendationRouter.post("/chat", isAuth, chatWithAiAssistant)
recommendationRouter.post("/generate-description", isAuth, generateItemDescription)

export default recommendationRouter
