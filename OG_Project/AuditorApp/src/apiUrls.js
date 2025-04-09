const BASE_URL = "http://localhost:5001";

export const API_URLS = {
  // Auditor-specific endpoints
  UPDATE_AUDITOR_DETAILS: `${BASE_URL}/auditor/update`,
  GET_AUDITOR_INFO: `${BASE_URL}/auditor/audit-info`,
  GET_TRANSACTION_BY_ID: (transactionId) =>
    `${BASE_URL}/auditor/transactions/${transactionId}`,
};
