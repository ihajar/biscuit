import { Comment, Recipe, Subiscuit, User, Vote } from "@prisma/client";

export type ExtendedRecipe = Recipe & {
    subiscuit: Subiscuit,
    votes: Vote[],
    author: User,
    comments: Comment[]
}