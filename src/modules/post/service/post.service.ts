import {
    PostAddRequest,
    PostAddResponse,
    PostListResponse,
    PostDetailResponse,
    PostUpdateRequest,
} from "../dto/post.dto.js";
import {
    createPost,
    findPostsByDistrict,
    findPostById,
    increaseViewCount,
    updatePost,
    deletePost,
} from "../repository/post.repository.js";
import { PostNotFoundError } from "../../../common/errors/error.js";
import { AppError } from "../../../common/errors/app.error.js";
import { StatusCodes } from "http-status-codes";

export const postAdd = async (
    userId: number,
    data: PostAddRequest
): Promise<PostAddResponse> => {
    const post = await createPost(userId, data);
    return {
        id: post.id,
        title: post.title,
        createdAt: post.createdAt,
    };
};

export const postList = async (
    districtId: number,
    cursor?: number
): Promise<PostListResponse> => {
    const posts = await findPostsByDistrict(districtId, cursor);

    return {
        posts: posts.map((p) => ({
            id: p.id,
            title: p.title,
            category: p.category,
            author: p.user.nickname,
            viewCount: p.viewCount,
            likeCount: p.likes.length,
            commentCount: p.comments.length,
            createdAt: p.createdAt,
        })),
        nextCursor: posts.length > 0 ? posts[posts.length - 1].id : null,
    };
};

export const postDetail = async (postId: number): Promise<PostDetailResponse> => {
    const post = await findPostById(postId);
    if (!post) {
        throw new PostNotFoundError();
    }

    await increaseViewCount(postId);

    return {
        id: post.id,
        title: post.title,
        content: post.content,
        category: post.category,
        author: post.user.nickname,
        districtName: post.district.name,
        viewCount: post.viewCount + 1,
        likeCount: post.likes.length,
        commentCount: post.comments.length,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
    };
};

export const postUpdate = async (
    userId: number,
    postId: number,
    data: PostUpdateRequest
): Promise<void> => {
    const post = await findPostById(postId);
    if (!post) {
        throw new PostNotFoundError();
    }

    if (post.userId !== userId) {
        throw new AppError(StatusCodes.FORBIDDEN, "본인의 게시글만 수정할 수 있습니다.");
    }

    await updatePost(postId, data);
};

export const postDelete = async (
    userId: number,
    postId: number
): Promise<void> => {
    const post = await findPostById(postId);
    if (!post) {
        throw new PostNotFoundError();
    }

    if (post.userId !== userId) {
        throw new AppError(StatusCodes.FORBIDDEN, "본인의 게시글만 삭제할 수 있습니다.");
    }

    await deletePost(postId);
};