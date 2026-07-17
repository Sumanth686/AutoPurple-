import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

const client = axios.create({ baseURL: API_BASE });

export const getRuns = () => client.get("/api/runs/");
export const createRun = (data) => client.post("/api/runs/", data);

export const getHunts = () => client.get("/api/hunting/");
export const createHunt = (data) => client.post("/api/hunting/", data);
export const escalateHunt = (id) => client.post(`/api/hunting/${id}/escalate`);

export const getIamFindings = () => client.get("/api/iam/");
export const createIamFinding = (data) => client.post("/api/iam/", data);
export const escalateIamFinding = (id) => client.post(`/api/iam/${id}/escalate`);

export const getCases = () => client.get("/api/cases/");
export const createCase = (data) => client.post("/api/cases/", data);
export const closeCase = (id) => client.post(`/api/cases/${id}/close`);
