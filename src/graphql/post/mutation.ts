// graphql/post/mutation.ts
import { GraphQLError } from "graphql";
import PostService, {
  type CreatePostPayload,
  type UpdatePostPayload,
} from "../../services/post.js";

// The context shape coming from server.ts
export interface Context {
  user: { id: number } | null;
}

// Guard: ensure request has a valid logged-in user
function requireAuth(context: Context) {
  if (!context.user) {
    throw new GraphQLError("You must be logged in to do this", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return context.user;
}

export const postMutation = {
  createPost: async (
    _: unknown,
    payload: CreatePostPayload,
    context: Context
  ) => {
    const user = requireAuth(context);
    return PostService.createPost(payload, user.id);
  },

  updatePost: async (
    _: unknown,
    payload: UpdatePostPayload,
    context: Context
  ) => {
    const user = requireAuth(context);
    return PostService.updatePost(payload, user.id);
  },

  deletePost: async (
    _: unknown,
    { postId }: { postId: number },
    context: Context
  ) => {
    const user = requireAuth(context);
    return PostService.deletePost(postId, user.id);
  },
};
