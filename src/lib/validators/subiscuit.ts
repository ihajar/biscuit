import {z} from "zod"

export const SubiscuitValidator = z.object({
    name: z.string().min(3).max(21),
})

export const SubiscuitSubscriptionValidator = z.object({
    subiscuitId: z.string(),
})

export type CreateSubiscuitPayload = z.infer<typeof SubiscuitValidator>
export type SubscribeToSubiscuitPayload = z.infer<typeof SubiscuitSubscriptionValidator>