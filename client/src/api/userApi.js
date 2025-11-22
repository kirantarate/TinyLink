import axiosInstance from "./axiosInstance";

const createLink = async (payload) => {
  const response = await axiosInstance.post("/api/links", payload);
  return response.data;
};

const getAllLinks = async (start = 0, limit = 9) => {
  const response = await axiosInstance.get(`/api/links?start=${start}&limit=${limit}`);
  return response.data;
};

const getByCode = async (code) => {
  const response = await axiosInstance.get(`/api/links/${code}`);
  return response.data;
}

const deleteLink = async (code) => {
  const response = await axiosInstance.delete(`/api/links/${code}`);
  return response.data;
};

const incrementCount = async (code) => {
  const response = await axiosInstance.get(`/${code}`);
  return response.data;
}

export { createLink, getAllLinks, getByCode, deleteLink, incrementCount };
