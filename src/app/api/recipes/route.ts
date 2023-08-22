import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { parse } from "path"
import { z } from "zod"


export async function GET(req: Request) {
    const url = new URL(req.url)

    const session = await getAuthSession()

    let followedCommunitiesIds: string[] = []

    if(session) {
        const followedCommunities = await db.subscription.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                subiscuit: true,
            },
        })

        followedCommunitiesIds = followedCommunities.map(
            ({ subiscuit }) => subiscuit.id
        )
    }

    try {
        const { limit, page, subiscuitName } = z.object({
            limit: z.string(),
            page: z.string(),
            subiscuitName: z.string().nullish().optional(),
        }).parse({
            subiscuitName: url.searchParams.get('subiscuitName'),
            limit: url.searchParams.get('limit'),
            page: url.searchParams.get('page'),
        })

        let whereClause = {}

        if(subiscuitName) {
            whereClause= {
                subiscuit: {
                    name: subiscuitName,
                },
            }
        } else if (session) {
            whereClause= {
                subiscuit: {
                    id: {
                        in: followedCommunitiesIds,
                    },
                },
            }
        }

        const recipes = await db.recipe.findMany({
            take: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit),
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                subiscuit: true,
                votes: true,
                author:  true,
                comments: true,
            },
            where: whereClause,
        })

        return new Response(JSON.stringify(recipes))

    } catch (error) {
        if(error instanceof z.ZodError) {
            return new Response(
                'Invalid request data passed', 
                {
                    status: 422
                }
            )
        }

        return new Response(
            'Could not fetch more recipes, please try again later', 
            {
                status: 500
            }
        )
    }
}