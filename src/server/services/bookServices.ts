import { Prisma } from "@prisma/client";
import { prisma } from "../prisma.ts";

let books: Book[] = [];

export interface Book {
    id: number;
    title: string;
    author: string;
    publishedDate: Date;
}

export const bookServices = {
    addBook: async (title: string, author: string, totalPages: number) => {
        const newBook = await prisma.book.create({
            data: {
                title: title,
                author: author,
                totalPages: totalPages,
            },
        });
        return newBook;
    },

    updateBook: async (id: number, title: string, author: string, totalPages: number) => {
        const updatedBook = await prisma.book.update({
            where: { id },
            data: {
                title: title,
                author: author,
                totalPages: totalPages,
            },
        });
        return updatedBook;
    },

    deleteBook: async (id: number) => {
        await prisma.book.delete({
            where: { id: id },
        });
    },
};