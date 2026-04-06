import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
const typeDefs = `#graphql
  type Query {
    hello: String
  }
`;
const resolvers = {
    Query: {
        hello: () => 'Hello World!',
    },
};
const server = new ApolloServer({ typeDefs, resolvers });
startStandaloneServer(server, {
    listen: { port: 4000 },
}).then(({ url }) => {
    console.log(`Server ready at: ${url}`);
});
//# sourceMappingURL=index.js.map