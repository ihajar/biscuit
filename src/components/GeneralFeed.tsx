import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import { db } from "@/lib/db";
import PostFeed from "./PostFeed";


const GeneralFeed = async () => {
    const recipes = await db.recipe.findMany({
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

export default GeneralFeed