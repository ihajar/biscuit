import { buttonVariants } from "@/components/ui/Button";
import { CookieIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return <>
    <h1 className="font-bold text-3xl md:text-4xl">
      Your Feed
    </h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4md:gap-x-4 py-6">
      {/* Feed */}

      {/* subiscuit info */}
      <div className="overflow-hidden h-fit rounded-lg border border-[#B6F7F7] order-first m:order-last">
        <div className="bg-[#DAFBFB] px-6 py-4">
          <p className="font-semibold py-3 flex items-center gap-1.5">
            <CookieIcon className="w-6 h-6" />
            Home
          </p>
        </div>

        <div className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
          <div className="flex justify-between gap-x-4 py-3">
            <p className="text-slate-500">
              Your Personal Biscuit hoempage. come here to check in 
              with your favorite baking communities.
            </p>
          </div>

          <Link className={buttonVariants({
            className: 'w-full mt-4 mb-6'
          })} href='/r/create'>Create Community</Link>
        </div>
      </div>
    </div>
  </>
}
