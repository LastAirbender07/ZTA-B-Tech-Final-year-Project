import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import loadRazorpay from "../utlis/loadRazorpay";
import { generateDeviceFingerprint } from "../utlis/DeviceFingerprint";
import { toast } from "react-hot-toast";
import { API_URLS } from "../apiUrls";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, shareTransaction } from "@/reducers/userSlice";

const PaymentDialog = ({ auditorId, onClose }) => {
  const dispatch = useDispatch();
  const [progress, setProgress] = useState(0);
  const [fingerprint, setFingerprint] = useState(null);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const { userDetails } = useSelector((state) => state.user);
  const transactionId = useSelector((state) => state.user.transactionId);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // Simulate fingerprint generation with a progress bar
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const nextProgress = prev + 20;
        if (nextProgress >= 100) {
          clearInterval(progressInterval);
          setLoading(false);
          generateFingerprint();
        }
        return Math.min(nextProgress, 100);
      });
    }, 500);
    return () => clearInterval(progressInterval);
  }, []);

  const generateFingerprint = async () => {
    try {
      const { fingerprint, fingerprintData } =
        await generateDeviceFingerprint();
      setFingerprint(fingerprint);
      toast.success("Fingerprint generated successfully!");
    } catch (error) {
      toast.error("Failed to generate fingerprint.");
    }
  };

  const handlePayment = () => {
    return new Promise((resolve, reject) => {
      if (!agreementChecked) {
        toast.error("You must agree to the terms and conditions.");
        reject(new Error("Preconditions not met"));
        return;
      }

      loadRazorpay()
        .then((razorpayLoaded) => {
          if (!razorpayLoaded) {
            toast.error("Failed to load payment gateway. Please try again.");
            reject(new Error("Razorpay failed to load"));
            return;
          }

          const options = {
            key: API_URLS.RAZORPAY_KEY_ID,
            amount: "50000", // Amount in smallest currency unit (e.g., paise for INR)
            currency: "INR",
            name: "ZTA - Expense Tracker",
            description:
              "Book the selected auditor\nNote that this is just an initial payment. The overall auditor fee is subject between the customer and the auditor.",
            image:
              "https://www.careerguide.com/career/wp-content/uploads/2023/07/Amrita-University.png",
            prefill: {
              name: userDetails.full_name || "Gaurav Kumar",
              email: userDetails.email || "gaurav.kumar@example.com",
              contact: userDetails.phone_no || "9000090000",
            },
            notes: {
              address: "Razorpay Corporate Office",
            },
            theme: {
              color: "#3399cc",
            },
            handler: function (response) {
              toast.success("Payment Successful!");
              resolve(true);
            },
            modal: {
              ondismiss: function () {
                toast.error("Payment was canceled.");
                reject(new Error("Payment canceled"));
              },
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        })
        .catch((error) => {
          toast.error("An error occurred during payment.");
          reject(error);
        });
    });
  };

  const handleShare = async () => {
    if (!transactionId) {
      toast.error("No transactions available to share.");
      return;
    }

    try {
      const paymentSuccess = await handlePayment();
      if (paymentSuccess) {
        await dispatch(shareTransaction({ auditorId, transactionId })).unwrap();
        toast.success("Transaction shared successfully!");
        onClose();
      }
    } catch (error) {
      toast.error(
        error.message === "Payment canceled"
          ? "Payment was canceled. Please try again."
          : "Failed to complete payment or share transaction."
      );
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Warning</DialogTitle>
          <DialogDescription>
            By proceeding, the selected auditor will gain read-only access to
            all transactions in the application. Access is permanent.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {loading ? (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Generating fingerprint...
              </p>
              <Progress value={progress} className="w-full" />
            </div>
          ) : (
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={agreementChecked}
                  onChange={(e) => setAgreementChecked(e.target.checked)}
                  disabled={loading}
                />
                <span>I agree to the terms and conditions</span>
              </label>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="destructive"
            onClick={() => {
              toast.error("Testing Sentry by throwing an Error");
              throw new Error("Sentry Test Error");
            }}
          >
            Break the world
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            disabled={!agreementChecked || loading}
          >
            Proceed to Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
