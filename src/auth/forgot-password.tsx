import { StyledButton } from "@/components/button/button-lellall"
import { theme } from "@/theme/theme"
import { Button } from "@/components/ui/button"
import Input from "@/components/input/input"

const ForgotPassword = () => {
  return (
    <div className="">
      <div className="text-center mt-10 mb-10"> 
        <h1 className="text-lg font-semibold text-red-900">Forgot Your Password ?</h1>
        <p className="mt-2 text-sm">Enter your email address below to receive  <br /> a link to reset your password.</p>
      </div>
      <Input width='350px' label="Email" placeholder="Your email address" type="email" />
      <div className="">
        <StyledButton background={theme.colors.active} color={theme.colors.secondary} width='350px' variant="outline">SEND LINK</StyledButton>
      </div>
      <div className="flex mt-5 justify-center">
        <Button variant='outline' className="mb-2 text-xs">Go Back</Button>
      </div>
    </div>
  )
}

export default ForgotPassword