export interface PostAddRequest {

    /** 자치구 ID
     * @example 1
     */
    districtId: number;
    /** 카테고리
     * @example "잡담"
     */
    category: string;
    /** 제목
     * @example "강남구 모기 너무 심해요"
     */
    title: string;
    /** 내용
     * @example "퇴근길에 모기한테 3방 물렸어요..."
     */
    content: string;
}

export interface PostAddResponse {
    /** @example 1 */
    id: number;
    /** @example "강남구 모기 너무 심해요" */
    title: string;
    /** @example "2026-06-21T09:00:00.000Z" */
    createdAt: Date;
}

export interface PostListItem {
    /** @example 1 */
    id: number;
    /** @example "강남구 모기 너무 심해요" */
    title: string;
    /** @example "퇴근길에 모기한테 3방 물렸어요..." */
    content: string;
    /** @example "잡담" */
    category: string;
    /** @example "홍길동" */
    author: string;
    /** @example 12 */
    viewCount: number;
    /** @example 3 */
    likeCount: number;
    /** @example 2 */
    commentCount: number;
    /** @example "2026-06-21T09:00:00.000Z" */
    createdAt: Date;
    /** 목록 조회 요청자가 작성자 본인인지 여부 (비로그인 시 false)
     * @example false
     */
    isMine: boolean;
    /** 목록 조회 요청자가 이 게시글에 좋아요를 눌렀는지 여부 (비로그인 시 false)
     * @example true
     */
    isLiked: boolean;
}

export interface PostListResponse {
    posts: PostListItem[];
    /** @example 1 */
    nextCursor: number | null;
}

export interface PostDetailResponse {
    /** @example 1 */
    id: number;
    /** @example "강남구 모기 너무 심해요" */
    title: string;
    /** @example "퇴근길에 모기한테 3방 물렸어요..." */
    content: string;
    /** @example "잡담" */
    category: string;
    /** @example "홍길동" */
    author: string;
    /** @example "강남구" */
    districtName: string;
    /** @example 13 */
    viewCount: number;
    /** @example 3 */
    likeCount: number;
    /** @example 2 */
    commentCount: number;
    /** @example "2026-06-21T09:00:00.000Z" */
    createdAt: Date;
    /** @example "2026-06-21T09:00:00.000Z" */
    updatedAt: Date;
    /** 조회 요청자가 이 게시글에 좋아요를 눌렀는지 여부 (비로그인 시 false)
     * @example true
     */
    isLiked: boolean;
}

export interface PostUpdateRequest {
    /** @example "강남구 모기 진짜 너무 심해요 (수정)" */
    title?: string;
    /** @example "내용을 조금 더 자세히 수정했어요." */
    content?: string;
}