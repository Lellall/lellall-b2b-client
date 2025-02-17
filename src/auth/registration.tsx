import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { StyledButton } from "@/components/button/button-lellall";
import Input from "@/components/input/input";
import { theme } from "@/theme/theme";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useRegisterMutation } from '@/redux/api/auth/auth.api';

const schema = yup.object({
  organisationName: yup.string().required('Organisation name is required'),
  shortName: yup.string().required('Short name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  address: yup.string().required('Address is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  businessType: yup.string().oneOf(['RESTAURANT'], 'Business type must be RESTAURANT').required('Business type is required')
}).required();

const Registration = () => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const [register, { isLoading }] = useRegisterMutation();

  const onSubmit = async (data) => {
    try {
      const result = await register(data).unwrap();
      toast.success('Registration successful! Please check your email for verification.');
    } catch (error) {
      toast.error('Registration failed: ' + (error.data?.message || 'An error occurred'));
    }
  };

  return (
    <div className="">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-semibold text-green-900">Join Us</h1>
        <p className="mt-2 text-sm">Create an account to get started</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="organisationName"
          control={control}
          render={({ field }) => <Input width='350px' label="Organisation Name" placeholder="Your organisation name" type="text" error={errors.organisationName?.message} {...field} />}
        />
        <Controller
          name="shortName"
          control={control}
          render={({ field }) => <Input width='350px' label="Short Name" placeholder="Your organisation's short name" type="text" error={errors.shortName?.message} {...field} />}
        />
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => <Input width='350px' label="First Name" placeholder="Your first name" type="text" error={errors.firstName?.message} {...field} />}
        />
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => <Input width='350px' label="Last Name" placeholder="Your last name" type="text" error={errors.lastName?.message} {...field} />}
        />
        <Controller
          name="email"
          control={control}
          render={({ field }) => <Input width='350px' label="Email" placeholder="Your email address" type="email" error={errors.email?.message} {...field} />}
        />
        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => <Input width='350px' label="Phone Number" placeholder="Your phone number" type="tel" error={errors.phoneNumber?.message} {...field} />}
        />
        <Controller
          name="address"
          control={control}
          render={({ field }) => <Input width='350px' label="Address" placeholder="Your address" type="text" error={errors.address?.message} {...field} />}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => <Input width='350px' label="Password" placeholder="Your password" type="password" error={errors.password?.message} {...field} />}
        />
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => <Input width='350px' label="Confirm Password" placeholder="Confirm your password" type="password" error={errors.confirmPassword?.message} {...field} />}
        />
        <Controller
          name="businessType"
          control={control}
          render={({ field }) => (
            <Input 
              width='350px' 
              label="Business Type" 
              placeholder="RESTAURANT" 
              type="text" 
              // disabled 
              value="RESTAURANT" 
              error={errors.businessType?.message} 
              {...field} 
            />
          )}
        />
        <div className="">
          <StyledButton 
            background={theme.colors.active} 
            color={theme.colors.secondary} 
            width='350px' 
            variant="outline"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'SIGN UP'}
          </StyledButton>
        </div>
        <div className="flex mt-2 justify-center">
          <Button variant='link' className="mb-2 text-xs">Already have an account? <span className="text-green-800 text-[14px]">Sign In</span></Button>
        </div>
      </form>
    </div>
  );
};

export default Registration;