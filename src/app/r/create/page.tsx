"use client"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {useMutation} from '@tanstack/react-query'
import axios, { AxiosError } from "axios"
import { CreateSubiscuitPayload } from "@/lib/validators/subiscuit"
import { ChefHatIcon } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useCustomToast } from "@/hooks/use-custom-toast"


const Page = () => {
    const [input, setInput] = useState<string>('')
    const router = useRouter()
    const {loginToast} = useCustomToast()

    const {mutate: createCommunity, isLoading} = useMutation({
        mutationFn: async () => {
            const payload: CreateSubiscuitPayload = {
                name: input,
            }
            const {data} =  await axios.post('/api/subiscuit', payload)
            return data as string
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 409) {
                    return toast({
                        title: 'Subiscuit already exists!',
                        description: 'Please choose a different subiscuit name.',
                        variant: 'destructive',
                    })
                }
                if (err.response?.status === 422) {
                    return toast({
                        title: 'invalid subiscuit name!',
                        description: 'Please choose a name between 3 and 22 characters.',
                        variant: 'destructive',
                    })
                }
                if (err.response?.status === 401) {
                    return loginToast()
                }
            }

            toast({
                title: 'There was an error!',
                description: 'could not create a subiscuit.',
                variant: 'destructive',
            })
        },
        onSuccess: (data) => {
            router.push(`/r/${data}`)
        },
    }) 

    return (
        <div className="container flex items-center h-full max-w-3xl mx-auto">
            <div className="relative bg-white w-full h-fit p-4 rounded-lg space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-semibold"> Create a Community</h1>
                </div>

                <hr className="bg-[#0E9594] h-px" />

                <div>
                    <p className="text-lg font-medium">Name</p>
                    <p className="text-xs pb-2 text-[#030B12]">Community names including capitalization cannot be changed</p>

                    <div className="relative">
                        <p className="absolute text-sm left-0 w-8 inset-y-0 grid place-items-center text-slate-400">
                            <ChefHatIcon className="w-3 h-3" />
                        </p>
                        <Input 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)}
                            className="pl-6" 
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant='subtle' onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button 
                        isLoading={isLoading} 
                        disabled={input.length===0}
                        onClick={() => createCommunity()}
                    >
                        Create Community
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Page