import { Body, Controller, Delete, Path, Post, Queries, Route } from "tsoa";
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
export class LikeController extends Controller {
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