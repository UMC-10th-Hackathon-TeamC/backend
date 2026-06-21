import { Body, Controller, Delete, Get, Patch, Path, Post, Queries, Route, Security, Request, Tags, Example, Response } from "tsoa";
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
import { getUserIdFromRequest, getOptionalUserIdFromRequest } from '../../../auth.config';

interface PostListQuery {
    /** 페이지네이션 커서 */
    cursor?: number;
    /** 조회 개수 */
    limit?: number;
}

@Route("")
@Tags("Post")
export class PostController extends Controller {
/**
 * 로그인한 사용자가 게시글을 작성합니다.
 *
 * @summary 게시글 작성
 */
    @Security("jwt")
    @Post("posts")
    @Example<ApiResponse<PostAddResponse>>({
        success: true,
        statusCode: 201,
        message: "게시글 작성 성공",
        data: {
            id: 1,
            title: "강남구 모기 너무 심해요",
            createdAt: new Date("2026-06-21T09:00:00.000Z"),
        },
    })
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
 * 특정 자치구의 게시글 목록을 조회합니다.
 *
 * @summary 자치구 게시글 목록 조회
 * @param districtId 자치구 ID
 */
    @Get("districts/{districtId}/posts")
    @Example<ApiResponse<PostListResponse>>({
        success: true,
        statusCode: 200,
        message: "게시글 목록 조회 성공",
        data: {
            posts: [
                {
                    id: 1,
                    title: "강남구 모기 너무 심해요",
                    content: "퇴근길에 모기한테 3방 물렸어요...",
                    category: "잡담",
                    author: "홍길동",
                    viewCount: 12,
                    likeCount: 3,
                    commentCount: 2,
                    createdAt: new Date("2026-06-21T09:00:00.000Z"),
                    isMine: false,
                    isLiked: true,
                },
            ],
            nextCursor: 1,
        },
    })
    public async handleGetPosts(
        @Request() req: ExpressRequest,
        @Path() districtId: number,
        @Queries() query: PostListQuery,
    ): Promise<ApiResponse<PostListResponse>> {
        try {
            const userId = getOptionalUserIdFromRequest(req);
            const posts = await postList(districtId, query.cursor, userId);
            return successResponse(StatusCodes.OK, "게시글 목록 조회 성공", posts);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, (err as Error).message || "서버 내부 오류");
        }
    }

/**
 * 게시글 상세 정보를 조회합니다.
 *
 * @summary 게시글 상세 조회
 * @param postId 게시글 ID
 */
    @Get("posts/{postId}")
    @Example<ApiResponse<PostDetailResponse>>({
        success: true,
        statusCode: 200,
        message: "게시글 조회 성공",
        data: {
            id: 1,
            title: "강남구 모기 너무 심해요",
            content: "퇴근길에 모기한테 3방 물렸어요...",
            category: "잡담",
            author: "홍길동",
            districtName: "강남구",
            viewCount: 13,
            likeCount: 3,
            commentCount: 2,
            createdAt: new Date("2026-06-21T09:00:00.000Z"),
            updatedAt: new Date("2026-06-21T09:00:00.000Z"),
            isLiked: true,
        },
    })
    @Response<ApiResponse<null>>(404, "존재하지 않는 게시글입니다.", {
        success: false,
        statusCode: 404,
        message: "존재하지 않는 게시글입니다.",
        data: null,
    })
    public async handleGetPost(
        @Request() req: ExpressRequest,
        @Path() postId: number,
    ): Promise<ApiResponse<PostDetailResponse>> {
        try {
            const userId = getOptionalUserIdFromRequest(req);
            const post = await postDetail(postId, userId);
            return successResponse(StatusCodes.OK, "게시글 조회 성공", post);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, (err as Error).message || "서버 내부 오류");
        }
    }

/**
 * 로그인한 사용자가 본인의 게시글을 수정합니다.
 *
 * @summary 게시글 수정
 * @param postId 게시글 ID
 */
    @Security("jwt") // 인증 추가
    @Patch("posts/{postId}")
    @Example<ApiResponse<null>>({
        success: true,
        statusCode: 200,
        message: "게시글 수정 성공",
        data: null,
    })
    @Response<ApiResponse<null>>(404, "존재하지 않는 게시글입니다.", {
        success: false,
        statusCode: 404,
        message: "존재하지 않는 게시글입니다.",
        data: null,
    })
    @Response<ApiResponse<null>>(403, "본인의 게시글만 수정할 수 있습니다.", {
        success: false,
        statusCode: 403,
        message: "본인의 게시글만 수정할 수 있습니다.",
        data: null,
    })
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
 * 로그인한 사용자가 본인의 게시글을 삭제합니다.
 *
 * @summary 게시글 삭제
 * @param postId 게시글 ID
 */
    @Security("jwt")
    @Delete("posts/{postId}")
    @Example<ApiResponse<null>>({
        success: true,
        statusCode: 200,
        message: "게시글 삭제 성공",
        data: null,
    })
    @Response<ApiResponse<null>>(404, "존재하지 않는 게시글입니다.", {
        success: false,
        statusCode: 404,
        message: "존재하지 않는 게시글입니다.",
        data: null,
    })
    @Response<ApiResponse<null>>(403, "본인의 게시글만 삭제할 수 있습니다.", {
        success: false,
        statusCode: 403,
        message: "본인의 게시글만 삭제할 수 있습니다.",
        data: null,
    })
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