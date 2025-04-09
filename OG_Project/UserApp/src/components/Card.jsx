import { FaLocationDot } from "react-icons/fa6";
import { BsCardText } from "react-icons/bs";
import { MdOutlinePayments } from "react-icons/md";
import { FaSackDollar } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";
import { Link } from "react-router-dom";
import { formatDate } from "../utlis/formatDate";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { deleteTransaction } from "../reducers/userSlice";

const categoryColorMap = {
  saving: "from-green-700 to-green-400",
  expense: "from-pink-800 to-pink-600",
  investment: "from-blue-700 to-blue-400",
};

const Card = ({ transaction, authUser, userDetails }) => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.user.loading);

  const { category = "", description = "", paymentType = "", amount = 0, location = "", date = "" } = transaction;

  const formattedDescription = description ? description[0].toUpperCase() + description.slice(1) : "";
  const formattedCategory = category ? category[0].toUpperCase() + category.slice(1) : "";
  const formattedPaymentType = paymentType ? paymentType[0].toUpperCase() + paymentType.slice(1) : "";
  const formattedDate = formatDate(date);

  const cardClass = categoryColorMap[formattedCategory.toLowerCase()] || "from-gray-700 to-gray-400"; // Default color if category is undefined

  const handleDelete = async () => {
    try {
      await dispatch(deleteTransaction(transaction._id)).unwrap();
      toast.success("Transaction deleted successfully");
    } catch (err) {
      toast.error("Error in deleting transaction: " + err.message);
    }
  };

  return (
    <div className={`rounded-md p-4 bg-gradient-to-br ${cardClass}`}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-bold text-white">{formattedCategory}</h2>
          <div className="flex items-center gap-2">
            {!loading ? (
              <FaTrash className="cursor-pointer" onClick={handleDelete} />
            ) : (
              <div className="w-6 h-6 border-t-2 border-b-2 rounded-full animate-spin"></div>
            )}
            <Link to={`/transaction/${transaction._id}`}>
              <HiPencilAlt className="cursor-pointer" size={20} />
            </Link>
          </div>
        </div>
        <p className="text-white flex items-center gap-1">
          <BsCardText />
          Description: {formattedDescription}
        </p>
        <p className="text-white flex items-center gap-1">
          <MdOutlinePayments />
          Payment Type: {formattedPaymentType}
        </p>
        <p className="text-white flex items-center gap-1">
          <FaSackDollar />
          Amount: ₹{amount}
        </p>
        <p className="text-white flex items-center gap-1">
          <FaLocationDot />
          Location: {location || "N/A"}
        </p>
        <div className="flex justify-between items-center">
          <p className="text-xs text-black font-bold">{formattedDate}</p>
          <img
            src={userDetails?.profile_photo}
            className="h-8 w-8 border rounded-full"
            alt="User profile"
          />
        </div>
      </div>
    </div>
  );
};

export default Card;
