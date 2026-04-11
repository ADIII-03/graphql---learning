// graphql/modules/user/user.mutation.ts
import UserService, { type CreateUserPayload } from "../../services/user.js"

export const userMutation = {
  createUser: async (_: any, payload: CreateUserPayload) => {
    const res = await UserService.createUser(payload);
    return res ;
  },
  
};