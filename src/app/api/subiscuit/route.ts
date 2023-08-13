import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubiscuitValidator } from "@/lib/validators/subiscuit";
import {z} from "zod"

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()

        if (!session?.user) {
            return new Response('Unauthorized', {status: 401})
        }

        const body = await req.json()
        const {name} = SubiscuitValidator.parse(body)

        const subiscuitExists = await db.subiscuit.findFirst({
            where: {
                name,
            },
        })

        if(subiscuitExists) {
            return new Response('Subiscuit already exists', {status: 409})
        }

        const subiscuit = await db.subiscuit.create({
            data: {
                name,
                creatorId: session.user.id,
            },
        })
        
        await db.subscription.create({
            data: {
                userId: session.user.id,
                subiscuitId: subiscuit.id,
            },
        })

        return new Response(subiscuit.name)
    } catch (error) {
        if(error instanceof z.ZodError) {
            return new Response(error.message, {status: 422})
        }

        return new Response('Could not create subiscuit', {status: 500})
    }
}