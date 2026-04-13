// graphql/post/resolver.ts
import { postQuery } from "./query.js";
import { postMutation } from "./mutation.js";

export const postResolvers = {
  Query: postQuery,
  Mutation: postMutation,
};
