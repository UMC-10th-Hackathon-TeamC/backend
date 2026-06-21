import { Controller, Delete, Path, Post, Request, Route, Security, Tags } from "tsoa";
import { Request as ExpressRequest } from "express";
import { LikeResponse } from "../dto/like.dto.js";
import { likeAdd, likeCancel } from "../service/like.service.js";
import { AppError } from "../../../common/errors/app.error.js";
import { ApiResponse, successResponse } from "../../../common/responses/response.js";
import { StatusCodes } from "http-status-codes";
import { getUserIdFromRequest } from "../../../auth.config.js";

@Route("")
@Tags("Like")
export class LikeController extends Controller {
/**
 * 로그인한 사용자가 특정 게시글에 좋아요를 추가합니다.
 *
 * @summary 게시글 좋아요
 * @param postId 게시글 ID
 */
    @Security("jwt")
    @Post("posts/{postId}/likes")
    public async handleAddLike(
        @Request() req: ExpressRequest,
        @Path() postId: number,
    ): Promise<ApiResponse<LikeResponse>> {
        try {
            const userId = getUserIdFromRequest(req);
            const result = await likeAdd(postId, userId);
            return successResponse(StatusCodes.OK, "좋아요 성공", result);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, (err as Error).message || "서버 내부 오류");
        }
    }

/**
 * 로그인한 사용자가 특정 게시글의 좋아요를 취소합니다.
 *
 * @summary 게시글 좋아요 취소
 * @param postId 게시글 ID
 */
    @Security("jwt")
    @Delete("posts/{postId}/likes")
    public async handleDeleteLike(
        @Request() req: ExpressRequest,
        @Path() postId: number,
    ): Promise<ApiResponse<LikeResponse>> {
        try {
            const userId = getUserIdFromRequest(req);
            const result = await likeCancel(postId, userId);
            return successResponse(StatusCodes.OK, "좋아요 취소 성공", result);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, (err as Error).message || "서버 내부 오류");
        }
    }
}