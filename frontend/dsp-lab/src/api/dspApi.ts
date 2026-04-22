import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000",
});

export const generateSignal = (expression: string) =>
  API.post("/generate", { expression });

export const calculateEnergy = (signal: number[]) =>
  API.post("/energy", { signal });

export const calculatePower = (signal: number[]) =>
  API.post("/power", { signal });

export const expressSignal = (expression: string, mode: string) =>
  API.post("/express", { expression, mode });

export const operateSignals = (
  expression1: string,
  expression2: string,
  operation: "+" | "-" | "*"
) => API.post("/operate", { expression1, expression2, operation });

export const getSignalDerivatives = (expression: string) =>
  API.post("/derivatives", { expression });

export const getSignalDecomposition = (expression: string) =>
  API.post("/decomposition", { expression });


/*export const getFrequency = (expression: string) =>
  API.post("/frequency", { expression });*/


export const getSignalParity = (expression: string) =>
  API.post("/parity", { expression });

export const getFourierSeries = (N: number) =>
  API.post("/fourier", { N });

export const getFourierTransform = (signalId: string) =>
  API.post("/fourier_transform", { signalId });
