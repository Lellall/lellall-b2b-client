import React from "react";
import { useMediaQuery } from "react-responsive";

import logo from "../../public/vite.svg"
import banner from "../../assets/Image.svg"
import { theme } from "@/theme/theme";

export interface AuthLayoutProps {
    children: React.ReactNode
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
    const isMobile = useMediaQuery({ query: `(max-width: ${theme.breakpoints.mobile})` });
    const currentYear = new Date().getFullYear();

    return (
        <div className="flex h-screen">
            <div className="w-full sm:w-1/2 w-full flex flex-col justify-center items-center relative overflow-y-auto">
                <div className="absolute top-[70px] left-1/2 transform -translate-x-1/2">
                    <img src={logo} alt="logo" />
                </div>
               
                <div className="absolute top-[130px]">
                    {children}
                </div>
            </div>
            <div
                style={{ backgroundImage: `url(${banner})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                className={`${isMobile ? "hidden" : "flex"} w-1/2 bg-gradient-to-br from-green-600 to-green-900 items-center justify-center text-white`}
            >
                <div className="absolute bottom-[10px] transform -translate-x-1/2">
                <div className="text-center">
                    <p className="text-sm">© {currentYear} Lellall. All rights reserved.  
                    </p>
                </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
