// API Service Layer for Backend Communication

// Environment configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// TypeScript Interfaces

export interface HistoricalDataPoint {
  Country: string;
  Year: number;
  GDP_Growth: number;
  Exports_Growth: number;
  Imports_Growth: number;
}

export interface PredictionRequest {
  Country: string;
  Population_Growth_Rate: number;
  Exports_Growth_Rate: number;
  Imports_Growth_Rate: number;
  Investment_Growth_Rate: number;
  Consumption_Growth_Rate: number;
  Govt_Spend_Growth_Rate: number;
}

export interface PredictionResponse {
  predicted_gdp_growth: number;
  model_type: string;
  interpretation: string;
  note: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// API Service Functions

/**
 * Fetch list of all available countries
 * @returns Promise with array of country names
 */
export async function fetchCountries(): Promise<string[]> {
  const url = `${API_BASE_URL}/api/countries`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch countries: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

/**
 * Fetch historical GDP data for a given country
 * @param country - Name of the country
 * @returns Promise with array of historical data points
 */
export async function fetchHistoricalData(country: string): Promise<HistoricalDataPoint[]> {
  const url = `${API_BASE_URL}/api/history?country=${encodeURIComponent(country)}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch historical data: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

/**
 * Submit scenario simulation request with economic indicators
 * @param data - Scenario simulation request payload
 * @returns Promise with prediction response
 */
export async function submitPrediction(data: PredictionRequest): Promise<PredictionResponse> {
  const url = `${API_BASE_URL}/simulate`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Scenario simulation failed: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result;
}

/**
 * Handle API errors and return structured error object
 * @param error - Error from API call
 * @returns Structured ApiError object
 */
export function handleApiError(error: unknown): ApiError {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: 'Unable to connect to the server. Please check your connection and try again.',
      code: 'NETWORK_ERROR',
    };
  }
  
  if (error instanceof Error) {
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      return {
        message: 'Request timed out. Please try again.',
        code: 'TIMEOUT_ERROR',
      };
    }
    
    return {
      message: error.message,
      details: error,
    };
  }
  
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    details: error,
  };
}

// Data Transformation Functions

export interface ChartDataPoint {
  year: string;
  growth: number;
  type: 'historical' | 'prediction';
}

/**
 * Transform backend historical data to chart-compatible format
 * @param backendData - Array of historical data points from backend
 * @returns Array of chart data points
 */
export function transformHistoricalData(backendData: HistoricalDataPoint[]): ChartDataPoint[] {
  return backendData.map(point => ({
    year: point.Year.toString(),
    growth: parseFloat(point.GDP_Growth.toFixed(2)),
    type: 'historical' as const,
  }));
}

/**
 * Add prediction data to historical timeline
 * @param predictedGrowth - Predicted growth rate
 * @param existingData - Existing historical data
 * @returns Merged timeline with historical and prediction data
 */
export function addPredictionToTimeline(
  predictedGrowth: number,
  existingData: ChartDataPoint[]
): ChartDataPoint[] {
  const predictionPoints: ChartDataPoint[] = [
    {
      year: '2022',
      growth: parseFloat(predictedGrowth.toFixed(2)),
      type: 'prediction',
    },
    {
      year: '2023',
      growth: parseFloat((predictedGrowth * 1.05).toFixed(2)),
      type: 'prediction',
    },
  ];
  
  return [...existingData, ...predictionPoints];
}
