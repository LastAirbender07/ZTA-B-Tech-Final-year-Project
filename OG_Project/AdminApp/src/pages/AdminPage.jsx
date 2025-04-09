import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPendingUsers,
  updateUserRole,
  deleteUser,
} from "../reducers/userSlice";
import PendingUserTable from "../components/PendingUserTable";
import toast from "react-hot-toast";
import "react-confirm-alert/src/react-confirm-alert.css";
import space from "../assets/images/space.jpg";

const AdminPage = () => {
  const dispatch = useDispatch();
  const pendingUsers = useSelector((state) => state.user.pendingUsers);
  const [selectedRole, setSelectedRole] = useState({});

  useEffect(() => {
    dispatch(fetchPendingUsers());
  }, [dispatch]);

  const handleRoleChange = (userId, role) => {
    setSelectedRole((prev) => ({
      ...prev,
      [userId]: role,
    }));
  };

  const handleRefresh = () => {
    dispatch(fetchPendingUsers());
  };

  return (
    <div className="h-screen overflow-auto bg-gradient-to-t from-teal-50 to-blue-400">
      <div className="mx-auto my-10 py-5 max-w-7xl">
        <section
          id="hero"
          className="widescreen:section-min-height tallscreen:section-min-height mb-12 flex scroll-mt-40 flex-col-reverse items-center justify-center gap-8 p-6 sm:flex-row"
        >
          <article className="sm:w-1/2">
            <h2 className="max-w-md text-center text-4xl font-bold text-slate-900 dark:text-white sm:text-left sm:text-5xl">
              Discover, Secure, Prevail:
              <span className="dark-text-indigo-300 text-purple-200">
                {" "}
                Empowering Your Digital Fortress
              </span>
            </h2>
            <p className="mt-4 max-w-md text-center text-2xl text-slate-900 sm:text-left">
              Unleashing the Power of Security to Safeguard Your Digital Journey
            </p>
            <p className="mt-4 max-w-md text-center text-2xl text-slate-800 dark:text-slate-400 sm:text-left">
              Cyber Vigilance for a Safer Digital Tomorrow.
            </p>
          </article>
          <img className="w-1/2" src={space} alt="Rocket Dab" />
        </section>

        <div className="flex justify-end mb-4">
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            onClick={handleRefresh}
          >
            Refresh
          </button>
        </div>

        <PendingUserTable
          pendingUsers={pendingUsers}
          handleRoleChange={handleRoleChange}
          selectedRole={selectedRole}
          dispatch={dispatch}
          updateUserRole={updateUserRole}
          deleteUser={deleteUser}
          fetchPendingUsers={fetchPendingUsers}
        />
      </div>
    </div>
  );
};

export default AdminPage;
