import {z} from "zod"


export const RecipeValidator = z.object({
    title: z
        .string()
        .min(3, {message: 'Title must be longer than 3 characters'})
        .max(128, {message: 'Title must be at least 128 characters'}),
    subiscuitId: z.string(),
    directions: z.any(),
})

export type RecipeCreationRequest = z.infer<typeof RecipeValidator>