import { userTypeDefs, userResolvers } from "./user/index.js";
import { postTypeDefs, postResolvers } from "./post/index.js";

// Base schema — required root types so modules can use "extend type"
const baseTypeDefs = `#graphql
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

// Merge all module typeDefs
export const typeDefs = [
  baseTypeDefs,
  userTypeDefs,
  postTypeDefs,
];

// Merge all module resolvers
export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...postResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
  },
};