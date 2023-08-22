import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import { db } from "@/lib/db";
import PostFeed from "./PostFeed";
import { getAuthSession } from "@/lib/auth";


const CustomFeed = async () => {
    const session = await getAuthSession()

    const followedCommunities = await db.subscription.findMany({
        where: {
            userId: session?.user.id,
        },
        include: {
            subiscuit: true,
        },
    })

    const recipes = await db.recipe.findMany({
        where: {
            subiscuit: {
                name: {
                    in: followedCommunities.map(({ subiscuit }) => subiscuit.id),
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            votes: true,
            author: true,
            comments: true,
            subiscuit: true,
        },
        take: INFINITE_SCROLL_PAGINATION_RESULTS,
    })

    return <PostFeed initialRecipes={recipes} />
}

export default CustomFeed