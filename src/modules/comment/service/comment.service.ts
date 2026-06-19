import {
    CommentAddRequest,
    CommentAddResponse,
    CommentListResponse,
    CommentUpdateRequest,
} from "../dto/comment.dto.js";
import {
    createComment,
    findCommentsByPostId,
    findCommentById,
    updateComment,
    deleteComment,
    findPostById,
} from "../repository/comment.repository.js";
import { PostNotFoundError } from "../../../common/errors/error.js";
import { AppError } from "../../../common/errors/app.error.js";

export const commentAdd = async (
    postId: number,
    data: CommentAddRequest
): Promise<CommentAddResponse> => {
    const post = await findPostById(postId);
    if (!post) {
        throw new PostNotFoundError();
    }

    const comment = await createComment({
        postId,
        userId: data.userId,
        content: data.content,
    });

    return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
    };
};

export const commentList = async (postId: number): Promise<CommentListResponse> => {
    const post = await findPostById(postId);
    if (!post) {
        throw new PostNotFoundError();
    }

    const comments = await findCommentsByPostId(postId);

    return {
        comments: comments.map((c) => ({
            id: c.id,
            content: c.content,
            author: c.user.nickname,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
        })),
    };
};

export const commentUpdate = async (
    commentId: number,
    data: CommentUpdateRequest
): Promise<void> => {
    const comment = await findCommentById(commentId);
    if (!comment) {
        throw new AppError(404, "존재하지 않는 댓글입니다.");
    }

    await updateComment(commentId, data.content);
};

export const commentDelete = async (commentId: number): Promise<void> => {
    const comment = await findCommentById(commentId);
    if (!comment) {
        throw new AppError(404, "존재하지 않는 댓글입니다.");
    }

    await deleteComment(commentId);
};