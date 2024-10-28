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

const register = async (req: any, res: any) => {
    
    const {username, email, password} = req.body
    const otp = generateOtp()
    const bcryptOtp = bcrypt.hashSync(otp, 10)
    const bcryptPassword =bcrypt.hashSync(password, 10)
    const lastLogin = new Date().toISOString()
    const loginCount = 1;

    try {
        const findUserByEmail = await database.listDocuments(DATABASE_ID!, COLLECTION_ID!,[
            Query.equal("email", email)
        ])
        
        if (findUserByEmail.total > 0) {
            console.log("User found");
            console.log(findUserByEmail);
            return res.status(400).json({success: false, message: "User already available with this email."})
        }

        const findUserByUsername = await database.listDocuments(DATABASE_ID!, COLLECTION_ID!, [
            Query.equal("username", username)
        ])

        if (findUserByUsername.total > 0) {
            console.log("User found");
            console.log(findUserByUsername);
            return res.status(400).json({success: false, message: "User already available with this username."})
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

// login
const login = async (req:any, res:any) => {
    const {userNameOrEmail, password} = req.body;
    
    // found user with email
    const findUserByEmail = await database.listDocuments(DATABASE_ID!, COLLECTION_ID!, [
        Query.equal("email", userNameOrEmail),
    ])
    
    if (findUserByEmail.total > 0) {
        // if user found success, take the db pass and compare it with 
        // the user input pass
        const dbPass = findUserByEmail.documents[0].password
        const comparePass = bcrypt.compareSync(password, dbPass)
        // if comparison fails, return the error
        if (!comparePass) {
            return res.status(400).json({success: false, message: "Wrong credentials"})
        }
        // if it success return a session
        const jwt_token = jwt.sign({userId: findUserByEmail.documents[0].$id}, `${process.env.JWT_TOKEN_SESSION_SECRET}`, {expiresIn: "60m"})
        return res.cookie("session_token", jwt_token).status(200).json({success: true, message: "Login success"})
    }
    
    // found user by username if not found by email
    const findUserByUsername = await database.listDocuments(DATABASE_ID!, COLLECTION_ID!, [
        Query.equal("username", userNameOrEmail)
    ])
    if (findUserByUsername.total > 0) {
        
        const dbPass = findUserByUsername.documents[0].password
        
        const comparePass = bcrypt.compareSync(password, dbPass)
        
        if (!comparePass) {
            return res.status(400).json({success: false, message: "Wrong creedentials"})
        }
        const jwt_token = jwt.sign({userId: findUserByUsername.documents[0].$id}, `${process.env.JWT_TOKEN_SESSION_SECRET}`, {expiresIn: "60m"})
        return res.cookie("session_token", jwt_token).status(200).json({success: true, message: "Login success"})
    }
}

// upload files
export {register, login}