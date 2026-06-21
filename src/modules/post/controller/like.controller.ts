import { Body, Controller, Delete, Path, Post, Queries, Route, Tags } from "tsoa";
import { LikeAddRequest, LikeResponse } from "../dto/like.dto.js";
import { likeAdd, likeCancel } from "../service/like.service.js";
import { AppError } from "../../../common/errors/app.error.js";
import { ApiResponse, successResponse } from "../../../common/responses/response.js";
import { StatusCodes } from "http-status-codes";

interface LikeCancelQuery {
    /** 사용자 ID */
    userId: number;
}

@Route("")
@Tags("Like")
export class LikeController extends Controller {
/**
 * 특정 게시글에 좋아요를 추가합니다.
 *
 * @summary 게시글 좋아요
 * @param postId 게시글 ID
 */
    @Post("posts/{postId}/likes")
    public async handleAddLike(
        @Path() postId: number,
        @Body() body: LikeAddRequest,
    ): Promise<ApiResponse<LikeResponse>> {
        try {
            const result = await likeAdd(postId, body);
            return successResponse(StatusCodes.OK, "좋아요 성공", result);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, (err as Error).message || "서버 내부 오류");
        }
    }

/**
 * 특정 게시글의 좋아요를 취소합니다.
 *
 * @summary 게시글 좋아요 취소
 * @param postId 게시글 ID
 */
    @Delete("posts/{postId}/likes")
    public async handleDeleteLike(
        @Path() postId: number,
        @Queries() query: LikeCancelQuery,
    ): Promise<ApiResponse<LikeResponse>> {
        try {
            const result = await likeCancel(postId, query.userId);
            return successResponse(StatusCodes.OK, "좋아요 취소 성공", result);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, (err as Error).message || "서버 내부 오류");
        }
    }
}