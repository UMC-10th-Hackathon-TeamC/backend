export interface PostAddRequest {
    
    /** 자치구 ID */
    districtId: number;
    /** 카테고리 */
    category: string;
    /** 제목 */
    title: string;
    /** 내용 */
    content: string;
}

export interface PostAddResponse {
    id: number;
    title: string;
    createdAt: Date;
}

export interface PostListItem {
    id: number;
    title: string;
    content: string;
    category: string;
    author: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    createdAt: Date;
    /** 목록 조회 요청자가 작성자 본인인지 여부 (비로그인 시 false) */
    isMine: boolean;
    /** 목록 조회 요청자가 이 게시글에 좋아요를 눌렀는지 여부 (비로그인 시 false) */
    isLiked: boolean;
}

export interface PostListResponse {
    posts: PostListItem[];
    nextCursor: number | null;
}

export interface PostDetailResponse {
    id: number;
    title: string;
    content: string;
    category: string;
    author: string;
    districtName: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    createdAt: Date;
    updatedAt: Date;
    /** 조회 요청자가 이 게시글에 좋아요를 눌렀는지 여부 (비로그인 시 false) */
    isLiked: boolean;
}

export interface PostUpdateRequest {
    title?: string;
    content?: string;
}