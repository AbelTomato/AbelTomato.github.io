import { createHash } from "node:crypto";

import { createHttpError } from "../http/errors";
import type { CommentRepository } from "../repositories/commentRepository.types";
import type {
  AdminComment,
  AdminCommentStatus,
  CreateCommentInput,
  CreateCommentResult,
  PublicComment,
} from "../types/comments";

export interface CommentService {
  listApprovedByPostSlug(postSlug: string): Promise<PublicComment[]>;
  listByStatus(status: AdminCommentStatus): Promise<AdminComment[]>;
  createPending(input: CreateCommentInput): Promise<CreateCommentResult>;
  updateStatus(id: string, status: AdminCommentStatus): Promise<boolean>;
}

interface CreateCommentServiceOptions {
  hashSalt?: string;
}

export function createCommentService(
  repository: CommentRepository,
  options: CreateCommentServiceOptions = {},
): CommentService {
  const hashSalt = options.hashSalt ?? "";

  return {
    listApprovedByPostSlug(postSlug) {
      return repository.listApprovedByPostSlug(postSlug);
    },

    listByStatus(status) {
      return repository.listByStatus(status);
    },

    async createPending(input) {
      await repository.createPending({
        postSlug: input.postSlug,
        parentId: input.parentId,
        authorName: input.authorName,
        authorEmailHash: input.authorEmail
          ? hashValue(input.authorEmail, hashSalt)
          : null,
        content: input.content,
        ipHash: input.ipAddress ? hashValue(input.ipAddress, hashSalt) : null,
        userAgentHash: input.userAgent
          ? hashValue(input.userAgent, hashSalt)
          : null,
      });

      return {
        status: "pending",
        message: "评论已提交，审核后展示",
      };
    },

    updateStatus(id, status) {
      return repository.updateStatus(id, status);
    },
  };
}

export function createUnavailableCommentService(): CommentService {
  return {
    async listApprovedByPostSlug() {
      throw createHttpError(500, "INTERNAL_SERVER_ERROR", "评论服务尚未配置");
    },
    async listByStatus() {
      throw createHttpError(500, "INTERNAL_SERVER_ERROR", "评论服务尚未配置");
    },
    async createPending() {
      throw createHttpError(500, "INTERNAL_SERVER_ERROR", "评论服务尚未配置");
    },
    async updateStatus() {
      throw createHttpError(500, "INTERNAL_SERVER_ERROR", "评论服务尚未配置");
    },
  };
}

function hashValue(value: string, salt: string) {
  return createHash("sha256")
    .update(`${salt}:${value.trim().toLowerCase()}`)
    .digest("hex");
}