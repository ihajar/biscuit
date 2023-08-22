import {z} from 'zod'

export const RecipeVoteValidator = z.object({
    recipeId: z.string(),
    voteType: z.enum(['UP', 'DOWN']),
})

export type RecipeVoteRequest = z.infer<typeof RecipeVoteValidator>

export const CommentVoteValidator = z.object({
    commentId: z.string(),
    voteType: z.enum(['UP', 'DOWN']),
})

export type CommentVoteRequest = z.infer<typeof CommentVoteValidator>