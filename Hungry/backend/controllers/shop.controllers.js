import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createEditShop=async (req,res) => {
    try {
       const {name,city,state,address}=req.body
       let image;
       if(req.file){
        console.log("Uploaded file:", req.file)
        image=await uploadOnCloudinary(req.file.path)
       } 
       let shop=await Shop.findOne({owner:req.userId})
       if(!shop){
        if(!image){
            return res.status(400).json({message:"Please upload a shop image"})
        }
        shop=await Shop.create({
         name,city,state,address,image,owner:req.userId
        })
       }else{
         shop=await Shop.findByIdAndUpdate(shop._id,{
          name,city,state,address,
          image: image || shop.image,
          owner:req.userId
         },{new:true})
       }
      
       await shop.populate("owner items")
       return res.status(201).json(shop)
    } catch (error) {
        console.error("Create shop error:", error)
        return res.status(500).json({message:`create shop error ${error}`})
    }
}

export const getMyShop=async (req,res) => {
    try {
        const shop=await Shop.findOne({owner:req.userId}).populate("owner").populate({
            path:"items",
            options:{sort:{updatedAt:-1}}
        })
        if(!shop){
            return res.status(200).json(null)
        }
        return res.status(200).json(shop)
    } catch (error) {
        return res.status(500).json({message:`get my shop error ${error}`})
    }
}

export const getShopByCity = async (req, res) => {
    try {
        const { city } = req.params
        if (!city) {
            return res.status(200).json([])
        }

        const cleanCity = decodeURIComponent(city).trim()
        const escapedCity = cleanCity.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

        let shops = await Shop.find({
            city: { $regex: new RegExp(`^${escapedCity}$`, "i") }
        }).populate('items')

        // If no exact match, fallback to partial search (e.g. Pune matches Pune District)
        if (!shops || shops.length === 0) {
            const firstWord = cleanCity.split(" ")[0].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
            if (firstWord) {
                shops = await Shop.find({
                    city: { $regex: new RegExp(firstWord, "i") }
                }).populate('items')
            }
        }

        return res.status(200).json(shops || [])
    } catch (error) {
        console.error("getShopByCity error:", error)
        return res.status(500).json({ message: `get shop by city error ${error}` })
    }
}