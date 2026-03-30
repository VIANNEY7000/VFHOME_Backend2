import { product } from "../models/product_models.js"


// CRERAT PRODUCT
export const creatProduct = async(req, res) => {
    try {
        const {name, price, discription, image, category} = req.body
        const newProduct = await product.create({
            name,
            price,
            discription,
            image,
            category
        })
        res.status(201).json({
            success:true,
            message:'product created successfully',
            product:newProduct
        })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({
            success:false,
            message:'server Error',
            error
        })
    }
}



// GET ALL PRODUCTS
export const getAllProduct = async(req, res) => {
    try {
        let Products = await product.find()
        res.status(200).json({success:true, Products})

    } catch (error) {
        res.status(500).json({message:"server Error", error})
    }
}



// GET PRODUCT BY ID
export const getproductById = async (req, res) => {
    const productId = req.params.id 

    try {
        const products = await product.findById(productId)
        if(!products) return res.status(404).json({message:"product Not Found"})
            res.status(200).json(products)

    } catch (error) {
        res.status(500).json({message:error.message})
    }
}


// UPDATE PRODUCT

export const updateProduct = async (req, res) => {
    let productId= req.params.id
    const {name, price, discription, image, category } = req.body

    try {
        let products = await product.findById(productId)
        if(!products) return res.status(404).json({message:"product Not Found"})

        // update only provided fileds
        products.name = name || products.name
        products.price = price || products.price
        products.discription = discription || products.discription
        products.image = image || products.image
        products.category = category || products.category
        await products.save ()

        // succes message
        res.status(200).json({message:"product successfilly updated", products:{
            id: products._id,
            name : products.name,
            price : products.price,
            discription : products.discription,
            image : products.image,
            category : products.category,
        }
    })

    } catch (error) {
        res.status(500).json({message:error.message})
    }
}



// DELET PRODUCT

export const deleteproduct = async (req, res) => {
    const productId = req.params.id
    try {

        const products = await product.findById(productId)
        if (!products) return res.status(404).json({message:"product Dosenot Exist"})
        await products.deleteOne()
        res.status(200).json({message:"product Deleted Successfilly"})

    } catch (error) {
        res.status(500).json({message:error.message})
    }

}