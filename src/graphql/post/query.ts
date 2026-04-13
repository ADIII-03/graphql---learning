// graphql/post/query.ts
import PostService from "../../services/post.js";

export const postQuery = {
  getAllPosts: async () => {
    return PostService.getAllPosts();
  },

  getPostById: async (_: unknown, { postId }: { postId: number }) => {
    return PostService.getPostById(postId);
  },

  getPostsByUser: async (_: unknown, { userId }: { userId: number }) => {
    return PostService.getPostsByUser(userId);
  },
};
