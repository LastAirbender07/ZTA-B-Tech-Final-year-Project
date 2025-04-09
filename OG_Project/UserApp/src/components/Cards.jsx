import Card from "./Card";
import { useSelector } from "react-redux";

const Cards = () => {
  const { transactions, user, loading } = useSelector((state) => state.user);
  const userDetails = useSelector((state) => state.user.userDetails);

  const hasTransactions = transactions && Object.keys(transactions).length > 0;
  const transactionList = hasTransactions
    ? Object.entries(transactions).map(([id, transaction]) => ({
        _id: id,
        ...transaction,
      }))
    : [];

  return (
    <div className="w-full px-10 min-h-[40vh]">
      <p className="text-5xl font-bold text-center my-10">History</p>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-start mb-20">
        {!loading && hasTransactions ? (
          transactionList.map((transaction) => (
            <Card
              key={transaction._id}
              transaction={transaction}
              authUser={user}
              userDetails={userDetails}
            />
          ))
        ) : (
          <p className="text-3xl text-center">
            {loading
              ? "Loading transactions..."
              : "No transaction history found"}
          </p>
        )}
      </div>
    </div>
  );
};

export default Cards;
