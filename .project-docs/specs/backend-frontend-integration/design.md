# Design Document: Backend-Frontend Integration

## Overview

This design document outlines the integration architecture for connecting the React/TypeScript frontend with the Flask backend API for the GDP forecasting application. The integration will replace mock data generation with real API calls, enabling users to receive AI-powered predictions and view historical economic data.

The design follows a layered architecture with clear separation of concerns:
- **API Service Layer**: Centralized HTTP client for all backend communication
- **Data Transformation Layer**: Converts backend responses to frontend-compatible formats
- **UI State Management**: Handles loading, error, and success states
- **Environment Configuration**: Supports multiple deployment environments

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                     │
│                                                               │
│  ┌────────────────┐         ┌──────────────────┐            │
│  │   Dashboard    │────────▶│  API Service     │            │
│  │   Component    │         │  (api.ts)        │            │
│  └────────────────┘         └──────────────────┘            │
│         │                            │                       │
│         │                            │ HTTP Requests         │
│         ▼                            ▼                       │
│  ┌────────────────┐         ┌──────────────────┐            │
│  │  UI State      │         │  Environment     │            │
│  │  Management    │         │  Config          │            │
│  └────────────────┘         └──────────────────┘            │
│                                     │                        │
└─────────────────────────────────────┼────────────────────────┘
                                      │
                                      │ CORS-enabled
                                      │ HTTP/JSON
                                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Flask Backend (Port 5000)                 │
│                                                               │
│  ┌──────────────────┐      ┌──────────────────┐             │
│  │  GET /api/history│      │  POST /predict   │             │
│  └──────────────────┘      └──────────────────┘             │
│         │                            │                       │
│         ▼                            ▼                       │
│  ┌──────────────────┐      ┌──────────────────┐             │
│  │  Historical CSV  │      │  ML Model (.pkl) │             │
│  │  Data            │      │  + Encoder       │             │
│  └──────────────────┘      └──────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

**Historical Data Flow:**
1. User selects a country in Dashboard
2. Dashboard calls `apiService.fetchHistoricalData(country)`
3. API Service makes GET request to `/api/history?country={name}`
4. Backend queries CSV data and returns JSON array
5. Dashboard transforms response and updates chart data
6. UI displays historical timeline

**Prediction Flow:**
1. User fills in economic indicators and clicks "Generate Prediction"
2. Dashboard validates inputs and calls `apiService.submitPrediction(data)`
3. API Service makes POST request to `/predict` with JSON payload
4. Backend runs ML model or simulation
5. Backend returns prediction with growth rate and method
6. Dashboard displays prediction card and updates charts

## Components and Interfaces

### API Service Module (`src/services/api.ts`)

The API Service provides a centralized interface for all backend communication.

**Configuration:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
```

**Core Functions:**

```typescript
// Fetch historical GDP data for a country
async function fetchHistoricalData(country: string): Promise<HistoricalDataPoint[]>

// Submit prediction request with economic indicators
async function submitPrediction(data: PredictionRequest): Promise<PredictionResponse>

// Generic error handler
function handleApiError(error: unknown): ApiError
```

**Error Handling Strategy:**
- Network errors: Return user-friendly message "Unable to connect to server"
- HTTP errors: Extract error message from response body
- Timeout errors: Return "Request timed out, please try again"
- Unknown errors: Return generic "An unexpected error occurred"

### Dashboard Component Updates

The Dashboard component will be modified to integrate with the API Service.

**New State Variables:**
```typescript
const [isLoadingHistory, setIsLoadingHistory] = useState(false);
const [historyError, setHistoryError] = useState<string | null>(null);
const [predictionMethod, setPredictionMethod] = useState<string>("");
const [apiError, setApiError] = useState<string | null>(null);
```

**Modified Functions:**

```typescript
// Triggered when country selection changes
async function handleCountryChange(country: string) {
  setSelectedCountry(country);
  setIsLoadingHistory(true);
  setHistoryError(null);
  
  try {
    const data = await apiService.fetchHistoricalData(country);
    const transformed = transformHistoricalData(data);
    setHistoricalData(transformed);
  } catch (error) {
    setHistoryError(error.message);
    // Fallback to mock data
    const mockData = generateHistoricalData(country);
    setHistoricalData(mockData);
  } finally {
    setIsLoadingHistory(false);
  }
}

