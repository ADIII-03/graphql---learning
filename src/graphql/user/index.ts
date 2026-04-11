import { userTypeDefs } from "./schema.js";
import { userResolvers } from "./resolver.js"

// Base schema (required for extend)
const baseTypeDefs = `#graphql
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

// 🔥 Merge everything here
export const typeDefs = [
  baseTypeDefs,
  userTypeDefs,
];

export const resolvers = {
  Query: {
    ...userResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
  },
};