import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import Cards from "../components/Cards";
import TransactionForm from "../components/TransactionForm";
import Header from "../components/ui/Header";
import { toast } from "react-hot-toast";
import { MdLogout } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchTransactions,
  clearUser,
  fetchUserProfile,
} from "../reducers/userSlice";
import NavBar from "../components/NavBar";

ChartJS.register(ArcElement, Tooltip, Legend);

const HomePage = () => {
  const dispatch = useDispatch();
  const { transactions, user, userDetails, loading, error } = useSelector((state) => state.user);

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "₹",
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
        borderRadius: 30,
        spacing: 10,
        cutout: 130,
      },
    ],
  });

  useEffect(() => {
    dispatch(fetchTransactions());
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (transactions && Object.keys(transactions).length > 0) {
      const categories = [...new Set(Object.values(transactions).map(
        (transaction) => transaction.category
      ))];

      const totalAmounts = [0, 0, 0]; // Array for [expense, savings, investment]

      Object.values(transactions).forEach(transaction => {
        const { category, amount } = transaction;
        if (category === 'expense') {
          totalAmounts[0] += amount; // Add to expense
        } else if (category === 'saving') {
          totalAmounts[1] += amount; // Add to savings
        } else if (category === 'investment') {
          totalAmounts[2] += amount; // Add to investment
        }
      });
      console.log(totalAmounts);

      const backgroundColors = [];
      const borderColors = [];

      categories.forEach((category) => {
        if (category === "saving") {
          backgroundColors.push("rgba(75, 192, 192)");
          borderColors.push("rgba(75, 192, 192)");
        } else if (category === "expense") {
          backgroundColors.push("rgba(255, 99, 132)");
          borderColors.push("rgba(255, 99, 132)");
        } else if (category === "investment") {
          backgroundColors.push("rgba(54, 162, 235)");
          borderColors.push("rgba(54, 162, 235)");
        }
      });

      setChartData((prev) => ({
        labels: categories,
        datasets: [
          {
            ...prev.datasets[0],
            data: totalAmounts,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
          },
        ],
      }));
    } else {
      setChartData({
        labels: [],
        datasets: [
          {
            label: "₹",
            data: [0],
            backgroundColor: ["rgba(220, 220, 220)"],
            borderColor: ["rgba(200, 200, 200)"],
            borderWidth: 1,
            borderRadius: 30,
            spacing: 10,
            cutout: 130,
          },
        ],
      });
    }
  }, [transactions]);

  const handleLogout = async () => {
    try {
      await dispatch(clearUser());
      toast.success("Logged out successfully");
      window.location.href = "http://localhost:3000/login";
    } catch (err) {
      toast.error("Error logging out");
    }
  };

  return (
    <>
      <NavBar/>
      <Header />
      <div className="flex flex-col gap-6 items-center max-w-7xl mx-auto z-20 relative justify-center">
        <div className="flex items-center">
          <p className="md:text-4xl text-2xl lg:text-4xl font-bold text-center relative z-50 mb-4 mr-4 bg-gradient-to-r from-pink-600 via-indigo-500 to-pink-400 inline-block text-transparent bg-clip-text">
            Spend wisely, track wisely
          </p>
          <img
            src={userDetails?.profile_photo || "/default-avatar.png"} // Use a default avatar if userDetails is not available
            className="w-11 h-11 rounded-full border cursor-pointer"
            alt="Avatar"
          />
          {!loading && (
            <MdLogout
              className="mx-2 w-5 h-5 cursor-pointer"
              onClick={handleLogout}
            />
          )}
          {loading && (
            <div className="w-6 h-6 border-t-2 border-b-2 mx-2 rounded-full animate-spin"></div>
          )}
        </div>
        <div className="flex flex-wrap w-full justify-center items-center gap-6">
          {transactions && Object.keys(transactions).length > 0 && (
            <div className="h-[330px] w-[330px] md:h-[360px] md:w-[360px]">
              <Doughnut data={chartData} />
            </div>
          )}
          <TransactionForm />
        </div>
        <Cards />
      </div>
    </>
  );
};

export default HomePage;
