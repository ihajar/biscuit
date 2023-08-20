"use client"

import { FC, useCallback, useEffect, useRef, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { useForm } from 'react-hook-form'
import { RecipeCreationRequest, RecipeValidator } from '@/lib/validators/recipe'
import { zodResolver } from '@hookform/resolvers/zod'
import type EditorJS from '@editorjs/editorjs'
import { uploadFiles } from '@/lib/uploadthing'
import { toast } from '@/hooks/use-toast'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { usePathname, useRouter } from 'next/navigation'

import '@/styles/editor.css'
import { z } from 'zod'

type FormData = z.infer<typeof RecipeValidator>

interface EditorProps {
    subiscuitId:  string
}
const Editor: React.FC<EditorProps> = ({ subiscuitId }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(RecipeValidator),
        defaultValues: {
            subiscuitId,
            title: '',
            directions: null,
        },
    })

    const ref = useRef<EditorJS>()
    const _titleRef = useRef<HTMLTextAreaElement>(null)
    const [isMounted, setIsMounted] = useState<boolean>(false)
    const pathname = usePathname()
    const router = useRouter()

    const { mutate: createRecipe } = useMutation({
        mutationFn: async ({
            title, 
            directions, 
            subiscuitId,
            
        }: RecipeCreationRequest) => {
            const payload: RecipeCreationRequest ={
                subiscuitId,
                title,
                directions,
            }
            const {data} = await axios.post('/api/subiscuit/recipe/create', payload)
            return data
        },
        onError: () => {
            return toast({
                title: 'Something went wrong',
                description: 'Your recipe was not published, please try again later.',
                variant: 'destructive',
            })
        },
        onSuccess: () => {
            // turn pathname bs/mycommunity/submit inot bs/mycommunity
            const newPathname = pathname.split('/').slice(0, -1).join('/')
            router.push(newPathname)
            router.refresh()
    
            return toast({
                description: 'Your recipe has been published successfuly! 🎉',
            })
        }
       })
      

    const initializeEditor = useCallback(async () => {
        const EditorJS = (await import('@editorjs/editorjs')).default
        const Header = (await import('@editorjs/header')).default
        const Embed = (await import('@editorjs/embed')).default
        const Table = (await import('@editorjs/table')).default
        const List = (await import('@editorjs/list')).default
        // const Code = (await import('@editorjs/code')).default
        const LinkTool = (await import('@editorjs/link')).default
        const InlineCode = (await import('@editorjs/inline-code')).default
        const ImageTool = (await import('@editorjs/image')).default
        const CheckList = (await import('@editorjs/checklist')).default


        if(!ref.current) {
            const editor = new EditorJS({
                holder: 'editor',
                onReady() {
                    ref.current = editor
                },
                placeholder: 'Type here to write your recipe...',
                inlineToolbar: true,
                data: { blocks: []},
                tools: {
                    header: Header,
                    linkTool: {
                        class: LinkTool,
                        config: {
                            endpoint: '/api/link',
                        },
                    },
                    image: {
                        class: ImageTool,
                        config: {
                            uploader: {
                                async uploadByFile(file: File) {
                                    const [res] = await uploadFiles([file], 'imageUploader')

                                    return {
                                        success: 1,
                                        file: {
                                            url: res.fileUrl,
                                        }
                                    }
                                }
                            }
                        }
                    },
                    list: List,
                    inlinecode: InlineCode,
                    table: Table, 
                    embed: Embed,
                    checklist: CheckList,
                },
            })
        }
    }, [])

    // handle errors
    useEffect(() => {
        if(Object.keys(errors).length) {
            for(const [_key, value] of Object.entries(errors)) {
                toast({
                    title: 'Something went wrong',
                    description: (value as {message: string}).message,
                    variant: 'destructive',
                })
            }
        }
    }, [errors])


    useEffect(() => {
        if(typeof window !== 'undefined'){
            setIsMounted(true)
        }
    }, [])

    useEffect(() => {
        const init = async () => {
        await initializeEditor()

        setTimeout(() => {
            _titleRef.current?.focus()
           
        }, 0)
    }

    if(isMounted) {
        init()

        return () => {
            ref.current?.destroy()
            ref.current = undefined
        }
    }
   }, [isMounted, initializeEditor])


   async function onSubmit(data: FormData) {
    const blocks = await ref.current?.save()

    const payload: RecipeCreationRequest = {
        title: data.title,
        directions: blocks,
        subiscuitId,
    }
    createRecipe(payload)
   }

   if(!isMounted) {
    return null
   }
  
   const {ref: titleRef, ...rest} = register('title')
   
   return (
        <div className='w-full bg-[#ECFDFD] rounded-lg border border-[#DAFCFC]'>
            <form 
                id="subiscuit-recipe-form" 
                className='w-fit px-4'
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className='prose prose-stone dark:prose-invert'>
                    {/* title */}
                    <TextareaAutosize
                        ref={(e) => {
                            titleRef(e)
                            // @ts-ignore
                            _titleRef.current = e
                        }}
                        {...rest}
                        placeholder='Title of your recipe' 
                        className='w-full resize-none appearance-none overflow-hidden bg-transparent text-4xl  
                            md:text-3xl font-bold focus:outline-none text-[#030B12]' 
                    />

                   {/* Directions */}

                    <div id='editor' className='min-h-[400px] w-full px-2' />
                    <p className='text-sm text-gray-500'>
                        Use{' '}
                        <kbd className='rounded-md border bg-muted px-1 text-xs uppercase'>
                            Tab
                        </kbd>{' '}
                        to open the command menu.
                    </p>
                </div>
            </form>
        </div>
    )
}

export default Editor