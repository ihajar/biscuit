import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { redis } from "@/lib/redis"
import { RecipeVoteValidator } from "@/lib/validators/vote"
import type { CachedRecipe } from "@/types/redis"
import { z } from "zod"


const CACHE_AFTER_UPVOTES = 1

export async function PATCH(req: Request) {
    try {
        const body = await req.json()

        const { recipeId, voteType } = RecipeVoteValidator.parse(body)
        
        const session = await getAuthSession()

        if(!session?.user) {
            return new Response('Unauthorized', { status: 401 })
        }

        const existingVote = await db.vote.findFirst({
            where: {
                userId: session.user.id,
                recipeId,
            }
        })
        
        const recipe = await db.recipe.findUnique({
            where: {
                id: recipeId
            },
            include: {
                author: true,
                votes: true,
            },
        })

        if(!recipe) {
            return new Response('Recipe not found', { status: 404 })
        }

        if(existingVote) {
            if(existingVote.type === voteType) {
                await db.vote.delete({
                    where: {
                        userId_recipeId: {
                            recipeId,
                            userId: session.user.id,
                        },
                    },
                })
                return new Response('OK')
            }

            await db.vote.update({
                where: {
                    userId_recipeId: {
                        recipeId,
                        userId: session.user.id,
                    },
                },
                data: {
                    type: voteType,
                },
            })

            // recounting the votes if it's above the threshold so we gonna cache the vote
            const votesAmt = recipe.votes.reduce((acc, vote) => {
                if(vote.type === 'UP') return acc + 1
                if(vote.type === 'DOWN') return acc - 1
                return acc
            }, 0)

            if(votesAmt >= CACHE_AFTER_UPVOTES) {
                const cachePayload: CachedRecipe = {
                    authorUsername: recipe.author.username ?? '',
                    content: JSON.stringify(recipe.directions),
                    id: recipe.id,
                    title: recipe.id,
                    currentVote: voteType,
                    createdAt: recipe.createdAt,
                }

                await redis.hset(`recipe:${recipeId}`, cachePayload)
            }
            return new Response('OK')
        }

        await db.vote.create({
            data: {
                type: voteType,
                userId: session.user.id,
                recipeId,
            },
        })
        const votesAmt = recipe.votes.reduce((acc, vote) => {
            if(vote.type === 'UP') return acc + 1
            if(vote.type === 'DOWN') return acc - 1
            return acc
        }, 0)

        if(votesAmt >= CACHE_AFTER_UPVOTES) {
            const cachePayload: CachedRecipe = {
                authorUsername: recipe.author.username ?? '',
                content: JSON.stringify(recipe.directions),
                id: recipe.id,
                title: recipe.id,
                currentVote: voteType,
                createdAt: recipe.createdAt,
            }

            await redis.hset(`recipe:${recipeId}`, cachePayload)
        }

        return new Response('OK')

    } catch (error) {
        if(error instanceof z.ZodError) {
            return new Response('Invalid Redis Request ', { status: 422 })
        }

        return new Response(
            'Could not register your vote, please try again!', { status: 500 }
        )
    }
}