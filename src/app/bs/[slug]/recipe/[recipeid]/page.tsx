import { FC } from 'react'

interface pageProps {
    params: {
        recipeId: string
    }
}

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const page = ({ params }: pageProps) => {
  return <div>page</div>
}

export default page