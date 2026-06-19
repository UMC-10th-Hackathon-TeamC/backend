export interface LikeAddRequest {
    /** 좋아요 누른 사용자 ID */
    userId: number;
}

export interface LikeResponse {
    likeCount: number;
}