import { Router } from "express";
import { register, login, logout } from "../controllers/auth.controller.js";

const authRoute = Router()

authRoute.post('/register', register);

authRoute.post('/login', login);

authRoute.post('/logout', logout);

export default authRoute;