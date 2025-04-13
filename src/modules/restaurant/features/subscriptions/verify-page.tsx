import React, { useEffect, useRef } from "react"; // Add useRef
import { useNavigate, useSearchParams } from "react-router-dom";
import { useVerifyPaymentMutation } from "@/redux/api/subscriptions/subscriptions.api";
import styled from "styled-components";
import { theme } from "@/theme/theme";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setAuthState, selectAuth } from "@/redux/api/auth/auth.slice";

const VerifyContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, ${theme.colors.backgroundSelected}, ${theme.colors.primary});
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const Card = styled.div`
  background: ${theme.colors.primary};
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  max-width: 450px;
  width: 100%;
  text-align: center;
  animation: slideUp 0.6s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: ${theme.breakpoints.mobile}) {
    padding: 24px;
    max-width: 90%;
  }
`;

const StatusIcon = styled.div<{ isSuccess: boolean; isError: boolean }>`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: ${(props) =>
    props.isSuccess
      ? theme.colors.accent
      : props.isError
        ? theme.colors.error || "#EF4444"
        : theme.colors.borderDefault};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 2.5rem;
  color: ${theme.colors.primary};
  animation: pulse 1.8s ease-in-out infinite;
  transition: background 0.3s;

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }
`;

const StatusMessage = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: ${theme.colors.active};
  margin-bottom: 16px;
  letter-spacing: -0.01em;

  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: 1.75rem;
  }
`;

const RedirectMessage = styled.p`
  font-size: 1.1rem;
  color: ${theme.colors.primaryFont};
  line-height: 1.6;
  margin-bottom: 24px;

  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: 1rem;
  }
`;

const SupportLink = styled.a`
  color: ${theme.colors.accent};
  text-decoration: underline;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: ${theme.colors.hoverFont};
  }

  &:focus {
    outline: 2px solid ${theme.colors.borderSelected};
    outline-offset: 2px;
  }
`;

const Button = styled.button`
  background: ${theme.colors.accent};
  color: ${theme.colors.primary};
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s;

  &:hover {
    background: ${theme.colors.hoverFont};
    transform: translateY(-2px);
  }

  &:active {
    background: ${theme.colors.active};
    transform: translateY(0);
  }

  &:focus {
 {
    outline: 2px solid ${theme.colors.borderSelected};
    outline-offset: 2px;
  }
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 5px solid ${theme.colors.borderDefault};
  border-top: 5px solid ${theme.colors.accent};
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  margin: 0 auto 24px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const VerifyPaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [verifyPayment, { isLoading }] = useVerifyPaymentMutation();
  const { user, accessToken, refreshToken } = useSelector(selectAuth);
  const hasVerified = useRef(false); // Track verification attempt

  const status = searchParams.get("status");
  const provider = searchParams.get("provider") as "paystack" | "flutterwave" | null;
  const trxref = searchParams.get("trxref");
  const reference = searchParams.get("reference");
  const transactionId = searchParams.get("transaction_id");

  useEffect(() => {
    if (hasVerified.current) return; // Skip if already verified

    const verify = async () => {
      console.log("Search Params:", {
        status,
        provider,
        trxref,
        reference,
        transactionId,
        raw: Object.fromEntries(searchParams.entries()),
      });

      let inferredProvider: "paystack" | "flutterwave" | null = provider;
      if (!inferredProvider) {
        if (trxref) {
          inferredProvider = "flutterwave";
        } else if (reference) {
          inferredProvider = "paystack";
        }
      }

      if (!inferredProvider || !["paystack", "flutterwave"].includes(inferredProvider)) {
        toast.error("Invalid or missing payment provider. Please try again or contact support.", {
          toastId: "invalid-provider", // Prevent duplicates
        });
        setTimeout(() => navigate("/subscriptions"), 4000);
        return;
      }

      let ref = trxref || reference || transactionId;
      if (!ref) {
        toast.error("Missing transaction reference. Please try again or contact support.", {
          toastId: "missing-ref",
        });
        setTimeout(() => navigate("/subscriptions"), 4000);
        return;
      }

      try {
        hasVerified.current = true; // Mark as attempted
        const response = await verifyPayment({
          reference: ref,
          provider: inferredProvider,
        }).unwrap();

        // Update user.ownedRestaurant.subscription
        const updatedUser = {
          ...user,
          ownedRestaurant: {
            ...user.ownedRestaurant,
            subscription: response.subscription,
          },
        };

        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        localStorage.setItem('subscription', JSON.stringify(response.subscription));

        // Dispatch updated state
        dispatch(
          setAuthState({
            isAuthenticated: true,
            accessToken: accessToken || null,
            refreshToken: refreshToken || null,
            user: updatedUser,
            subscription: response.subscription,
          })
        );

        toast.success("Payment verified successfully!", {
          position: "top-right",
          toastId: "verify-success", // Prevent duplicates
        });
        setTimeout(() => navigate("/"), 3000);
      } catch (error: any) {
        console.error("Verification failed:", error);
        toast.error(error?.data?.message ||
          `Failed to verify payment with ${inferredProvider}. Please try again or contact support.`,
          { position: "top-right", toastId: "verify-error" }
        );
        setTimeout(() => navigate("/subscriptions"), 4000);
      }
    };

    if (trxref || reference || transactionId) {
      verify();
    } else {
      toast.error("No transaction reference provided. Please try again or contact support.", {
        toastId: "no-ref",
      });
      setTimeout(() => navigate("/subscriptions"), 4000);
    }

    // Cleanup to reset flag on unmount
    return () => {
      hasVerified.current = false;
    };
  }, [trxref, reference, transactionId, provider, status, navigate]); // Reduced dependencies

  const isSuccess = !isLoading && status !== "failed" && status !== "cancelled";
  const isError = !isLoading && !trxref && !reference && !transactionId;

  return (
    <VerifyContainer role="main" aria-labelledby="verify-status">
      <Card>
        {isLoading ? (
          <Spinner aria-label="Verifying payment" />
        ) : (
          <StatusIcon isSuccess={isSuccess} isError={isError} aria-hidden="true">
            {isSuccess ? "✓" : isError ? "✗" : "?"}
          </StatusIcon>
        )}
        <StatusMessage id="verify-status">
          {isLoading
            ? "Verifying Payment..."
            : isSuccess
              ? "Payment Successful!"
              : isError
                ? "Verification Error"
                : "Payment Failed"}
        </StatusMessage>
        <RedirectMessage>
          {isLoading
            ? "Please wait while we verify your payment..."
            : isSuccess
              ? "You will be redirected to your dashboard shortly."
              : isError
                ? <>
                  An error occurred while verifying your payment. Please try again or{" "}
                  <SupportLink href="mailto:support@yourapp.com">contact support</SupportLink>.
                </>
                : "Payment was not successful. You will be redirected to the subscriptions page shortly."}
        </RedirectMessage>
        {!isLoading && (
          <Button
            onClick={() =>
              navigate(isSuccess ? "/" : "/subscriptions")
            }
            aria-label={
              isSuccess
                ? "Go to dashboard now"
                : "Return to subscriptions page"
            }
          >
            {isSuccess ? "Go to Dashboard" : "Try Again"}
          </Button>
        )}
      </Card>
    </VerifyContainer>
  );
};

export default VerifyPaymentPage;