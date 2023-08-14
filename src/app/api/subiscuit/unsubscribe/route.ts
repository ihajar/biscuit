import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubiscuitSubscriptionValidator } from "@/lib/validators/subiscuit";
import {z} from "zod"


export async function POST(req: Request) {
    try {
        const session = await getAuthSession()

        if(!session?.user) {
            return new Response('Unauthorized', { status: 401 })
        }
        const body = await req.json()

        const { subiscuitId } = SubiscuitSubscriptionValidator.parse(body)

        const subscriptionExists = await db.subscription.findFirst({
            where: {
                subiscuitId,
                userId: session.user.id,
            },
        })

        if(!subscriptionExists) {
            return new Response(
                'You are not subscribed to this subiscuit, yet!', 
                { 
                    status: 400,
                }
            )
        }

        // Check if user is the creator of the subiscuit
        const subiscuit = await db.subiscuit.findFirst({
            where: {
                id: subiscuitId,
                creatorId: session.user.id,
            },
        })

        if(subiscuit) {
            return new Response(
                'You cannot unsubscribe from your own subiscuit', 
                {
                    status: 400,
                }
            )
        }


        await db.subscription.delete({
            where: {
                userId_subiscuitId: {
                    subiscuitId,
                    userId: session.user.id,
                }
            }
        })

        return new Response(subiscuitId)

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
            'Could not unsubscribe, please try again later', 
            {
                status: 500
            }
        )
    }
}