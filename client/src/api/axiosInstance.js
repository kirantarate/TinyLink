import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://tinylink-9amd.onrender.com/",
});

export default axiosInstance;
