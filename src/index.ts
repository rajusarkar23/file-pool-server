import express from "express"
import dotenv from "dotenv"

dotenv.config()

const app = express()
const PORT = process.env.PORT

app.use(express.json())

// routes
import userRouter from "./routes/user.route"
app.use("/api/v1/user", userRouter)

app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
})