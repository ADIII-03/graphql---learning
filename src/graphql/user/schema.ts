export const userTypeDefs = `#graphql
  type User {
    id: Int!
    firstName: String!
    lastName: String!
    email: String!
  }

  extend type Query {
    hello: String 
    getUserToken(email: String!, password: String!): String
  }

  extend type Mutation {
    createUser(
      firstName: String!
      lastName: String!
      email: String!
      password: String!
    ): User
  }
`;