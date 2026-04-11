// services/user.service.ts
import { prisma } from "../utils/db.js"; // ✅ reuse instance
import { createHmac, randomBytes } from "node:crypto";
import JWT from "jsonwebtoken"; 

const JWT_SECRET = "your_jwt_secret"; // In production, use environment variable
export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface GetUserTokenPayload {
    email: string;
    password: string;
    }

    
class UserService {
  public static async createUser(payload: CreateUserPayload) {
    const salt = randomBytes(16).toString("hex");

    const hashedPassword = createHmac("sha256", salt)
      .update(payload.password)
      .digest("hex");

    return await prisma.user.create({
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        password: hashedPassword,
        salt: salt,
      },
    });
  }


  private static async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  public static async getUserToken(payload: GetUserTokenPayload) {
    const {email, password} = payload;

    const user = await this.findUserByEmail(email);

    if (!user) {
        throw new Error("User not found");
    }

    const userSalt = user.salt;

    const hashedPassword = createHmac("sha256", userSalt)
      .update(password)
      .digest("hex");

    if (hashedPassword !== user.password) {
        throw new Error("Invalid password");
    }

    //generate a token 
const token = JWT.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });

return token;

  }
}

export default UserService;