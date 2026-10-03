import api from "@/services/api";

export const getDesktopAppReleases = async () => {
  const res = await api.get("/commonapp/v1/desktop_app/windows/latest/");
  return res.data?.data || [];
};

export const downloadDesktopAppFile = async (os) => {
  // Using blob response type to handle the file download correctly
  const res = await api.get(`/commonapp/v1/desktop_app/${os}/download/`, {
    responseType: "blob",
  });
  return res.data;
};
