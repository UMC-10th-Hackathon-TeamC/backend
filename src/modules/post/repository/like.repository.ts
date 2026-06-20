import { prisma } from "../../../db.config.js";

export const findLike = async (postId: number, userId: number) => {
    return await prisma.like.findUnique({
        where: {
            postId_userId: { postId, userId },
        },
    });
};

export const createLike = async (postId: number, userId: number) => {
    return await prisma.like.create({
        data: { postId, userId },
    });
};

export const deleteLike = async (postId: number, userId: number) => {
    return await prisma.like.delete({
        where: {
            postId_userId: { postId, userId },
        },
    });
};

export const countLikes = async (postId: number) => {
    return await prisma.like.count({
        where: { postId },
    });
};

export const findPostById = async (postId: number) => {
    return await prisma.post.findUnique({
        where: { id: postId },
    });
};