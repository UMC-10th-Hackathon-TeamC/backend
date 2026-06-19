import { LikeAddRequest, LikeResponse } from "../dto/like.dto.js";
import {
    findLike,
    createLike,
    deleteLike,
    countLikes,
    findPostById,
} from "../repository/like.repository.js";
import { PostNotFoundError } from "../../../common/errors/error.js";
import { AppError } from "../../../common/errors/app.error.js";

export const likeAdd = async (
    postId: number,
    data: LikeAddRequest
): Promise<LikeResponse> => {
    const post = await findPostById(postId);
    if (!post) {
        throw new PostNotFoundError();
    }

    const existing = await findLike(postId, data.userId);
    if (existing) {
        throw new AppError(409, "이미 좋아요한 게시글입니다.");
    }

    await createLike(postId, data.userId);
    const likeCount = await countLikes(postId);

    return { likeCount };
};

export const likeCancel = async (
    postId: number,
    userId: number
): Promise<LikeResponse> => {
    const post = await findPostById(postId);
    if (!post) {
        throw new PostNotFoundError();
    }

    const existing = await findLike(postId, userId);
    if (!existing) {
        throw new AppError(400, "좋아요하지 않은 게시글입니다.");
    }

    await deleteLike(postId, userId);
    const likeCount = await countLikes(postId);

    return { likeCount };
};