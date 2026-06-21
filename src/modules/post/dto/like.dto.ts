/** 좋아요 추가/취소 응답 */
export interface LikeResponse {
    /** 처리 후 해당 게시글의 총 좋아요 수 */
    likeCount: number;
    /** 요청자가 현재 이 게시글에 좋아요를 누른 상태인지 여부 */
    isLiked: boolean;
}