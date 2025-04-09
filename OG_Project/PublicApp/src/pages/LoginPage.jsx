import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import InputField from "../components/InputField";
import toast from "react-hot-toast";
import axios from "axios";
import { API_URLS } from "../apiUrls";
import { sha256 } from 'js-sha256';
import { jwtDecode } from "jwt-decode";  // To decode JWT token

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLoginRedirect = (token) => {
    try {
      // Decode the JWT token to extract the role
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role;
      const roleLower = userRole.toLowerCase();  // Convert role to lowercase
  
      // Open the respective app in a new tab based on role
      if (roleLower === 'admin') {
        window.open(`http://localhost:3001/?token=${token}`, '_blank');
      } else if (roleLower === 'user') {
        window.open(`http://localhost:3002/?token=${token}`, '_blank');
      } else if (roleLower === 'auditor') {
        window.open(`http://localhost:3003/?token=${token}`, '_blank');
      } else {
        toast.error("Invalid role");
      }
    } catch (error) {
      console.error("Token decoding failed", error);
      toast.error("Token decoding failed");
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginData.username || !loginData.password) {
      return toast.error("Please fill all the fields");
    }
    setLoading(true);
    try {
      // Hash the password using sha256
      const hashedPassword = sha256(loginData.password);
      const response = await axios.post(API_URLS.LOGIN, {
        username: loginData.username,
        password: hashedPassword,
      });

      if (response.status === 200) {
        const { token } = response.data;  // Extract JWT token from response
        toast.success("Login successful");
        handleLoginRedirect(token);  // Handle redirection based on user role
      } else {
        console.error(response);
        toast.error("Login failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex rounded-lg overflow-hidden z-50 bg-gray-300">
        <div className="w-full bg-gray-100 min-w-80 sm:min-w-96 flex items-center justify-center">
          <div className="max-w-md w-full p-6">
            <h1 className="text-3xl font-semibold mb-6 text-black text-center">
              Login
            </h1>
            <h1 className="text-sm font-semibold mb-6 text-gray-500 text-center">
              Welcome back! Log in to your account
            </h1>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <InputField
                label="Username"
                id="username"
                name="username"
                value={loginData.username}
                onChange={handleChange}
              />

              <InputField
                label="Password"
                id="password"
                name="password"
                type="password"
                value={loginData.password}
                onChange={handleChange}
              />
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:bg-black focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Login"}
                </button>
              </div>
            </form>
            <div className="mt-4 text-sm text-gray-600 text-center">
              <p>
                {"Don't"} have an account?{" "}
                <Link to="/signup" className="text-black hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
