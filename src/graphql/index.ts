import { userTypeDefs } from "./user/schema.js";
import { userResolvers } from "./user/resolver.js";

// Base schema
const baseTypeDefs = `#graphql
  type Query {
    _empty: String
  } 

  type Mutation {
    _empty: String
  }
`;

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