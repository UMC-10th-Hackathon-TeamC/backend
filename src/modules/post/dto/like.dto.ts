export interface LikeResponse {
    likeCount: number;
    /** 요청자가 현재 이 게시글에 좋아요를 누른 상태인지 여부 */
    isLiked: boolean;
}