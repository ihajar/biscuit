import { FC, useRef } from 'react'
import { ChefHatIcon, MessageSquare } from "lucide-react"
import { Recipe, User, Vote } from '@prisma/client'
import { formatTimeToNow } from '@/lib/utils'
import EditorOutput from './EditorOutput'
import RcpVoteClient from './recipe-vote/RcpVoteClient'


type PartialVote = Pick<Vote, 'type'>

interface RecipeProps {
  subiscuitName: string
  recipe: Recipe & {
    author: User,
    votes: Vote[]
  }
  commentAmt: number
  votesAmt: number
  currentVote?: PartialVote
}

const Recipe: FC<RecipeProps> = ({ 
  subiscuitName, 
  recipe, 
  commentAmt,
  votesAmt,
  currentVote,
}) => {

  const pRef = useRef<HTMLDivElement>(null)

  return (
    <div className='rounded-md bg-white shadow'>
      <div className='px-6 py-4 flex justify-between'>
        <RcpVoteClient
          recipeId={recipe.id}
          initialVotesAmt={votesAmt}
          initialVote={currentVote?.type}
          
        />
        <div className='w-0 flex-1'>
          <div className='max-h-40 ml-1 text-xs text-slate-500 flex flex-row w-full justify-start'>
            {subiscuitName ? (
              <>
                <a 
                  href={`/bs/${subiscuitName}`} 
                  className='underline text-slate-900 text-sm underline-offset-2 flex flex-row justify-start '
                >
                  <ChefHatIcon className="w-4 h-4 " />{subiscuitName}
                </a>
                <span className='px-1'>•</span>
              </>
            ) : null}
            <span>Created by u/{recipe.author.name}</span>{'   '}
            {formatTimeToNow(new Date(recipe.createdAt))}
          </div>
          <a href={`/bs/${subiscuitName}/recipe/${recipe.id}`}>
            <h1 className='text-lg font-semibold py-2 leading-6 text-slate-900'>
              {recipe.title}
            </h1>
          </a>

          <div className='relative text-sm max-h-40 w-full  overflow-clip' ref={pRef}>
            {/* Recipe content */}

            <EditorOutput content={recipe.directions} />

            {pRef.current?.clientHeight === 160 ? (
              <div className='absolute bottom-0 left-0 h-24 w-full bg-transparent' />
            ) : null}
          </div>
        </div>
      </div>
      
      <div className='bg-white z-20 text-sm p-4 sm:px-6'>
        <a 
          href={`/bs/${subiscuitName}/recipe/${recipe.id}`}
          className='w-fit flex items-center gap-2'
        >
          <MessageSquare className='h-4 w-4' />{commentAmt} comments
        </a>
      </div>
    </div>
  )
}

export default Recipe