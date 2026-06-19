import { prisma } from "../../../db.config.js";

export const createComment = async (data: {
    postId: number;
    userId: number;
    content: string;
}) => {
    return await prisma.comment.create({
        data,
    });
};

export const findCommentsByPostId = async (postId: number) => {
    return await prisma.comment.findMany({
        where: { postId },
        include: {
            user: { select: { nickname: true } },
        },
        orderBy: { createdAt: "asc" },
    });
};

export const findCommentById = async (commentId: number) => {
    return await prisma.comment.findUnique({
        where: { id: commentId },
    });
};

export const updateComment = async (commentId: number, content: string) => {
    return await prisma.comment.update({
        where: { id: commentId },
        data: { content },
    });
};

export const deleteComment = async (commentId: number) => {
    return await prisma.comment.delete({
        where: { id: commentId },
    });
};

export const findPostById = async (postId: number) => {
    return await prisma.post.findUnique({
        where: { id: postId },
    });
};