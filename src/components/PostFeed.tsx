'use client'

import { ExtendedRecipe } from '@/types/db'
import { FC, useEffect, useRef } from 'react'
import { useIntersection } from '@mantine/hooks'
import { useInfiniteQuery } from '@tanstack/react-query'
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import Recipe from './Recipe'

interface PostFeedProps {
    initialRecipes: ExtendedRecipe[]
    subiscuitName?: string
}

const PostFeed: FC<PostFeedProps> = ({ initialRecipes, subiscuitName }) => {
    const lastRecipeRef = useRef<HTMLElement>(null)
    const { ref, entry } = useIntersection({
        root: lastRecipeRef.current,
        threshold: 1
    })

    const {data: session} = useSession()

    const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
        ['infinite-query'],
        async ({ pageParam = 1 }) => {
            const query = `/api/recipes?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}` + 
            (!!subiscuitName ? `&subiscuitName=${subiscuitName}` : '')

            const { data } = await axios.get(query)
            return data as ExtendedRecipe[]
        }, {
            getNextPageParam: (_, pages) => {
                return pages.length + 1
            },
            initialData: { pages: [initialRecipes], pageParams: [1] },
        }
    )

    useEffect(() => {
        if(entry?.isIntersecting) {
            fetchNextPage()
        }
    }, [entry, fetchNextPage])

    const recipes = data?.pages.flatMap((page) => page) ?? initialRecipes

  return (
    <ul className='flex flex-col col-span-2 space-y-6'>
        {recipes.map((recipe, index) => {
            const votesAmount = recipe.votes.reduce((acc, vote) => {
                if(vote.type === 'UP') return acc + 1
                if(vote.type === 'DOWN') return acc -1
                return acc
            }, 0)

            const currentVote = recipe.votes.find((vote) => vote.userId === session?.user.id)
            
            if(index === recipes.length - 1) {
                return (
                    <li key={recipe.id} ref={ref}>
                        <Recipe
                            votesAmt={votesAmount}
                            currentVote={currentVote}
                            commentAmt={recipe.comments.length} 
                            recipe={recipe} 
                            subiscuitName={recipe.subiscuit.name} 
                        />
                    </li>
                )
            } else {
                return (
                    <Recipe 
                        votesAmt={votesAmount}
                        currentVote={currentVote}
                        commentAmt={recipe.comments.length} 
                        recipe={recipe} 
                        subiscuitName={recipe.subiscuit.name} 
                    />
                )
            }
        })}
    </ul>
  )
}
export default PostFeed