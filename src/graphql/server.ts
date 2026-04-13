import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs, resolvers } from "./index.js"; // ✅ FIXED
import jwt from "jsonwebtoken";
import { prisma } from "../utils/db.js";

export async function createApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req }) => {
      const token = req.headers.authorization?.split(" ")[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
          const user = await prisma.user.findUnique({ where: { id: Number(decoded.userId) } });
          return { user };
        } catch (error) {
          console.error("Invalid token:", error);
        }
      }
      return { user: null };
    },
  });

  console.log(`🚀 GraphQL Server ready at: ${url}`);
}