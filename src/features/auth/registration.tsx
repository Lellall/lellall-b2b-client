import { StyledButton } from "@/components/button/button-lellall"
import Input from "../../components/input/input"
import { theme } from "@/theme/theme"
import { Button } from "@/components/ui/button"

const Registration = () => {
    return (
        <div className="">
            <div className="text-center mb-10">
                <h1 className="text-2xl font-semibold text-green-900">Join Us</h1>
                <p className="mt-2 text-sm">Create an account to get started</p>
            </div>
            <Input width='350px' label="Organization" placeholder="Your organization name" type="text" />
            <Input width='350px' label="Email" placeholder="Your email address" type="email" />
            <Input width='350px' label="Address" placeholder="Address" type="textArea" />
            <Input width='350px' label="Phone Number" placeholder="Your Phone Number" type="phone" />
            <Input width='350px' label="Password" placeholder="Your passwoord" type="password" />
            <Input width='350px' label="Confirm Password" placeholder="Your passwoord" type="password" />
            <div className="">
                <StyledButton background={theme.colors.active} color={theme.colors.secondary} width='350px' variant="outline">SIGN UP</StyledButton>
            </div>
            <div className="flex mt-2 justify-center">
                <Button variant='link' className="mb-2 text-xs">Already have an account? <span className="text-green-800 text-[14px]">Sign In</span></Button>
            </div>
        </div>
    )
}

export default Registration