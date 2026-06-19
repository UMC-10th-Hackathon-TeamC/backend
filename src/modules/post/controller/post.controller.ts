import { Body, Controller, Delete, Get, Patch, Path, Post, Queries, Route,} from "tsoa";
import {
    PostAddRequest,
    PostAddResponse,
    PostListResponse,
    PostDetailResponse,
    PostUpdateRequest,
} from "../dto/post.dto.js";
import { postAdd, postList, postDetail, postUpdate, postDelete } from "../service/post.service.js";
import { AppError } from "../../../common/errors/app.error.js";
import { ApiResponse, successResponse } from "../../../common/responses/response.js";
import { StatusCodes } from "http-status-codes";

interface PostListQuery {
    /** 페이지네이션 커서 */
    cursor?: number;
    /** 조회 개수 */
    limit?: number;
}

@Route("")
export class PostController extends Controller {
    /**
     * 게시글 작성 API
     */
    @Post("posts")
    public async handleAddPost(
        @Body() body: PostAddRequest,
    ): Promise<ApiResponse<PostAddResponse>> {
        try {
            const post = await postAdd(body);
            this.setStatus(StatusCodes.CREATED);
            return successResponse(StatusCodes.CREATED, "게시글 작성 성공", post);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, (err as Error).message || "서버 내부 오류");
        }
    }

    /**
     * 게시글 목록 조회 API
     */
    @Get("districts/{districtId}/posts")
    public async handleGetPosts(
        @Path() districtId: number,
        @Queries() query: PostListQuery,
    ): Promise<ApiResponse<PostListResponse>> {
        try {
            const posts = await postList(districtId, query.cursor);
            return successResponse(StatusCodes.OK, "게시글 목록 조회 성공", posts);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, (err as Error).message || "서버 내부 오류");
        }
    }

    /**
     * 게시글 상세 조회 API
     */
    @Get("posts/{postId}")
    public async handleGetPost(
        @Path() postId: number,
    ): Promise<ApiResponse<PostDetailResponse>> {
        try {
            const post = await postDetail(postId);
            return successResponse(StatusCodes.OK, "게시글 조회 성공", post);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, (err as Error).message || "서버 내부 오류");
        }
    }

    /**
     * 게시글 수정 API
     */
    @Patch("posts/{postId}")
    public async handleUpdatePost(
        @Path() postId: number,
        @Body() body: PostUpdateRequest,
    ): Promise<ApiResponse<null>> {
        try {
            await postUpdate(postId, body);
            return successResponse(StatusCodes.OK, "게시글 수정 성공", null);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, (err as Error).message || "서버 내부 오류");
        }
    }

    /**
     * 게시글 삭제 API
     */
    @Delete("posts/{postId}")
    public async handleDeletePost(
        @Path() postId: number,
    ): Promise<ApiResponse<null>> {
        try {
            await postDelete(postId);
            return successResponse(StatusCodes.OK, "게시글 삭제 성공", null);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, (err as Error).message || "서버 내부 오류");
        }
    }
}