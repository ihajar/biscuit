import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

import { RecipeValidator } from "@/lib/validators/recipe";
import {z} from "zod"


export async function POST(req: Request) {
    try {
        const session = await getAuthSession()

        if(!session?.user) {
            return new Response('Unauthorized', { status: 401 })
        }
        const body = await req.json()

        const {subiscuitId, title, directions} = RecipeValidator.parse(body)

        const subscriptionExists = await db.subscription.findFirst({
            where: {
                subiscuitId,
                userId: session.user.id,
            },
        })

        if(!subscriptionExists) {
            return new Response('Subscribe to craete a recipe', { 
                status: 400
            })
        }

        await db.recipe.create({
            data: {
                title, 
                subiscuitId,
                authorId: session.user.id,
                directions,
            },
        })

        return new Response(subiscuitId)

    } catch (error) {
        if(error instanceof z.ZodError) {
            return new Response(
                'Invalid request data passed', 
                {status: 422}
            )
        }

        return new Response(
            'Could not create a recipe at this time, please try again later', 
            {status: 500}
        )
    }
}