import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { updateProfile, getProfile, updateOnlineStatus } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get('/profile', verifyJWT, getProfile);
userRouter.patch('/profile', verifyJWT, upload.single('avatar'), updateProfile);
userRouter.put('/profile', verifyJWT, upload.single('avatar'), updateProfile);
userRouter.patch('/online-status', verifyJWT, updateOnlineStatus);

export default userRouter;
