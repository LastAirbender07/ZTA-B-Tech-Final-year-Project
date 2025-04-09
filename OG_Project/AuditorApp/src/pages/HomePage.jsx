import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAuditorInfo } from "../reducers/userSlice";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register necessary components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const auditInfo = useSelector((state) => state.user.auditInfo);
  const sharedUsers = useSelector((state) => state.user.sharedUsers);
  const loading = useSelector((state) => state.user.loading);

  // const [tasks, setTasks] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const tasks = [
    {
      userId: 1,
      id: 1,
      title: "Review quarterly financial statements",
      completed: false,
    },
    {
      userId: 1,
      id: 2,
      title: "Verify tax compliance for the fiscal year",
      completed: true,
    },
    {
      userId: 2,
      id: 3,
      title: "Assess internal controls for fraud prevention",
      completed: false,
    },
    {
      userId: 2,
      id: 4,
      title: "Audit expense reports for policy violations",
      completed: true,
    },
    {
      userId: 3,
      id: 5,
      title: "Reconcile bank statements with ledger entries",
      completed: false,
    },
  ];

  // Fetch auditor info and tasks
  useEffect(() => {
    const fetchAuditorInfo = async () => {
      try {
        await dispatch(getAuditorInfo()).unwrap();
        toast.success("Auditor info and shared users fetched successfully!");
      } catch (error) {
        toast.error("Failed to fetch auditor info.");
        console.error("Error fetching auditor info:", error);
      }
    };

    // const fetchTasks = async () => {
    //   try {
    //     const response = await axios.get(
    //       "https://jsonplaceholder.typicode.com/todos?_limit=5"
    //     );
    //     setTasks(response.data);
    //   } catch (error) {
    //     toast.error("Failed to fetch tasks.");
    //     console.error("Error fetching tasks:", error);
    //   }
    // };
    // fetchTasks();
    fetchAuditorInfo();
  }, [dispatch]);

  const handleUserSelect = (transId) => {
    setSelectedUserId(transId);
    navigate(`/user-transactions/${transId}`);
  };

  // Placeholder data for audit analytics
  const auditData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Completed Audits",
        data: [5, 9, 6, 8, 4, 10],
        fill: false,
        backgroundColor: "rgba(75,192,192,1)",
        borderColor: "rgba(75,192,192,1)",
      },
    ],
  };

  console.log(sharedUsers);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 to-blue-200 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-5 md:flex-row justify-between mb-5">
          {auditInfo && (
            <div className="bg-white shadow-md rounded-lg p-4 mb-4 md:mb-0 md:w-1/3">
              <div className="flex flex-col items-center mb-2">
                <img
                  src={auditInfo?.profile_photo}
                  alt="Auditor"
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-400 mb-4"
                />
                <h2 className="text-xl font-semibold text-gray-800">
                  {auditInfo?.name}
                </h2>
              </div>
              <h3 className="text-lg font-semibold text-gray-700">
                Access Details:
              </h3>
              <ul className="mt-1 text-gray-600 text-sm">
                <li>
                  Status:{" "}
                  <span className="font-medium text-gray-800">
                    {auditInfo?.status}
                  </span>
                </li>
                <li>
                  Approved by:{" "}
                  <span className="font-medium text-gray-800">
                    {auditInfo?.approved_by}
                  </span>
                </li>
                <li>
                  Phone:{" "}
                  <span className="font-medium text-gray-800">
                    {auditInfo?.phoneNo}
                  </span>
                </li>
                <li>
                  Email:{" "}
                  <span className="font-medium text-gray-800">
                    {auditInfo?.email}
                  </span>
                </li>
                <li>
                  Date of Approval:{" "}
                  <span className="font-medium text-gray-800">
                    {new Date(auditInfo?.date_of_approval).toLocaleDateString()}
                  </span>
                </li>
                <li>
                  Description:{" "}
                  <span className="font-medium text-gray-800">
                    {auditInfo?.description}
                  </span>
                </li>
              </ul>
              {/* Edit Button */}
              <div className="mt-4">
                <button
                  onClick={() => navigate("/profile")}
                  className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-all"
                >
                  Edit
                </button>
              </div>
            </div>
          )}

          {/* Tasks Overview */}
          <div className="md:w-2/3 bg-white shadow-lg rounded-lg px-5 py-1">
            <h3 className="text-2xl font-semibold mb-4">Upcoming Tasks</h3>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <div key={task.id} className="bg-blue-50 p-4 rounded-md">
                  <h4 className="text-lg font-semibold text-gray-800">
                    Task {task.id}
                  </h4>
                  <p className="text-gray-700">{task.title}</p>
                  <p
                    className={`mt-2 text-sm ${
                      task.completed ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {task.completed ? "Completed" : "Pending"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Analytics */}
        <div className="mb-10 bg-white shadow-lg rounded-lg px-4 py-2">
          <h3 className="text-2xl font-semibold mb-4">Audit Analytics</h3>
          <div className="p-6">
            <Line data={auditData} />
          </div>
        </div>

        {/* Shared Users */}
        <h3 className="text-2xl font-semibold mb-4">Shared Users</h3>
        {loading ? (
          <p>Loading users...</p>
        ) : sharedUsers?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sharedUsers.map((user) => (
              <div
                key={user.transaction_id}
                className="bg-white shadow-md rounded-lg p-6 space-y-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={user.user_info?.profile_photo}
                    alt={user.user_info?.username}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {user.user_info?.full_name}
                    </h3>
                    <p className="text-gray-600">@{user.user_info?.username}</p>
                    <p className="text-gray-600">{user.user_info?.email}</p>
                  </div>
                </div>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  onClick={() => handleUserSelect(user.transaction_id)}
                >
                  View Transactions
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No shared users found.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
