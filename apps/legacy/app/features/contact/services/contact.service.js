import api from "@/services/api";

/**
 * Submits a contact enquiry to the server.
 * @param {Object} data - The contact form data.
 * @param {string} data.name - The user's name.
 * @param {string} data.email - The user's email address.
 * @param {string} data.subject - The subject of the enquiry.
 * @param {string} data.message - The detailed message.
 * @returns {Promise<Object>} The response data from the server.
 */
export const submitContactEnquiry = async (data) => {
  const response = await api.post("/commonapp/v1/contact/", data);
  return response.data;
};
