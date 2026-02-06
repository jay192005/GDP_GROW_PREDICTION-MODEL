# Implementation Plan: Backend-Frontend Integration

## Overview

This implementation plan breaks down the backend-frontend integration into discrete coding tasks. The approach follows a layered implementation strategy: first establishing the API service layer, then integrating it with the Dashboard component, and finally adding error handling and polish. Each task builds incrementally to ensure the application remains functional throughout development.

## Tasks

- [x] 1. Set up environment configuration and API service foundation
  - Create `.env.development` file with `VITE_API_BASE_URL=http://localhost:5000`
  - Create `.env.production` file with production API URL placeholder
  - Create `src/services/api.ts` file with base configuration
  - Define TypeScript interfaces for all API data structures (HistoricalDataPoint, PredictionRequest, PredictionResponse, ApiError)
  - Implement base URL configuration using `import.meta.env.VITE_API_BASE_URL`
  - _Requirements: 1.5, 5.1, 5.2, 5.3_

- [ ] 2. Implement API service core functions
  - [x] 2.1 Implement `fetchHistoricalData` function
    - Create async function that accepts country name parameter
    - Construct GET request URL with query parameter
    - Make fetch request to `/api/history` endpoint
    - Parse JSON response and return typed data
    - _Requirements: 1.1, 2.1_
  
  - [ ]* 2.2 Write property test for URL construction
    - **Property 7: URL Construction**
    - **Validates: Requirements 5.4**
  
  - [x] 2.3 Implement `submitPrediction` function
    - Create async function that accepts PredictionRequest parameter
    - Construct POST request with JSON body
    - Set Content-Type header to "application/json"
    - Make fetch request to `/predict` endpoint
    - Parse JSON response and return typed data
    - _Requirements: 1.2, 3.1, 9.2, 9.4_
  
  - [ ]* 2.4 Write property test for request headers
    - **Property 10: Request Header Configuration**
    - **Validates: Requirements 9.2, 9.4**
  
  - [x] 2.5 Implement error handling function
    - Create `handleApiError` function that processes different error types
    - Handle network errors with user-friendly message
    - Handle HTTP errors by extracting response message
    - Handle timeout errors with specific message
    - Return structured ApiError object
    - _Requirements: 1.3, 4.1, 4.2_
  
  - [ ]* 2.6 Write property test for error handling
    - **Property 1: API Service Error Handling**
    - **Validates: Requirements 1.3**
  
  - [ ]* 2.7 Write property test for timeout handling
    - **Property 14: Network Timeout Handling**
    - **Validates: Requirements 9.5**

- [ ] 3. Implement data transformation functions
  - [x] 3.1 Create `transformHistoricalData` function
    - Accept array of HistoricalDataPoint from backend
    - Map each point to ChartDataPoint format
    - Convert Year to string
    - Round GDP_Growth to 2 decimal places
    - Add type field with value "historical"
    - _Requirements: 2.5, 6.1, 6.3, 6.4_
  
  - [ ]* 3.2 Write property test for historical data transformation
    - **Property 2: Historical Data Transformation**
    - **Validates: Requirements 2.5, 6.1, 6.3, 6.4**
  
  - [x] 3.3 Create `addPredictionToTimeline` function
    - Accept predicted growth rate and existing historical data
    - Create prediction points for 2025 and 2026
    - Set type field to "prediction"
    - Merge with historical data maintaining chronological order
    - _Requirements: 6.2, 6.5_
  
  - [ ]* 3.4 Write property test for prediction timeline merging
    - **Property 6: Prediction Timeline Merging**
    - **Validates: Requirements 6.2, 6.5**

- [x] 4. Checkpoint - Verify API service and transformations
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Update Dashboard component state management
  - Add new state variables: `isLoadingHistory`, `historyError`, `predictionMethod`, `apiError`
  - Add state variable for `governmentSpending` input (if not already present)
  - Import API service functions
  - Import data transformation functions
  - _Requirements: 2.3, 3.3, 4.1_

