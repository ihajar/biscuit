
import MiniCreatePost from '@/components/MiniCreatePost'
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ChefHatIcon } from "lucide-react"

import PostFeed from '@/components/PostFeed'

interface PageProps {
    params: {
        slug: string
    }
}

const page = async ({ params }: PageProps) => {
    const { slug } = params

    const session = await getAuthSession()

    const subiscuit = await db.subiscuit.findFirst({
        where: { name: slug },
        include: {
            recipes: {
                include: {
                    author: true,
                    votes: true,
                    comments: true,
                    subiscuit: true,
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: INFINITE_SCROLL_PAGINATION_RESULTS,
            },
        },
    })

    if(!subiscuit) return notFound()


  return (
    <>
        <h1 className='font-bold text-3xl md:text-4xl h-14'>
            <span className="flex justify-start items-center px-3 max-w-sm gap-x-2">
                <ChefHatIcon className="w-8 h-8 sm:w-4 sm:h-4 " /> {subiscuit.name}
            </span>
            
        </h1>
        <MiniCreatePost session={session} />
        <PostFeed initialRecipes={subiscuit.recipes} subiscuitName={subiscuit.name} />
    </>  
  )
}

export default page
