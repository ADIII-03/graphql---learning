// graphql/user/user.query.ts
import UserService from "../../services/user.js";

export const userQuery = {
  hello: () => "Hello World!",
  getUserToken: async (_: any, { email, password }: { email: string; password: string }) => {
    const token = await UserService.getUserToken({ email, password });
    return token;
  },
};