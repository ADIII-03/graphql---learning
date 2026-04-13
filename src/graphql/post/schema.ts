export const postTypeDefs = `#graphql
  type Post {
    id: Int!
    content: String!
    imageURL: String
    author: User!
    parentId: Int          # null means it's a root thread; number means it's a reply
    replies: [Post!]!      # the direct child replies of this post
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    getAllPosts: [Post!]!
    getPostById(postId: Int!): Post
    getPostsByUser(userId: Int!): [Post!]!
  }

  extend type Mutation {
    createPost(
      content: String!
      imageURL: String
      parentId: Int          # omit for a root thread, provide to reply
    ): Post!

    updatePost(
      postId: Int!
      content: String
      imageURL: String
    ): Post!

    deletePost(postId: Int!): Boolean!
  }
`;
