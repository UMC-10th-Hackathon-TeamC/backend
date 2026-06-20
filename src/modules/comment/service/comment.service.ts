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
import { StatusCodes } from "http-status-codes";

export const commentAdd = async (
    postId: number,
    userId: number, // 파라미터 추가
    data: CommentAddRequest
): Promise<CommentAddResponse> => {
    const post = await findPostById(postId);
    if (!post) {
        throw new PostNotFoundError();
    }

    const comment = await createComment({
        postId,
        userId, // 인증된 userId 사용
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
    userId: number, // 인증된 userId 추가
    commentId: number,
    data: CommentUpdateRequest
): Promise<void> => {
    const comment = await findCommentById(commentId);
    if (!comment) {
        throw new AppError(StatusCodes.NOT_FOUND, "존재하지 않는 댓글입니다.");
    }

    // 본인 확인 로직 추가
    if (comment.userId !== userId) {
        throw new AppError(StatusCodes.FORBIDDEN, "본인이 작성한 댓글만 수정할 수 있습니다.");
    }

    await updateComment(commentId, data.content);
};

export const commentDelete = async (
    userId: number, // 인증된 userId 추가
    commentId: number
): Promise<void> => {
    const comment = await findCommentById(commentId);
    if (!comment) {
        throw new AppError(StatusCodes.NOT_FOUND, "존재하지 않는 댓글입니다.");
    }

    // 본인 확인 로직 추가
    if (comment.userId !== userId) {
        throw new AppError(StatusCodes.FORBIDDEN, "본인이 작성한 댓글만 삭제할 수 있습니다.");
    }

    await deleteComment(commentId);
};