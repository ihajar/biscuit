'use client'

import { useCustomToasts } from '@/hooks/use-custom-toasts'
import { usePrevious } from '@mantine/hooks'
import { VoteType } from '@prisma/client'
import { FC, useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { cn } from '@/lib/utils'

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




  return (
    <div className='flex sm:flex-col gap-4 sm:gap-0 pr-6 sm:w-20 pb-4 sm:pb-0'>
        <Button 
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