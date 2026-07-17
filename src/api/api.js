import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

export const checkHealth = () => axios.get(`${API}/health`);

export const getRuns = () => axios.get(`${API}/api/runs/`);
export const createRun = (data) => axios.post(`${API}/api/runs/`, data);
export const getScore = (id) => axios.get(`${API}/api/runs/${id}/score`);

export const getHunts = () => axios.get(`${API}/api/hunting/`);
export const createHunt = (data) => axios.post(`${API}/api/hunting/`, data);
export const escalateHunt = (id) => axios.post(`${API}/api/hunting/${id}/escalate`);

export const getIamFindings = () => axios.get(`${API}/api/iam/`);
export const createIamFinding = (data) => axios.post(`${API}/api/iam/`, data);
export const escalateIamFinding = (id) => axios.post(`${API}/api/iam/${id}/escalate`);

export const getCases = () => axios.get(`${API}/api/cases/`);
export const createCase = (data) => axios.post(`${API}/api/cases/`, data);
export const closeCase = (id) => axios.patch(`${API}/api/cases/${id}/close`);
