import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, updateUserProfile } from "../reducers/userSlice";
import { FaUserCircle, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";
import NavBar from "../components/NavBar";

const UserPage = () => {
  const dispatch = useDispatch();
  const { userDetails, loading, error } = useSelector((state) => state.user);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_no: "",
    gender: "male", // Default gender value
    profile_photo: "",
  });

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (userDetails) {
      setFormData({
        full_name: userDetails.full_name,
        email: userDetails.email,
        phone_no: userDetails.phone_no || "",
        gender: userDetails.gender || "male",
        profile_photo: userDetails.profile_photo,
      });
    }
  }, [userDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGenderChange = (e) => {
    setFormData({ ...formData, gender: e.target.value });
  };

  const handleSave = () => {
    dispatch(updateUserProfile(formData));
    setIsEditing(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <NavBar />
      <motion.div
        className="min-h-screen mx-auto py-10 max-w-lg shadow-lg rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center">
          <img
            src={formData.profile_photo || "https://via.placeholder.com/150"}
            alt="Profile"
            className="w-40 h-40 p-4 rounded-full border-4 border-gray-300"
          />
          <h2 className="text-2xl font-bold mt-4">{userDetails.username}</h2>
          <p className="text-gray-400">
            {userDetails.role || "No role assigned"}
          </p>
        </div>

        <div className="p-4">
          {isEditing ? (
            <div>
              <label className="block text-gray-300">Full Name:</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="block w-full p-2 text-gray-800 border border-gray-300 rounded mt-1"
              />

              <label className="block text-gray-300 mt-4">Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full p-2 text-gray-800 border border-gray-300 rounded mt-1"
              />

              <label className="block text-gray-300 mt-4">Phone Number:</label>
              <input
                type="text"
                name="phone_no"
                value={formData.phone_no}
                onChange={handleInputChange}
                className="block w-full p-2 text-gray-800 border border-gray-300 rounded mt-1"
              />

              <label className="block text-gray-300 mt-4">Gender:</label>
              <div className="flex items-center mt-1">
                <label className="flex items-center mr-6">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === "male"}
                    onChange={handleGenderChange}
                    className="mr-2"
                  />
                  Male
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === "female"}
                    onChange={handleGenderChange}
                    className="mr-2"
                  />
                  Female
                </label>
              </div>

              <label className="block text-gray-300 mt-4">
                Profile Photo URL:
              </label>
              <input
                type="text"
                name="profile_photo"
                value={formData.profile_photo}
                onChange={handleInputChange}
                className="block w-full p-2 text-gray-800 border border-gray-300 rounded mt-1"
              />

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSave}
                  className="bg-blue-500 text-white p-2 rounded flex items-center"
                >
                  <FaSave className="mr-2" /> Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-red-500 text-white p-2 rounded ml-2 flex items-center"
                >
                  <FaTimes className="mr-2" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="mt-4">
                <strong>Full Name:</strong> {userDetails.full_name}
              </p>
              <p className="mt-2">
                <strong>Email:</strong> {userDetails.email}
              </p>
              <p className="mt-2">
                <strong>Phone Number:</strong> {userDetails.phone_no || "N/A"}
              </p>
              <p className="mt-2">
                <strong>Gender:</strong> {userDetails.gender}
              </p>
              <p className="mt-2">
                <strong>Profile Photo:</strong> {userDetails.profile_photo}
              </p>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-green-500 text-white p-2 rounded flex items-center"
                >
                  <FaEdit className="mr-2" /> Edit
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UserPage;
