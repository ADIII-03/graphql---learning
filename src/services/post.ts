// services/post.ts
import { prisma } from "../utils/db.js";
import { GraphQLError } from "graphql";

export interface CreatePostPayload {
  content: string;
  imageURL?: string;
  parentId?: number; // if provided, this is a reply to another post
}

export interface UpdatePostPayload {
  postId: number;
  content?: string;
  imageURL?: string;
}

class PostService {
  // ─── Queries ──────────────────────────────────────────────

  /**
   * Fetch all root-level threads (no parentId), newest first.
   * Each thread comes with its author and the count of direct replies.
   */
  public static async getAllPosts() {
    return prisma.post.findMany({
      where: { parentId: null }, // only root threads
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
        replies: {
          include: { author: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  /**
   * Get a single post/thread by ID, with its full reply chain.
   */
  public static async getPostById(postId: number) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
        replies: {
          include: { author: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!post) throw new GraphQLError("Post not found", { extensions: { code: "NOT_FOUND" } });

    return post;
  }

  /**
   * Fetch all posts by a specific user.
   */
  public static async getPostsByUser(userId: number) {
    return prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      include: { author: true, replies: true },
    });
  }

  // ─── Mutations ────────────────────────────────────────────

  /**
   * Create a root thread or a reply.
   * Pass `parentId` to make it a reply to an existing post.
   */
  public static async createPost(payload: CreatePostPayload, authorId: number) {
    const { content, imageURL, parentId } = payload;

    // If parentId is given, make sure the parent post exists
    if (parentId) {
      const parent = await prisma.post.findUnique({ where: { id: parentId } });
      if (!parent) throw new GraphQLError("Parent post not found", { extensions: { code: "NOT_FOUND" } });
    }

    return prisma.post.create({
      data: {
        content,
        imageURL: imageURL ?? null,
        authorId,
        parentId: parentId ?? null,
      },
      include: { author: true, replies: true },
    });
  }

  /**
   * Update your own post. Throws FORBIDDEN if another user tries.
   */
  public static async updatePost(payload: UpdatePostPayload, requestingUserId: number) {
    const { postId, content, imageURL } = payload;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new GraphQLError("Post not found", { extensions: { code: "NOT_FOUND" } });

    if (post.authorId !== requestingUserId) {
      throw new GraphQLError("You can only edit your own posts", { extensions: { code: "FORBIDDEN" } });
    }

    return prisma.post.update({
      where: { id: postId },
      data: {
        ...(content !== undefined && { content }),
        ...(imageURL !== undefined && { imageURL }),
      },
      include: { author: true, replies: true },
    });
  }

  /**
   * Delete your own post (cascades and deletes all replies too).
   */
  public static async deletePost(postId: number, requestingUserId: number) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new GraphQLError("Post not found", { extensions: { code: "NOT_FOUND" } });

    if (post.authorId !== requestingUserId) {
      throw new GraphQLError("You can only delete your own posts", { extensions: { code: "FORBIDDEN" } });
    }

    await prisma.post.delete({ where: { id: postId } });
    return true;
  }
}

export default PostService;
