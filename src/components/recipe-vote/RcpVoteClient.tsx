'use client'

import { useCustomToasts } from '@/hooks/use-custom-toasts'
import { usePrevious } from '@mantine/hooks'
import { VoteType } from '@prisma/client'
import { FC, useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { RecipeVoteRequest } from '@/lib/validators/vote'
import axios, { AxiosError } from 'axios'
import { toast } from '@/hooks/use-toast'



interface RcpVoteClientProps {
    recipeId: string
    initialVotesAmt: number
    initialVote?: VoteType | null
}

const RcpVoteClient: FC<RcpVoteClientProps> = ({
    recipeId,
    initialVotesAmt,
    initialVote,
}) => {
    const { loginToast } = useCustomToasts()
    const [votesAmt, setVotesAmt] = useState<number>(initialVotesAmt)
    const [currentVote, setCurrentVote] = useState(initialVote)
    const preVote = usePrevious(currentVote)

    useEffect(() => {
        setCurrentVote(initialVote)
    }, [initialVote])

    const { mutate: vote } = useMutation({
        mutationFn: async (voteType: VoteType) => {
            const payload : RecipeVoteRequest = {
                recipeId,
                voteType,
            }

            await axios.patch('/api/subiscuit/recipe/vote', payload)
        },

        onError: (err, voteType) => {
            if(voteType === 'UP') setVotesAmt((prev) => prev - 1)
            else setVotesAmt((prev) => prev + 1)

            // reset current vote
            setCurrentVote(preVote)

            if(err instanceof AxiosError) {
                if(err.response?.status === 401) {
                    return loginToast()
                }
            }

            return toast({
                title: 'Something went wrong!',
                description: 'Your vote was not registered, please try again.',
                variant: 'destructive',
            })
        },
        onMutate: (type: VoteType) => {
            if(currentVote === type) {
                setCurrentVote(undefined)
                if(type === 'UP') setVotesAmt((prev) => prev - 1)
                else if(type === 'DOWN') setVotesAmt((prev) => prev + 1)
            } else {
                setCurrentVote(type)
                if(type === 'UP') setVotesAmt((prev) => prev + (currentVote ? 2 : 1))
                else if(type === 'DOWN') setVotesAmt((prev) => prev - (currentVote ? 2 : 1))
            }
        }
    })


  return (
    <div className='flex sm:flex-col gap-4 sm:gap-0 pr-6 sm:w-20 pb-4 sm:pb-0'>
        <Button 
            onClick={() => vote('UP')}
            size='sm' aria-label='like'
            variant='ghost'
        >
            <ThumbsUp className={cn('h-5 w-5 text-slate-700', {
                'text-[#0E9594] fill-[#0E9594]': currentVote === 'UP',
            })} />
        </Button>

        <p className='text-center py-2 font-medium text-sm text-slate-900'>
            {votesAmt}
        </p>
        <Button
            onClick={() => vote('DOWN')} 
            size='sm' aria-label='dislike'
            variant='ghost'
        >
            <ThumbsDown className={cn('h-5 w-5 text-slate-700', {
                'text-[#E63946] fill-[#E63946]': currentVote === 'DOWN',
            })} />
        </Button>
    </div>
    )
}

export default RcpVoteClient