// Modified prediction handler
async function handlePredict() {
  if (!validateInputs()) return;
  
  setIsCalculating(true);
  setApiError(null);
  
  try {
    const requestData = {
      Country: selectedCountry,
      Population: parseFloat(populationGrowth),
      Exports: parseFloat(exportsGrowth),
      Imports: parseFloat(importsGrowth),
      Investment: parseFloat(investment),
      Consumption: parseFloat(consumption),
      Govt_Spend: parseFloat(governmentSpending)
    };
    
    const response = await apiService.submitPrediction(requestData);
    
    setPrediction(response.growth);
    setPredictionMethod(response.method);
    
    // Fetch historical data if not already loaded
    if (historicalData.length === 0) {
      const historical = await apiService.fetchHistoricalData(selectedCountry);
      const transformed = transformHistoricalData(historical);
      setHistoricalData(transformed);
    }
    
    // Add prediction to timeline
    addPredictionToTimeline(response.growth);
    setShowPrediction(true);
    
  } catch (error) {
    setApiError(error.message);
    // Don't show prediction on error
  } finally {
    setIsCalculating(false);
  }
}
```

### Environment Configuration

**Development Environment (`.env.development`):**
```
VITE_API_BASE_URL=http://localhost:5000
```

**Production Environment (`.env.production`):**
```
VITE_API_BASE_URL=https://api.gdpforecaster.com
```

**Vite Configuration:**
Vite automatically loads environment variables prefixed with `VITE_` and makes them available via `import.meta.env`.

## Data Models

### TypeScript Interfaces

**Historical Data Point:**
```typescript
interface HistoricalDataPoint {
  Country: string;
  Year: number;
  GDP_Growth: number;
  Exports_Growth: number;
  Imports_Growth: number;
}
```

**Chart Data Point:**
```typescript
interface ChartDataPoint {
  year: string;
  growth: number;
  type: 'historical' | 'prediction';
}
```

**Prediction Request:**
```typescript
interface PredictionRequest {
  Country: string;
  Population: number;
  Exports: number;
  Imports: number;
  Investment: number;
  Consumption: number;
  Govt_Spend: number;
}
```

**Prediction Response:**
```typescript
interface PredictionResponse {
  growth: number;
  method: 'AI Model' | 'Simulation';
}
```

**API Error:**
```typescript
interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}
```

### Data Transformation Functions

**Transform Historical Data:**
```typescript
function transformHistoricalData(
  backendData: HistoricalDataPoint[]
): ChartDataPoint[] {
  return backendData.map(point => ({
    year: point.Year.toString(),
    growth: parseFloat(point.GDP_Growth.toFixed(2)),
    type: 'historical' as const
  }));
}
```

**Add Prediction to Timeline:**
```typescript
function addPredictionToTimeline(
  predictedGrowth: number,
  existingData: ChartDataPoint[]
): ChartDataPoint[] {
  const predictionPoints: ChartDataPoint[] = [
    {
      year: '2025',
      growth: parseFloat(predictedGrowth.toFixed(2)),
      type: 'prediction'
    },
    {
      year: '2026',
      growth: parseFloat((predictedGrowth * 1.05).toFixed(2)),
      type: 'prediction'
    }
  ];
  
  return [...existingData, ...predictionPoints];
}
```

### Backend API Contracts

**GET `/api/history?country={name}`**

Request:
- Query parameter: `country` (string, required)

Response (200 OK):
```json
[
  {
    "Country": "United States",
    "Year": 1972,
    "GDP_Growth": 5.3,
    "Exports_Growth": 4.2,
    "Imports_Growth": 3.8
  },
  ...
]
```

Response (Empty array if country not found):
```json
[]
```

**POST `/predict`**

Request:
```json
{
  "Country": "United States",
  "Population": 1.1,
  "Exports": 5.2,
  "Imports": 4.8,
  "Investment": 3.5,
  "Consumption": 2.8,
  "Govt_Spend": 2.0
}
```

Response (200 OK):
```json
{
  "growth": 3.45,
  "method": "AI Model"
}
```

Response (Fallback to simulation):
```json
{
  "growth": 2.87,
  "method": "Simulation"
}
```

## Error Handling

### Error Categories and Responses

**Network Errors:**
- Cause: Backend server not running, network connectivity issues
- User Message: "Unable to connect to the server. Please check your connection and try again."
- Fallback: Use mock data for historical data; disable prediction

**HTTP 4xx Errors:**
- Cause: Invalid request data, missing parameters
- User Message: Extract error message from response body or use "Invalid request. Please check your inputs."
- Fallback: Keep current UI state, allow user to correct inputs

**HTTP 5xx Errors:**
- Cause: Backend server error, model loading failure
- User Message: "Server error. The prediction service is temporarily unavailable."
- Fallback: For predictions, show simulation method; for history, use mock data

**Timeout Errors:**
- Cause: Request takes too long (>30 seconds)
- User Message: "Request timed out. Please try again."
- Fallback: Reset loading state, allow retry

### Error Display Strategy

**Historical Data Errors:**
- Display warning banner at top of dashboard: "⚠️ Unable to load historical data. Showing estimated data."
- Continue with mock data generation
- Allow user to retry with a "Refresh" button

**Prediction Errors:**
- Display error message in place of prediction card
- Show "Retry" button
- Keep input fields populated for easy retry
- Log error details to console for debugging

**Graceful Degradation:**
- If historical data fails but prediction succeeds, show prediction with mock historical context
- If prediction fails, keep previous prediction visible (if any) with error message
- Never leave UI in broken state - always provide actionable feedback

## Testing Strategy

### Unit Tests

**API Service Tests:**
- Test successful historical data fetch
- Test successful prediction submission
- Test network error handling
- Test HTTP error response parsing
- Test timeout handling
- Test request payload formatting

**Data Transformation Tests:**
- Test historical data transformation with valid data
- Test historical data transformation with missing fields
- Test prediction timeline generation
- Test year string conversion
- Test growth rate rounding

**Dashboard Integration Tests:**
- Test country selection triggers historical data fetch
- Test prediction button triggers API call
- Test loading states during API calls
- Test error state display
- Test fallback to mock data on error

### Property-Based Tests

Property-based tests will be defined in the Correctness Properties section below.

### Integration Tests

**End-to-End Flow Tests:**
- Test complete prediction flow from input to display
- Test historical data loading on country change
- Test error recovery and retry
- Test environment variable configuration
- Test CORS handling

### Manual Testing Checklist

- [ ] Backend running on port 5000
- [ ] Frontend can fetch historical data for all 15 countries
- [ ] Prediction request succeeds with valid inputs
- [ ] Loading spinners appear during API calls
- [ ] Error messages display when backend is offline
- [ ] Mock data fallback works when API fails
- [ ] Charts render correctly with real data
- [ ] Prediction method indicator shows correct value
- [ ] Environment variables work in dev and prod builds
- [ ] No CORS errors in browser console


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: API Service Error Handling

*For any* API request that fails (network error, HTTP error, or timeout), the API Service should return a structured error object containing a user-friendly message field.

**Validates: Requirements 1.3**

### Property 2: Historical Data Transformation

*For any* historical data response from the backend, transforming it should produce chart data points where all year values are strings, all growth values are numbers rounded to 2 decimal places, and all points have type field set to "historical".

**Validates: Requirements 2.5, 6.1, 6.3, 6.4**

### Property 3: Prediction Request Structure

*For any* set of valid economic indicator inputs, the prediction request payload should include all required fields (Country, Population, Exports, Imports, Investment, Consumption, Govt_Spend) with numeric values, and the Government Spending input should be mapped to the "Govt_Spend" field.

**Validates: Requirements 3.2, 10.1, 10.2, 10.4**

### Property 4: Loading State During API Calls

*For any* API request in progress (historical data fetch or prediction submission), the Dashboard should display a loading indicator and disable relevant action buttons until the request completes.

**Validates: Requirements 2.3, 3.3, 7.1, 7.2, 7.3**

### Property 5: Error State Fallback

*For any* failed historical data request, the Dashboard should display an error message, fall back to mock data generation, and maintain a functional UI that allows retry.

**Validates: Requirements 2.4, 4.4**

### Property 6: Prediction Timeline Merging

*For any* historical data array and prediction value, merging them should produce a single timeline where historical points have type "historical", prediction points have type "prediction", years are sequential strings, and all growth values are numbers.

**Validates: Requirements 6.2, 6.5**

### Property 7: URL Construction

*For any* base URL and endpoint path, the API Service should construct the full URL by correctly concatenating them (handling trailing/leading slashes).

**Validates: Requirements 5.4**

### Property 8: Error Message Display

*For any* API error (network, HTTP, or timeout), the Dashboard should display a user-friendly error message to the user and clear it when a subsequent successful request completes.

**Validates: Requirements 4.1, 4.2, 4.5**

### Property 9: Prediction Response Display

*For any* successful prediction response, the Dashboard should display both the predicted growth rate and the method indicator ("AI Model" or "Simulation") from the response.

**Validates: Requirements 3.4, 3.5**

### Property 10: Request Header Configuration

*For any* POST request made by the API Service, the request should include the Content-Type header set to "application/json".

**Validates: Requirements 9.2, 9.4**

### Property 11: Input Validation Before Request

*For any* prediction attempt, if any required input field is missing or empty, the Dashboard should not make an API request and should keep the submit button disabled.

**Validates: Requirements 10.3**

### Property 12: Country Selection Triggers Data Fetch

*For any* country selection change in the Dashboard, an API request should be made to fetch historical data for that country.

**Validates: Requirements 2.1**

### Property 13: Prediction Button Triggers API Call

*For any* valid prediction form submission, clicking the "Generate Prediction" button should trigger a POST request to the `/predict` endpoint.

**Validates: Requirements 3.1**

### Property 14: Network Timeout Handling

*For any* API request that times out, the API Service should return an error with a timeout-specific message, and the Dashboard should display it gracefully.

**Validates: Requirements 9.5**

### Property 15: Prediction Error Recovery

*For any* failed prediction request, the Dashboard should maintain the current UI state (keeping input values), display the error, and allow the user to retry without losing their inputs.

**Validates: Requirements 4.3**
