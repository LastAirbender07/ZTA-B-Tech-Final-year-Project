const BASE_URL = "http://localhost:5001";

export const API_URLS = {
  // User Routes
  REDIRECT_BAD_URL: `http://localhost:3000/login`,          
  GET_USER_PROFILE: `${BASE_URL}/user/profile`,       // Get logged-in user's profile
  UPDATE_USER_PROFILE: `${BASE_URL}/user/profile`,    // Update logged-in user's profile
  GET_TRANSACTIONS: `${BASE_URL}/user/transactions`,  // Get all transactions for the logged-in user
  ADD_TRANSACTION: `${BASE_URL}/user/transactions`,   // Add a new transaction for the user
  DELETE_TRANSACTION: (transactionId) => `${BASE_URL}/user/transactions/${transactionId}`,  // Delete a specific transaction by ID
  UPDATE_TRANSACTION: (transactionId) => `${BASE_URL}/user/transactions/${transactionId}`,  // Update a specific transaction by ID
  GET_AUDITORS: `${BASE_URL}/user/auditors`,          // Get list of auditors
  SHARE_TRANSACTION: `${BASE_URL}/user/transactions/share`, // Share transactions with an auditor
  REVOKE_ACCESS: `${BASE_URL}/user/transactions/revoke`, // Revoke access to shared transactions
  GET_USER_TRANSACTIONS: `${BASE_URL}/user/user-transactions`, // Get transactions shared with the logged-in user
  GET_SMS_TRANSACTIONS: `${BASE_URL}/user/sms-transactions`, // Get SMS transactions for the logged-in user
  UPDATE_SMS_LABELS:`${BASE_URL}/user/update-sms-labels`,
  DELETE_SMS_TRANSACTION:`${BASE_URL}/user/delete-sms-transaction`,
  FETCH_MODEL_STATS:`${BASE_URL}/user/model-stats`,
  RAZORPAY_BASE_URL: "https://checkout.razorpay.com/v1/checkout.js",
  RAZORPAY_KEY_ID: "rzp_test_RKAPkmXFaLaFBP",
  RAZORPAY_KEY_SECRET: "cYxtY7QXeEdvVwIztyV1oiSV",
  RECAPTCHA_SITE_KEY: "6LddLKEqAAAAAOcWyqb2v5ahGu0LfnuOkB9zIrJK",
  RECAPTCHA_SECRET_KEY: "6LddLKEqAAAAADBgZJ8AtlbNdmv1OF6dSNt-8WUz",
  SENTRY_AUTH_TOKEN:"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"
};

export const API_KEYS = {
  BIN_ID:"6770dcdcad19ca34f8e26b1a",
  API_KEY:"$2a$10$tNVLRPxumzoBDbMfaYhQhexsIfJFwT38aJaOxYPaKtahTrVKqFp3S",
  X_ACCESS_KEY:"$2a$10$sZwKrGJCdCYGvyb923PNK./t/INdYt.0BCZswrnxIPA1WNZXnyRqi"
}