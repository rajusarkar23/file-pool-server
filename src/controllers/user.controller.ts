import { Query } from "node-appwrite";
import { database } from "../utils/appwriteDBConnection";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const DATABASE_ID = process.env.DATABASE_ID;
const COLLECTION_ID = process.env.COLLECTION_ID

// Generate otp
function generateOtp( l = 6) {
    let otp = ""
    for (let i = 0; i < l; i++) {
        otp += Math.floor(Math.random()*10) 
    }
    return otp
}

const createUser = async (req: any, res: any) => {
    
    const {username, email, password} = req.body
    const otp = generateOtp()
    const bcryptOtp = bcrypt.hashSync(otp, 10)
    const bcryptPassword =bcrypt.hashSync(password, 10)
    const lastLogin = new Date().toISOString()
    const loginCount = 1;

    try {
        const findUser = await database.listDocuments(DATABASE_ID!, COLLECTION_ID!,[
            Query.equal("email", email)
        ])
        
        if (findUser.total > 0) {
            console.log("User found");
            console.log(findUser);
            return res.status(400).json({success: false, message: "User already available with this email."})
        }

        const user = await database.createDocument(
            DATABASE_ID!,
            COLLECTION_ID!,
            "unique()",
            {
                username: username,
                email: email,
                password: bcryptPassword,
                otp: bcryptOtp,
                isVerified: false,
                lastLogin: lastLogin,
                loginCount: loginCount
            }
        )

        const jwt_token = jwt.sign({userId: user.$id}, `${process.env.JWT_TOKEN_SECRET}`, {expiresIn: "5m"})
        console.log(otp);
        return res.cookie("token", jwt_token).status(200).json({message: "Created", user, jwt_token})
    } catch (error) {
        console.log(error);
        return error
    }
    
}
export {createUser}