import { Body, Controller, Delete, Get, Patch, Path, Post, Route } from "tsoa";
import {
    CommentAddRequest,
    CommentAddResponse,
    CommentListResponse,
    CommentUpdateRequest,
} from "../dto/comment.dto.js";
import { commentAdd, commentList, commentUpdate, commentDelete } from "../service/comment.service.js";
import { AppError } from "../../../common/errors/app.error.js";
import { ApiResponse, successResponse } from "../../../common/responses/response.js";
import { StatusCodes } from "http-status-codes";

@Route("")
export class CommentController extends Controller {
    @Post("posts/{postId}/comments")
    public async handleAddComment(
        @Path() postId: number,
        @Body() body: CommentAddRequest,
    ): Promise<ApiResponse<CommentAddResponse>> {
        try {
            const comment = await commentAdd(postId, body);
            this.setStatus(StatusCodes.CREATED);
            return successResponse(StatusCodes.CREATED, "댓글 작성 성공", comment);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, (err as Error).message || "서버 내부 오류");
        }
    }

    @Get("posts/{postId}/comments")
    public async handleGetComments(
        @Path() postId: number,
    ): Promise<ApiResponse<CommentListResponse>> {
        try {
            const comments = await commentList(postId);
            return successResponse(StatusCodes.OK, "댓글 목록 조회 성공", comments);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, (err as Error).message || "서버 내부 오류");
        }
    }

    @Patch("comments/{commentId}")
    public async handleUpdateComment(
        @Path() commentId: number,
        @Body() body: CommentUpdateRequest,
    ): Promise<ApiResponse<null>> {
        try {
            await commentUpdate(commentId, body);
            return successResponse(StatusCodes.OK, "댓글 수정 성공", null);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, (err as Error).message || "서버 내부 오류");
        }
    }

    @Delete("comments/{commentId}")
    public async handleDeleteComment(
        @Path() commentId: number,
    ): Promise<ApiResponse<null>> {
        try {
            await commentDelete(commentId);
            return successResponse(StatusCodes.OK, "댓글 삭제 성공", null);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, (err as Error).message || "서버 내부 오류");
        }
    }
}