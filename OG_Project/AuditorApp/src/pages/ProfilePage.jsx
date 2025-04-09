import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAuditorInfo } from "../reducers/userSlice";
import { toast } from "react-hot-toast";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const auditInfo = useSelector((state) => state.user.auditInfo);
  const loading = useSelector((state) => state.user.loading);

  useEffect(() => {
    dispatch(getAuditorInfo())
      .unwrap()
      .then(() => {
        toast.success("Auditor details fetched successfully!");
      })
      .catch((error) => {
        toast.error("Failed to fetch auditor details.");
        console.error("Error fetching auditor details:", error);
      });
  }, [dispatch]);

  useEffect(() => {
    if (auditInfo) {
      console.log("Auditor Info:", auditInfo);
    }
  }, [auditInfo]);

  return (
    <div>
      <div>Profile Page</div>
      {loading ? <p>Loading auditor details...</p> : <p>Check console for auditor details!</p>}
    </div>
  );
};

export default ProfilePage;
