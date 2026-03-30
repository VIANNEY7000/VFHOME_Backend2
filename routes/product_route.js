import express from 'express'
import { creatProduct, deleteproduct, getAllProduct, getproductById, updateProduct } from "../controller/product_controller.js"

const router = express.Router ()

router.post ('/', creatProduct)
router.get ('/',  getAllProduct)
router.get ('/:id',  getproductById)
router.put ('/update/:id',  updateProduct)
router.delete ('/delete/:id',  deleteproduct)


export default router