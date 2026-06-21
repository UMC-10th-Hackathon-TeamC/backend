export interface CommentAddRequest {
    /** 작성자 ID
     * @example 1
     */
    userId: number;
    /** 댓글 내용
     * @example "저도 어제 물렸어요 ㅠㅠ"
     */
    content: string;
}

export interface CommentAddResponse {
    /** @example 1 */
    id: number;
    /** @example "저도 어제 물렸어요 ㅠㅠ" */
    content: string;
    /** @example "2026-06-21T09:10:00.000Z" */
    createdAt: Date;
}

export interface CommentListItem {
    /** @example 1 */
    id: number;
    /** @example "저도 어제 물렸어요 ㅠㅠ" */
    content: string;
    /** @example "홍길동" */
    author: string;
    /** @example "2026-06-21T09:10:00.000Z" */
    createdAt: Date;
    /** @example "2026-06-21T09:10:00.000Z" */
    updatedAt: Date;
}

export interface CommentListResponse {
    comments: CommentListItem[];
}

export interface CommentUpdateRequest {
    /** @example "댓글 내용을 수정했어요." */
    content: string;
}