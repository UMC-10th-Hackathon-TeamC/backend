/** 댓글 작성 요청 */
export interface CommentAddRequest {
    /** 작성자 ID */
    userId: number;
    /** 댓글 내용 */
    content: string;
}

/** 댓글 작성 응답 */
export interface CommentAddResponse {
    /** 댓글 ID */
    id: number;
    /** 댓글 내용 */
    content: string;
    /** 작성 시각 */
    createdAt: Date;
}

/** 댓글 목록 항목 */
export interface CommentListItem {
    /** 댓글 ID */
    id: number;
    /** 댓글 내용 */
    content: string;
    /** 작성자 닉네임 */
    author: string;
    /** 작성 시각 */
    createdAt: Date;
    /** 수정 시각 */
    updatedAt: Date;
}

/** 게시글 댓글 목록 응답 */
export interface CommentListResponse {
    /** 작성일 오래된 순 댓글 목록 */
    comments: CommentListItem[];
}

/** 댓글 수정 요청 */
export interface CommentUpdateRequest {
    /** 수정할 댓글 내용 */
    content: string;
}