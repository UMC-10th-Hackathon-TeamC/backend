import { Body, Controller, Delete, Get, Patch, Path, Post, Route, Security, Request } from "tsoa";
import { Request as ExpressRequest } from "express"; // Request 주입을 위해 추가
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
import { getUserIdFromRequest } from '../../../auth.config'; // 어제 만든 유틸 함수

@Route("posts") // 경로 통일성을 위해 "posts"로 설정
export class CommentController extends Controller {

    @Security("jwt") // 인증 추가
    @Post("{postId}/comments")
    public async handleAddComment(
        @Request() req: ExpressRequest, // Express Request 주입
        @Path() postId: number,
        @Body() body: CommentAddRequest,
    ): Promise<ApiResponse<CommentAddResponse>> {
        try {
            const userId = getUserIdFromRequest(req); // 인증된 유저 ID 추출
            const comment = await commentAdd(postId, userId, body); // 서비스에서 userId 사용
            this.setStatus(StatusCodes.CREATED);
            return successResponse(StatusCodes.CREATED, "댓글 작성 성공", comment);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, (err as Error).message || "서버 내부 오류");
        }
    }

    @Get("{postId}/comments")
    public async handleGetComments(
        @Path() postId: number,
    ): Promise<ApiResponse<CommentListResponse>> {
        // 이 부분은 비로그인 허용 가능
        try {
            const comments = await commentList(postId);
            return successResponse(StatusCodes.OK, "댓글 목록 조회 성공", comments);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, (err as Error).message || "서버 내부 오류");
        }
    }

    @Security("jwt") // 인증 추가
    @Patch("{postId}/comments/{commentId}")
    public async handleUpdateComment(
        @Request() req: ExpressRequest,
        @Path() postId: number,
        @Path() commentId: number,
        @Body() body: CommentUpdateRequest,
    ): Promise<ApiResponse<null>> {
        try {
            const userId = getUserIdFromRequest(req);
            await commentUpdate(userId, commentId, body); // 서비스에서 본인 확인 로직 수행
            return successResponse(StatusCodes.OK, "댓글 수정 성공", null);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, (err as Error).message || "서버 내부 오류");
        }
    }

    @Security("jwt") // 인증 추가
    @Delete("{postId}/comments/{commentId}")
    public async handleDeleteComment(
        @Request() req: ExpressRequest,
        @Path() postId: number,
        @Path() commentId: number,
    ): Promise<ApiResponse<null>> {
        try {
            const userId = getUserIdFromRequest(req);
            await commentDelete(userId, commentId); // 서비스에서 본인 확인 로직 수행
            return successResponse(StatusCodes.OK, "댓글 삭제 성공", null);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, (err as Error).message || "서버 내부 오류");
        }
    }
}