- [ ] 6. Implement country selection integration
  - [x] 6.1 Create `handleCountryChange` function
    - Set selected country state
    - Set loading state to true
    - Clear any previous errors
    - Call `fetchHistoricalData` from API service
    - Transform response data using `transformHistoricalData`
    - Update historical data state
    - Handle errors by setting error state and falling back to mock data
    - Set loading state to false in finally block
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 6.2 Write property test for country selection trigger
    - **Property 12: Country Selection Triggers Data Fetch**
    - **Validates: Requirements 2.1**
  
  - [ ]* 6.3 Write property test for loading state during fetch
    - **Property 4: Loading State During API Calls**
    - **Validates: Requirements 2.3, 3.3, 7.1, 7.2, 7.3**
  
  - [ ]* 6.4 Write property test for error fallback
    - **Property 5: Error State Fallback**
    - **Validates: Requirements 2.4, 4.4**
  
  - [x] 6.5 Update country Select component
    - Connect `onValueChange` to `handleCountryChange`
    - Ensure country selection triggers data fetch
    - _Requirements: 2.1_

- [ ] 7. Implement prediction request integration
  - [x] 7.1 Update `handlePredict` function
    - Validate all inputs are present (use existing validation)
    - Set calculating state to true
    - Clear any previous API errors
    - Construct PredictionRequest object with all fields
    - Map governmentSpending to Govt_Spend field
    - Convert all string inputs to numbers using parseFloat
    - Call `submitPrediction` from API service
    - Update prediction state with response growth value
    - Update predictionMethod state with response method
    - Fetch historical data if not already loaded
    - Add prediction to timeline using `addPredictionToTimeline`
    - Set showPrediction to true
    - Handle errors by setting apiError state
    - Set calculating state to false in finally block
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 10.1, 10.2, 10.3, 10.4_
  
  - [ ]* 7.2 Write property test for prediction request structure
    - **Property 3: Prediction Request Structure**
    - **Validates: Requirements 3.2, 10.1, 10.2, 10.4**
  
  - [ ]* 7.3 Write property test for prediction button trigger
    - **Property 13: Prediction Button Triggers API Call**
    - **Validates: Requirements 3.1**
  
  - [ ]* 7.4 Write property test for prediction response display
    - **Property 9: Prediction Response Display**
    - **Validates: Requirements 3.4, 3.5**
  
  - [ ]* 7.5 Write property test for input validation
    - **Property 11: Input Validation Before Request**
    - **Validates: Requirements 10.3**
  
  - [ ]* 7.6 Write property test for prediction error recovery
    - **Property 15: Prediction Error Recovery**
    - **Validates: Requirements 4.3**

- [x] 8. Add government spending input field (if not present)
  - Add state variable for government spending
  - Add input field in Dashboard form
  - Add label "Government Spending (%)"
  - Add icon and styling consistent with other inputs
  - Add progress bar for visual feedback
  - Update validation to include government spending
  - _Requirements: 10.1_

- [ ] 9. Implement error display UI
  - [x] 9.1 Add error banner for historical data errors
    - Display warning banner when historyError state is set
    - Show message: "⚠️ Unable to load historical data. Showing estimated data."
    - Add "Refresh" button to retry
    - Style with warning colors (yellow/orange)
    - _Requirements: 4.4_
  
  - [x] 9.2 Add error display for prediction errors
    - Display error card when apiError state is set
    - Show error message from apiError state
    - Add "Retry" button that calls handlePredict again
    - Keep input fields populated for easy retry
    - Style with error colors (red)
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 9.3 Write property test for error message display
    - **Property 8: Error Message Display**
    - **Validates: Requirements 4.1, 4.2, 4.5**

- [x] 10. Add loading state UI enhancements
  - Add loading spinner for historical data fetch
  - Update "Generate Prediction" button to show loading state
  - Disable button during API calls
  - Show "Calculating..." text during prediction
  - Add skeleton UI for charts during initial load (optional)
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 11. Add prediction method indicator display
  - Update prediction result card to show method
  - Display badge with "AI Model" or "Simulation" text
  - Style AI Model badge with green color
  - Style Simulation badge with blue color
  - Position badge prominently in prediction card
  - _Requirements: 3.5_

- [x] 12. Checkpoint - Test complete integration
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Add environment variable documentation
  - Update README.md with environment variable setup instructions
  - Document VITE_API_BASE_URL variable
  - Add example .env files to documentation
  - Document default values
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 14. Final integration testing and polish
  - Test complete flow: select country → view history → enter indicators → get prediction
  - Test error scenarios: backend offline, invalid inputs, network errors
  - Test loading states and transitions
  - Verify all 15 countries work correctly
  - Verify charts render with real data
  - Test environment variable configuration
  - Check browser console for errors
  - Verify CORS is working correctly
  - _Requirements: All_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- The implementation maintains backward compatibility by keeping mock data as fallback
- Government spending field may already exist in the Dashboard - verify before implementing task 8
- All API calls should be tested with the backend running on port 5000
