import express from 'express'
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "../controller/product_controller.js"

const router = express.Router ()

router.post ('/', createProduct)
router.get ('/',  getAllProducts)
router.get ('/:id',  getProductById)
router.put ('/update/:id',  updateProduct)
router.delete ('/delete/:id',  deleteProduct)


export default router