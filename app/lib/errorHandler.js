export const getErrorMessage = (err) => {
  if (!err) return "Something went wrong";

  if (err.response?.data?.message)
    return err.response.data.message;

  if (err.response?.data?.detail)
    return err.response.data.detail;

  if (err.message)
    return err.message;

  return "Something went wrong";
};
