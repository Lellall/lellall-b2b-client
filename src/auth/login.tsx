import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { StyledButton } from "@/components/button/button-lellall"
import Input from "@/components/input/input"
import { theme } from "@/theme/theme"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"
import { useLoginMutation } from "@/redux/api/auth/auth.api"

const schema = yup
  .object({
    username: yup.string().email("Invalid email format").required("Email is required"),
    password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
  })
  .required()

const Login = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  })

  const [login, { isLoading }] = useLoginMutation()

  const onSubmit = async (data) => {
    try {
      const result = await login(data).unwrap()
      // Handle successful login, perhaps navigate to home or dashboard
      localStorage.setItem("access_token", result.accessToken)

      toast.success("Login successful!")
    } catch (error) {
      // Handle login error
      toast.error("Login failed: " + error.data?.message || "An error occurred")
    }
  }

  return (
    <div className="">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-semibold text-green-900">Welcome Back</h1>
        <p className="mt-2 text-sm ">Enter your email and password to sign in</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <Input
              width="350px"
              label="Email"
              placeholder="Your email address"
              type="email"
              error={errors.username?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input
              width="350px"
              label="Password"
              placeholder="Your password"
              type="password"
              error={errors.password?.message}
              {...field}
            />
          )}
        />
        <div className="flex justify-end">
          <Button variant="link" className="mb-2 text-xs">
            Forgot password ?
          </Button>
        </div>
        <div className="">
          <StyledButton
            background={theme.colors.active}
            color={theme.colors.secondary}
            width="350px"
            variant="outline"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "SIGN IN"}
          </StyledButton>
        </div>
        {/* <div className="flex mt-2 justify-center">
          <Button variant="link" className="mb-2 text-xs">
            Don't have an account? <span className="text-green-800 text-[14px]">Sign up</span>
          </Button>
        </div> */}
      </form>
    </div>
  )
}

export default Login
