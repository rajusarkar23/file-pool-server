import { Router } from "express";
import { register, login, upload } from "../controllers/user.controller";
import { userAuthMiddleware } from "../middlewares/user.middleware";
import { multerUpload } from "../utils/multerUploadConfig";

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.post("/upload", userAuthMiddleware, multerUpload.array("files"), upload)

export default router