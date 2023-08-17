import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { ChefHatIcon } from "lucide-react"
import { Button } from "@/components/ui/Button"
import Editor from "@/components/Editor"

interface PageProps {
    params: {
        slug: string
    }
}

const page = async ({ params }: PageProps) => {
    const subiscuit = await db.subiscuit.findFirst({
        where: {
            name: params.slug,
        },
    })

    if(!subiscuit) return notFound()


  return (
    <div className="flex flex-col items-start gap-6">
        <div className="border-b">
            <div className="-ml-2 -mt-2 flex flex-wrap items-baseline">
                <h3 className="ml-2 mt-2 text-base font-semibold leading-6 text-slate-900">
                    Create Recipe
                </h3>
                <p className="ml-2 mt-1 truncate text-sm text-slate-500 flex max-w-sm justify-start items-center">
                    in 
                    <ChefHatIcon className="w-6 h-6 sm:w-4 sm:h-4 " />
                    {params.slug}
                </p>
            </div>
        </div>
        
        {/* Form */}
        <Editor subiscuitId={subiscuit.id} />

        <div className="w-full flex justify-end">
            <Button type="submit" className="w-full" form="subiscuit-recipe-form">
                Create a Recipe
            </Button>
        </div>

    </div>
  )
}

export default page