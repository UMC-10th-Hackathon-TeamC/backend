export interface CommentAddRequest {
    /** 작성자 ID */
    userId: number;
    /** 댓글 내용 */
    content: string;
}

export interface CommentAddResponse {
    id: number;
    content: string;
    createdAt: Date;
}

export interface CommentListItem {
    id: number;
    content: string;
    author: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CommentListResponse {
    comments: CommentListItem[];
}

export interface CommentUpdateRequest {
    content: string;
}