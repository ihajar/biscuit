import Link from "next/link";
import { Icons } from "./Icons";
import { buttonVariants } from "./ui/Button";
import { getAuthSession } from "@/lib/auth";
import UserAccountNav from "./UserAccountNav";


const Navbar = async () => {
    const session = await getAuthSession()


    return <div className="fixed top-0 inset-x-0 h-fit bg-[#ECFDFD] border-[#F1FAEE] z-[10] py-2">
        <div className="container max-w-7xl h-full mx-auto flex items-center justify-between gap-2">
            {/* Logo */}
            <Link href='/' className="flex gap-2 items-center">
                <Icons.logo className="w-8 h-8 lg:h-18 lg:w-18 md:w-15 md:h-15 xs:h-6 xs:w-6 " />
                {/* <p className="hidden text-[#030B12] text-sm font-bold md:block">
                    BiscuIT
                </p> */}
            </Link>

            {/* Search bar */}

            {/* SignIn/SignUp link */}
            {session?.user ? (
                <UserAccountNav user={session.user} />
            ) : (
                <Link href='/sign-in' className={buttonVariants()}>
                    Sign In
                </Link>
            )}
            
        </div>
    </div>
}

export default Navbar;
