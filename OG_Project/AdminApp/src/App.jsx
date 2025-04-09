// import React, { useEffect, useState } from "react";
// import { useDispatch } from "react-redux";
// import { setUser, clearUser } from "./reducers/userSlice";
// import { jwtDecode } from "jwt-decode"; // Import jwt-decode
// import { Routes, Route } from "react-router-dom";
// import { Toaster } from "react-hot-toast";
// import AdminPage from "./pages/AdminPage";
// import NotFound from "./pages/NotFound";
// import LoadingPage from "./pages/LoadingPage";

// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     const storedToken = localStorage.getItem("authToken");

//     if (window.location.search.includes("token=") && storedToken) {
//       window.history.replaceState({}, document.title, window.location.pathname); // Clear query params
//     }

//     if (storedToken) {
//       const decodedToken = jwtDecode(storedToken);
//       console.log(decodedToken);
//       const currentTime = Date.now() / 1000; // Get the current time in seconds

//       if (decodedToken.exp && decodedToken.exp > currentTime) {
//         dispatch(setUser(decodedToken));
//         setIsAuthenticated(true); // Token is valid and not expired
//       } else {
//         // Token has expired, redirect to login
//         localStorage.removeItem("authToken"); // Clear the expired token
//         dispatch(clearUser());
//         window.location.href = "http://localhost:3000/login";
//       }
//     } else {
//       // No token in localStorage, check URL for token
//       const params = new URLSearchParams(window.location.search);
//       const token = params.get("token");

//       if (token) {
//         const decodedToken = jwtDecode(token);
//         const currentTime = Date.now() / 1000;

//         if (decodedToken.exp && decodedToken.exp > currentTime) {
//           // Save the token in localStorage and set the authenticated state
//           localStorage.setItem("authToken", token);
//           window.history.replaceState({}, document.title, "/");
//           setIsAuthenticated(true);
//         } else {
//           // Token is expired, redirect to login
//           window.location.href = "http://localhost:3000/login";
//         }
//       } else {
//         // No token found in URL or localStorage, redirect to login
//         window.location.href = "http://localhost:3000/login";
//       }
//     }
//   }, [dispatch]);

//   return (
//     <div>
//       <>
//         <Routes>
//           <Route
//             path="/"
//             element={isAuthenticated ? <AdminPage /> : <LoadingPage />}
//           />
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//         <Toaster />
//       </>
//     </div>
//   );
// }

// export default App;

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "./reducers/userSlice";
import { jwtDecode } from "jwt-decode";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import LoadingPage from "./pages/LoadingPage";

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
      alert("Invalid role. Admin access only.");
      window.location.href = "http://localhost:3000/login";
    };

    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken);
        console.log(decodedToken);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp && decodedToken.exp > currentTime) {
          if (decodedToken.role === "admin") {
            dispatch(setUser(decodedToken));
            setIsAuthenticated(true);
          } else {
            handleInvalidRole();
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
            if (decodedToken.role === "admin") {
              localStorage.setItem("authToken", token);
              window.history.replaceState({}, document.title, "/");
              setIsAuthenticated(true);
            } else {
              handleInvalidRole();
            }
          } else {
            console.log("Token expired");
            window.location.href = "http://localhost:3000/login";
          }
        } catch (error) {
          console.error("Invalid token format", error);
          window.location.href = "http://localhost:3000/login";
        }
      } else {
        console.log("No token found");
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
            element={isAuthenticated ? <AdminPage /> : <LoadingPage />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </>
    </div>
  );
}

export default App;
