import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "./reducers/userSlice";
import { jwtDecode } from "jwt-decode";
import { Routes, Route } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import LoadingPage from "./pages/LoadingPage";
import ProfilePage from "./pages/ProfilePage";
import UserTransactions from "./pages/UserTransactions";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (window.location.search.includes("token=") && storedToken) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const handleInvalidRole = () => {
      localStorage.removeItem("authToken");
      dispatch(clearUser());
      toast.error("Invalid role. User access only.");
      window.location.href = "http://localhost:3000/login";
    };

    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken);
        console.log(decodedToken);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp && decodedToken.exp > currentTime) {
          if (decodedToken.role === "auditor") {
            dispatch(setUser(decodedToken));
            setIsAuthenticated(true);
          } else {
            handleInvalidRole(); // Role is not "user"
          }
        } else {
          localStorage.removeItem("authToken");
          dispatch(clearUser());
          window.location.href = "http://localhost:3000/login";
        }
      } catch (error) {
        console.error("Invalid token format", error);
        localStorage.removeItem("authToken");
        dispatch(clearUser());
        window.location.href = "http://localhost:3000/login";
      }
    } else {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp && decodedToken.exp > currentTime) {
            if (decodedToken.role === "auditor") {
              localStorage.setItem("authToken", token);
              window.history.replaceState({}, document.title, "/");
              setIsAuthenticated(true);
            } else {
              handleInvalidRole();
            }
          } else {
            window.location.href = "http://localhost:3000/login";
          }
        } catch (error) {
          console.error("Invalid token format", error);
          window.location.href = "http://localhost:3000/login";
        }
      } else {
        window.location.href = "http://localhost:3000/login";
      }
    }
  }, [dispatch]);

  return (
    <div>
      <>
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <HomePage /> : <LoadingPage />}
          />
          <Route path="/user-transactions/:transId" element={isAuthenticated ? <UserTransactions /> : <LoadingPage />} />
          <Route
            path="/profile"
            element={
              useSelector((state) => state.user.status) ? (
                <ProfilePage />
              ) : (
                <LoadingPage />
              )
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </>
    </div>
  );
}

export default App;
