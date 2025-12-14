import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // change to your deployed URL later
});

export default api;
