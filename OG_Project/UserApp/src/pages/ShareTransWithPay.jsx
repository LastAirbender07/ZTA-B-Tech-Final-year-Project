import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAuditors, fetchUserSharedTransactions } from "../reducers/userSlice";
import NavBar from "../components/NavBar";
import AuditorCard from "../components/AuditorCard";
import PaymentDialog from "../components/PaymentDialog";
import { toast } from "react-hot-toast";
import SkeletonCard  from "@/utlis/SkeletonCard";

const ShareTransWithPay = () => {
  const dispatch = useDispatch();
  const auditors = useSelector((state) => state.user.auditors);
  const sharedWith = useSelector((state) => state.user.sharedWith);
  const [selectedAuditor, setSelectedAuditor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(getAuditors());
        dispatch(fetchUserSharedTransactions());
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  const handleShare = async (auditorId) => {
    // if auditor is already shared, do nothing
    if (sharedWith.includes(auditorId)) {
      toast.error("Auditor is already shared.");
      return;
    }
    setSelectedAuditor(auditorId);
  };

  return (
    <>
      <NavBar />
      <div className="h-screen py-4 px-7">
        <h2 className="text-white text-center text-2xl mb-4">
          Share Transactions with Auditors
        </h2>
        {loading ? (
          <SkeletonCard />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {auditors.map((auditor) => (
              <AuditorCard
                key={auditor._id}
                auditor={auditor}
                onShare={() => handleShare(auditor._id)}
                isShared={sharedWith.includes(auditor._id)}
              />
            ))}
          </div>
        )}
        {selectedAuditor && (
          <PaymentDialog
            auditorId={selectedAuditor}
            onClose={() => setSelectedAuditor(null)}
          />
        )}
      </div>
    </>
  );
};

export default ShareTransWithPay;
