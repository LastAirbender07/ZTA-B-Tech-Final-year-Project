import React from "react";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import toast from "react-hot-toast";

const PendingUserTable = ({
  pendingUsers,
  handleRoleChange,
  selectedRole,
  dispatch,
  updateUserRole,
  deleteUser,
  fetchPendingUsers,
}) => {
  const confirmAction = (userId, action) => {
    const user = pendingUsers.find((user) => user._id === userId);

    confirmAlert({
      title: `Confirm ${action === "accept" ? "Accept" : "Reject"}`,
      message: (
        <div>
          <p>
            Are you sure you want to {action === "accept" ? "accept" : "reject"}{" "}
            this user?
          </p>
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Phone No:</strong> {user.phone_no}
          </p>
          {action === "accept" && (
            <div>
              <p>
                <strong>Selected Role:</strong> {selectedRole[userId] || "None"}
              </p>
              {!selectedRole[userId] && (
                <p style={{ color: "red" }}>
                  Please select a role before accepting
                </p>
              )}
            </div>
          )}
        </div>
      ),
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            if (action === "accept" && !selectedRole[userId]) {
              toast.error("Please select a role before accepting.");
              return;
            }
            if (action === "accept") {
              dispatch(
                updateUserRole({ userId, role: selectedRole[userId] })
              ).then((response) => {
                if (!response.error) {
                  toast.success(`User accepted successfully!`);
                  // setSelectedRole((prev) => ({
                  //   ...prev,
                  //   [userId]: undefined, // Clear selected role after acceptance
                  // }));
                  dispatch(fetchPendingUsers()); // Fetch updated list after action
                } else {
                  toast.error("Failed to accept user");
                }
              });
            } else {
              dispatch(deleteUser({ userId })).then((response) => {
                if (!response.error) {
                  toast.success(`User rejected successfully!`);
                  dispatch(fetchPendingUsers()); // Fetch updated list after action
                } else {
                  console.log(response.error);
                  toast.error("Failed to reject user");
                }
              });
            }
          },
        },
        {
          label: "No",
        },
      ],
    });
  };

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500  divide-y divide-gray-200 ">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50  ">
          <tr>
            <th scope="col" className="px-6 py-3 text-center">
              {" "}
              {/* Added text-center */}
              Username
            </th>
            <th scope="col" className="px-6 py-3 text-center">
              {" "}
              {/* Added text-center */}
              Email
            </th>
            <th scope="col" className="px-6 py-3 text-center">
              {" "}
              {/* Added text-center */}
              Role
            </th>
            <th scope="col" className="px-6 py-3 text-center">
              {" "}
              {/* Added text-center */}
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {pendingUsers.map((user) => (
            <tr
              key={user._id}
              className="bg-white  divide-y divide-gray-200  hover:bg-gray-50 "
            >
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900  text-center">
                {user.username}
              </td>
              <td className="px-6 py-4 text-center">{user.email}</td>
              <td className="px-6 py-4 text-center">
                <select
                  className="px-2 py-1 border rounded"
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  value={selectedRole[user._id] || ""}
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="auditor">Auditor</option>
                </select>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex flex-row gap-3 justify-center">
                  {" "}
                  {/* Added justify-center */}
                  <button
                    className="align-middle text-blue-600 select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-sm py-3.5 px-7 rounded-lg bg-white text-blue-gray-900 shadow-md shadow-blue-gray-500/10 hover:shadow-lg hover:shadow-blue-gray-500/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none flex items-center gap-3"
                    type="button"
                    onClick={() => confirmAction(user._id, "accept")}
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/2550/2550322.png"
                      alt="metamask"
                      className="w-6 h-6"
                    />
                    Accept
                  </button>
                  <button
                    className="align-middle text-red-600 select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-sm py-3.5 px-7 rounded-lg bg-white text-blue-gray-900 shadow-md shadow-blue-gray-500/10 hover:shadow-lg hover:shadow-blue-gray-500/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none flex items-center gap-3"
                    type="button"
                    onClick={() => confirmAction(user._id, "reject")}
                  >
                    <img
                      src="https://cdn3d.iconscout.com/3d/free/thumb/free-rejected-5658979-4715785.png"
                      alt="metamask"
                      className="w-8 h-8"
                    />
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PendingUserTable;
