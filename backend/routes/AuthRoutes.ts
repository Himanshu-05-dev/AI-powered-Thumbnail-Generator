import express from "express"
import { loginUser, logoutUser, registerUser, verifyUser } from "../controllers/AuthControllers"
import protect from "../middlewares/auth"

const Authrouter = express.Router()

Authrouter.post('/register',registerUser)
Authrouter.post('/login',loginUser)
Authrouter.get('/verify',protect,verifyUser)
Authrouter.post('/logout',protect,logoutUser)

export default Authrouter;

