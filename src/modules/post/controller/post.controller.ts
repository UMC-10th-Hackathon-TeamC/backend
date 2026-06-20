import { Body, Controller, Delete, Get, Patch, Path, Post, Queries, Route, Security, Request } from "tsoa";
import { Request as ExpressRequest } from "express"; // Request 주입을 위해 추가
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
import { getUserIdFromRequest } from '../../../auth.config';

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
    @Security("jwt")
    @Post("posts")
    public async handleAddPost(
        @Request() req: ExpressRequest, // Request 주입
        @Body() body: PostAddRequest,
    ): Promise<ApiResponse<PostAddResponse>> {
        console.log("받은 Body 데이터:", body);
        try {
            const userId = getUserIdFromRequest(req); // 토큰에서 userId 추출
            const post = await postAdd(userId, body); // 서비스에 userId 전달
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
    @Security("jwt") // 인증 추가
    @Patch("posts/{postId}")
    public async handleUpdatePost(
        @Request() req: ExpressRequest, // Request 주입
        @Path() postId: number,
        @Body() body: PostUpdateRequest,
    ): Promise<ApiResponse<null>> {
        try {
            const userId = getUserIdFromRequest(req); // 토큰에서 userId 추출
            await postUpdate(userId, postId, body); // 서비스에 userId 전달
            return successResponse(StatusCodes.OK, "게시글 수정 성공", null);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, (err as Error).message || "서버 내부 오류");
        }
    }

    /**
     * 게시글 삭제 API
     */
    @Security("jwt")
    @Delete("posts/{postId}")
    public async handleDeletePost(
        @Request() req: ExpressRequest, // Request 주입
        @Path() postId: number,
    ): Promise<ApiResponse<null>> {
        try {
            const userId = getUserIdFromRequest(req); // 토큰에서 userId 추출
            await postDelete(userId, postId); // 서비스에 userId 전달
            return successResponse(StatusCodes.OK, "게시글 삭제 성공", null);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, (err as Error).message || "서버 내부 오류");
        }
    }
}