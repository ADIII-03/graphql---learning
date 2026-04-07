import "dotenv/config";
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { prisma } from './utils/db.js';

const typeDefs = `#graphql
  type User {
    id: Int!
    firstName: String!
    lastName: String!
    email: String!
  }

  type Query {
    hello: String
  }

  type Mutation {
    createUser(
      firstName: String!
      lastName: String!
      email: String!
      password: String!
    ): User
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello World!',
  },
  Mutation: {

    createUser: async (
      _: any,
      { firstName, lastName, email, password }: 
      { firstName: string; lastName: string; email: string; password: string }
    ) => {
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password,
          salt: '',
        },
      });
      return user;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at: ${url}`);
});