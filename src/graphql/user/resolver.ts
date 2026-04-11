import { userQuery } from './query.js';
import { userMutation } from "./mutation.js";

export const userResolvers = {
  Query: userQuery,
  Mutation: userMutation,
};