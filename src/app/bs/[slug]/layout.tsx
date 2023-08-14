import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { format } from "date-fns"
import { ChefHatIcon } from "lucide-react"
import { notFound } from "next/navigation"
import SubscribeLeaveToggle from "@/components/SubscribeLeaveToggle"

const Layout = async ({
    children,
    params: { slug },
}: {
    children: React.ReactNode
    params: { slug: string }
}) => {

    const session = await getAuthSession()

    const subiscuit = await db.subiscuit.findFirst({
        where: { name: slug },
        include: {
            recipes: {
                include: {
                    author: true,
                    votes: true,
                },
            },
        },
    })

    const subscription = !session?.user ? undefined : await db.subscription.findFirst({
        where: {
            subiscuit: {
                name: slug,
            },
            user: {
                id: session.user.id,
            },
        },
    })

    const isSubscribed = !!subscription

    if(!subiscuit) return notFound()

    const memberCount = await db.subscription.count({
        where: {
            subiscuit: {
                name: slug,
            },
        },
    })

    return (
        <div className="sm:container max-w-7xl mx-auto h-full pt-12">
            <div>
                {/* TODO: button to take us back */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md: gap-x-4 py-6">
                    <div className="flex flex-col col-span-2 space-y-6">{children}</div>

                    {/* Info sidebar */}
                    <div className="hidden md:block overflow-hidden h-fit rounded-lg border bg-[#B6F7F7] border-gray-200 order-first md:order-last">
                        <div className="px-6 py-4">
                            <p className="font-semibold py-3">
                                <span className="flex justify-start max-w-sm gap-x-2 items-center">
                                    About 
                                    <ChefHatIcon className="w-4 h-4 " />
                                    {subiscuit.name}
                                </span>
                            </p>
                        </div>

                        <dl className="divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white">
                            <div className="flex justify-between gap-x-4 py-3">
                                <dt className="text-slate-500">Created</dt>
                                <dd className="text-slate-700">
                                    <time dateTime={subiscuit.createdAt.toDateString()}>
                                        {format(subiscuit.createdAt, 'MMMM d, yyyy')}
                                    </time>
                                </dd>
                            </div>

                            <div className="flex justify-between gap-x-4 py-3">
                                <dt className="text-slate-500">Members</dt>
                                <dd className="text-slate-700">
                                    <div className="text-slate-900">{memberCount}</div>
                                </dd>
                            </div>

                            {subiscuit.creatorId === session?.user.id ? (
                                <div className="flex justify-between gap-x-4 py-4">
                                    <p className="text-slate-500">You created this community</p>
                                </div>
                            ) : null}

                            {subiscuit.creatorId !== session?.user.id ? (
                                <SubscribeLeaveToggle 
                                    isSubscribed={isSubscribed}
                                    subiscuitId={subiscuit.id} 
                                    subiscuitName={subiscuit.name}  
                                />
                            ): null}
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Layout