/** 게시글 작성 요청 */
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

/** 게시글 작성 응답 */
export interface PostAddResponse {
    /** 게시글 ID */
    id: number;
    /** 제목 */
    title: string;
    /** 작성 시각 */
    createdAt: Date;
}

/** 게시글 목록 항목 */
export interface PostListItem {
    /** 게시글 ID */
    id: number;
    /** 제목 */
    title: string;
    /** 내용 */
    content: string;
    /** 카테고리 */
    category: string;
    /** 작성자 닉네임 */
    author: string;
    /** 조회수 */
    viewCount: number;
    /** 좋아요 수 */
    likeCount: number;
    /** 댓글 수 */
    commentCount: number;
    /** 작성 시각 */
    createdAt: Date;
    /** 목록 조회 요청자가 작성자 본인인지 여부 (비로그인 시 false) */
    isMine: boolean;
    /** 목록 조회 요청자가 이 게시글에 좋아요를 눌렀는지 여부 (비로그인 시 false) */
    isLiked: boolean;
}

/** 자치구 게시글 목록 응답 */
export interface PostListResponse {
    /** 최신순 게시글 목록 */
    posts: PostListItem[];
    /** 다음 페이지 조회용 커서, 더 가져올 게시글이 없으면 null */
    nextCursor: number | null;
}

/** 게시글 상세 응답 */
export interface PostDetailResponse {
    /** 게시글 ID */
    id: number;
    /** 제목 */
    title: string;
    /** 내용 */
    content: string;
    /** 카테고리 */
    category: string;
    /** 작성자 닉네임 */
    author: string;
    /** 게시글이 속한 자치구 이름 */
    districtName: string;
    /** 조회수 (이번 조회로 1 증가된 값) */
    viewCount: number;
    /** 좋아요 수 */
    likeCount: number;
    /** 댓글 수 */
    commentCount: number;
    /** 작성 시각 */
    createdAt: Date;
    /** 수정 시각 */
    updatedAt: Date;
    /** 조회 요청자가 이 게시글에 좋아요를 눌렀는지 여부 (비로그인 시 false) */
    isLiked: boolean;
}

/** 게시글 수정 요청 (전달한 필드만 수정됨) */
export interface PostUpdateRequest {
    /** 수정할 제목 */
    title?: string;
    /** 수정할 내용 */
    content?: string;
}