import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useUI } from '../../../hooks/useUI';
import { 
  signupSchema, 
  loginSchema, 
  forgotPasswordSchema,
  SignupFormData,
  LoginFormData,
  ForgotPasswordFormData 
} from '../../../utils/validation';

/**
 * Auth Forms component - handles Signup, Login, and Forgot Password forms
 */
export const AuthForms: React.FC = () => {
  const { authModalType } = useUI();
  
  // Default to signup if no modal type is set
  const currentForm = authModalType || 'signup';
  
  return (
    <div className="w-full max-w-md">
      {currentForm === 'signup' && <SignupForm />}
      {currentForm === 'login' && <LoginForm />}
      {currentForm === 'forgot-password' && <ForgotPasswordForm />}
    </div>
  );
};

// ============================================
// Signup Form
// ============================================
const SignupForm: React.FC = () => {
  const { signup } = useAuth();
  const { openAuthModal, showToast } = useUI();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      await signup(data.name, data.email, data.password);
      showToast('success', 'Account created successfully!');
      // Navigation handled by AuthRedirect component
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-semibold text-[var(--ink)] mb-6">Create Account</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[var(--muted-strong)] mb-1">
            Name
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            className="input-base"
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--muted-strong)] mb-1">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="input-base"
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--muted-strong)] mb-1">
            Password
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="input-base pr-10"
              placeholder="********"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--ink)]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--muted-strong)] mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              className="input-base pr-10"
              placeholder="********"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--ink)]"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms Agreement */}
        <div className="flex items-start gap-2">
          <input
            {...register('agreeToTerms')}
            type="checkbox"
            id="agreeToTerms"
            className="mt-1 h-4 w-4 rounded border-[var(--border)] bg-white text-[var(--ink)] focus:ring-[var(--accent)]"
          />
          <label htmlFor="agreeToTerms" className="text-sm text-[var(--muted)]">
            I agree to the{' '}
            <Link to="/terms" className="text-[var(--accent)] hover:text-[var(--ink)]">
              Terms & Conditions
            </Link>
          </label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-sm text-red-500">{errors.agreeToTerms.message}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating Account...
            </>
          ) : (
            'Sign Up'
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <p className="mt-4 text-center text-[var(--muted)]">
        Already have an account?{' '}
        <button
          onClick={() => openAuthModal('login')}
          className="text-[var(--accent)] hover:text-[var(--ink)]"
        >
          Sign In
        </button>
      </p>
    </div>
  );
};

// ============================================
// Login Form
// ============================================
const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const { openAuthModal, showToast } = useUI();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      showToast('success', 'Logged in successfully!');
      // Navigation handled by AuthRedirect component
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-semibold text-[var(--ink)] mb-6">Welcome Back</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-[var(--muted-strong)] mb-1">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            id="login-email"
            className="input-base"
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-[var(--muted-strong)] mb-1">
            Password
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              id="login-password"
              className="input-base pr-10"
              placeholder="********"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--ink)]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <button
            type="button"
            onClick={() => openAuthModal('forgot-password')}
            className="text-sm text-[var(--accent)] hover:text-[var(--ink)]"
          >
            Forgot Password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Switch to Signup */}
      <p className="mt-4 text-center text-[var(--muted)]">
        Don't have an account?{' '}
        <button
          onClick={() => openAuthModal('signup')}
          className="text-[var(--accent)] hover:text-[var(--ink)]"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
};

// ============================================
// Forgot Password Form
// ============================================
const ForgotPasswordForm: React.FC = () => {
  const { requestPasswordReset } = useAuth();
  const { openAuthModal, showToast } = useUI();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    try {
      await requestPasswordReset(data.email);
      setEmailSent(true);
      showToast('success', 'Password reset email sent!');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to send reset email');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
    <div className="card p-6 text-center">
      <h2 className="text-2xl font-semibold text-[var(--ink)] mb-4">Check Your Email</h2>
      <p className="text-[var(--muted)] mb-6">
        We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
      </p>
      <button
        onClick={() => openAuthModal('login')}
        className="text-[var(--accent)] hover:text-[var(--ink)]"
      >
        Back to Login
      </button>
    </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-semibold text-[var(--ink)] mb-2">Reset Password</h2>
      <p className="text-[var(--muted)] mb-6">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="reset-email" className="block text-sm font-medium text-[var(--muted-strong)] mb-1">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            id="reset-email"
            className="input-base"
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Sending...
            </>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>

      {/* Back to Login */}
      <p className="mt-4 text-center text-[var(--muted)]">
        Remember your password?{' '}
        <button
          onClick={() => openAuthModal('login')}
          className="text-[var(--accent)] hover:text-[var(--ink)]"
        >
          Sign In
        </button>
      </p>
    </div>
  );
};

export default AuthForms;
