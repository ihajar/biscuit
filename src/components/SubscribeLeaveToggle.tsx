"use client"

import { FC, startTransition } from 'react'
import { Button } from './ui/Button'
import { useMutation } from '@tanstack/react-query'
import { SubscribeToSubiscuitPayload } from '@/lib/validators/subiscuit'
import axios, { AxiosError } from 'axios'
import { useCustomToasts } from '@/hooks/use-custom-toasts'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface SubscribeLeaveToggleProps {
    subiscuitId: string
    subiscuitName: string
    isSubscribed: boolean
}

const SubscribeLeaveToggle: FC<SubscribeLeaveToggleProps> = ({ 
    subiscuitId,
    subiscuitName,
    isSubscribed,
}) => {
    // const isSubscribed = false
    const {loginToast} = useCustomToasts()
    const router = useRouter()

    // Join community
    const {mutate: subscribe, isLoading: isSubLoading} = useMutation({
        mutationFn: async () => {
            const payload: SubscribeToSubiscuitPayload = {
                subiscuitId,
            }
            const {data} = await axios.post('/api/subiscuit/subscribe', payload)
            return data as string
        },

        onError: (err) => {
            if(err instanceof AxiosError) {
                if(err.response?.status === 401) {
                    return loginToast()
                }
            }

            return toast({
                title: 'There was a problem!',
                description: 'Something went wrong!, please try again later.',
                variant: 'destructive',
            })
        },

        onSuccess: () => {
            startTransition(() => {
                router.refresh()
            })

            return toast({
                title: 'Subscribed 🥨',
                description: `You are now subscribed to bs/${subiscuitName}`
            })
        },
    })

    // Leave community
    const {mutate: unsubscribe, isLoading: isUnsubLoading} = useMutation({
        mutationFn: async () => {
            const payload: SubscribeToSubiscuitPayload = {
                subiscuitId,
            }
            const {data} = await axios.post('/api/subiscuit/unsubscribe', payload)
            return data as string
        },

        onError: (err: AxiosError) => {
            toast({
                title: 'Error',
                description: err.response?.data as string,
                variant: 'destructive',
            })
        },

        onSuccess: () => {
            startTransition(() => {
                router.refresh()
            })

            return toast({
                title: 'Unsubscribed 👋',
                description: `You are now unsubscribed from bs/${subiscuitName}`
            })
        },
    })

  return isSubscribed ? (
        <Button
            isLoading={isUnsubLoading}
            onClick={() => unsubscribe()}
            className='w-full mt-1 mb-4'
        >
                Leave community
        </Button>
    ) : (
        <Button
            isLoading={isSubLoading}
            onClick={() => subscribe()}
            className='w-full mt-1 mb-4'
        >
                Join community
        </Button>
    )
}

export default SubscribeLeaveToggle