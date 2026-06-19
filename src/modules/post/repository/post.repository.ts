import { prisma } from "../../../db.config.js";

export const createPost = async (data: {
    userId: number;
    districtId: number;
    category: string;
    title: string;
    content: string;
}) => {
    return await prisma.post.create({
        data,
    });
};

export const findPostsByDistrict = async (districtId: number, cursor?: number, limit = 10) => {
    return await prisma.post.findMany({
        where: { districtId },
        include: {
            user: { select: { nickname: true } },
            comments: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: cursor ? 1 : 0,
        ...(cursor ? { cursor: { id: cursor } } : {}),
    });
};

export const findPostById = async (postId: number) => {
    return await prisma.post.findUnique({
        where: { id: postId },
        include: {
            user: { select: { nickname: true } },
            district: { select: { name: true } },
            comments: { select: { id: true } },
        },
    });
};

export const increaseViewCount = async (postId: number) => {
    return await prisma.post.update({
        where: { id: postId },
        data: { viewCount: { increment: 1 } },
    });
};

export const updatePost = async (postId: number, data: { title?: string; content?: string }) => {
    return await prisma.post.update({
        where: { id: postId },
        data,
    });
};

export const deletePost = async (postId: number) => {
    return await prisma.post.delete({
        where: { id: postId },
    });
};