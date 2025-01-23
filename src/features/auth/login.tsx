import { StyledButton } from "@/components/button/button-lellall"
import Input from "../../components/input/input"
import { theme } from "@/theme/theme"
import { Button } from "@/components/ui/button"

const Login = () => {
    return (
        <div className="">
             <div className="text-center mb-10">
                    <h1 className="text-2xl font-semibold text-green-900">Welcome Back</h1>
                    <p className="mt-2 text-sm ">Enter your email and password to sign in</p>
                </div>
            <Input width='350px' label="Email" placeholder="Your email address" type="email" />
            <Input width='350px' label="Password" placeholder="Your passwoord" type="password" />
            <div className="flex justify-end">
                <Button variant='link' className="mb-2 text-xs">Forgot password ?</Button>
            </div>
            <div className="">
                <StyledButton background={theme.colors.active} color={theme.colors.secondary} width='350px' variant="outline">SIGN IN</StyledButton>
            </div>
            <div className="flex mt-2 justify-center">
                <Button variant='link' className="mb-2 text-xs">Don't have an account? <span className="text-green-800 text-[14px]">Sign up</span></Button>
            </div>
        </div>
    )
}

export default Login