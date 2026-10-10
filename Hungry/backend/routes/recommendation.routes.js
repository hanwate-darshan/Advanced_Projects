import express from "express"
import { getRecommendations } from "../controllers/recommendation.controllers.js"
import isAuth from "../middlewares/isAuth.js"

const recommendationRouter = express.Router()

recommendationRouter.get("/", isAuth, getRecommendations)

export default recommendationRouter
