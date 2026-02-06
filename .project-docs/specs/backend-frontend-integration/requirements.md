# Requirements Document

## Introduction

This document specifies the requirements for integrating the Flask backend API with the React/TypeScript frontend for the GDP forecasting application. The integration will replace mock data with real API calls, enabling users to receive AI-powered GDP predictions and view historical economic data from the backend machine learning model.

## Glossary

- **Frontend**: The React/TypeScript application built with Vite that provides the user interface
- **Backend**: The Flask API server that hosts the GDP prediction model and historical data
- **API_Service**: The frontend service layer responsible for making HTTP requests to the Backend
- **Dashboard**: The main frontend component where users input economic indicators and view predictions
- **Historical_Data**: GDP growth data from 1972-2024 stored in the Backend's CSV file
- **Prediction_Request**: An HTTP POST request containing economic indicators for GDP prediction
- **Prediction_Response**: The Backend's response containing predicted GDP growth rate and method used
- **Mock_Data**: The current generateHistoricalData function that creates fake historical data
- **Loading_State**: UI state indicating an API request is in progress
- **Error_State**: UI state indicating an API request has failed

## Requirements

### Requirement 1: API Service Layer

**User Story:** As a developer, I want a centralized API service layer, so that all HTTP requests are managed consistently with proper error handling.

#### Acceptance Criteria

1. THE API_Service SHALL provide a function to fetch historical data for a given country
2. THE API_Service SHALL provide a function to submit prediction requests with economic indicators
3. WHEN an API request fails, THE API_Service SHALL return a structured error object with a user-friendly message
4. THE API_Service SHALL use the base URL from environment configuration
5. THE API_Service SHALL include proper TypeScript types for all request and response data structures

### Requirement 2: Historical Data Integration

**User Story:** As a user, I want to see real historical GDP data when I select a country, so that I can understand past economic trends.

#### Acceptance Criteria

1. WHEN a user selects a country, THE Dashboard SHALL fetch historical data from the Backend's `/api/history` endpoint
2. WHEN historical data is received, THE Dashboard SHALL replace the Mock_Data with the real data
3. WHEN the historical data request is in progress, THE Dashboard SHALL display a Loading_State indicator
4. IF the historical data request fails, THEN THE Dashboard SHALL display an Error_State message and fall back to Mock_Data
5. THE Dashboard SHALL transform the Backend response format to match the chart data structure (year, growth, type fields)

### Requirement 3: Prediction Request Integration

**User Story:** As a user, I want my economic indicator inputs to be sent to the AI model, so that I receive accurate GDP predictions.

#### Acceptance Criteria

1. WHEN a user clicks "Generate Prediction", THE Dashboard SHALL send a POST request to the Backend's `/predict` endpoint
2. THE Prediction_Request SHALL include all required fields: Country, Population, Exports, Imports, Investment, Consumption, Govt_Spend
3. WHEN the prediction request is in progress, THE Dashboard SHALL display a Loading_State with "Calculating..." message
4. WHEN a Prediction_Response is received, THE Dashboard SHALL display the predicted growth rate
5. THE Dashboard SHALL display the prediction method indicator ("AI Model" or "Simulation") from the Backend response

### Requirement 4: Error Handling and User Feedback

**User Story:** As a user, I want clear feedback when something goes wrong, so that I understand what happened and can take appropriate action.

#### Acceptance Criteria

1. WHEN a network error occurs, THE Dashboard SHALL display a user-friendly error message
2. WHEN the Backend returns an error status code, THE Dashboard SHALL display the error message from the response
3. IF a prediction request fails, THEN THE Dashboard SHALL maintain the current UI state and allow the user to retry
4. IF a historical data request fails, THEN THE Dashboard SHALL fall back to Mock_Data and display a warning message
5. THE Dashboard SHALL clear error messages when a new successful request is made

### Requirement 5: Environment Configuration

**User Story:** As a developer, I want configurable API endpoints, so that the application can work in different environments (development, production).

#### Acceptance Criteria

1. THE Frontend SHALL read the API base URL from environment variables
2. WHEN no environment variable is set, THE Frontend SHALL default to `http://localhost:5000`
3. THE Frontend SHALL support different API base URLs for development and production builds
4. THE API_Service SHALL construct full endpoint URLs by combining the base URL with endpoint paths

### Requirement 6: Data Transformation and Compatibility

**User Story:** As a developer, I want seamless data transformation between Backend and Frontend formats, so that the existing UI components work without modification.

#### Acceptance Criteria

1. WHEN historical data is received from the Backend, THE Dashboard SHALL transform it to include a "type" field with value "historical"
2. WHEN prediction data is generated, THE Dashboard SHALL add it to the historical data array with "type" field value "prediction"
3. THE Dashboard SHALL ensure all year values are strings for chart compatibility
4. THE Dashboard SHALL ensure all growth rate values are numbers rounded to 2 decimal places
5. THE Dashboard SHALL merge historical and prediction data into a single timeline for visualization

### Requirement 7: Loading States and User Experience

**User Story:** As a user, I want visual feedback during data loading, so that I know the application is working and not frozen.

#### Acceptance Criteria

1. WHEN fetching historical data, THE Dashboard SHALL display a loading spinner or skeleton UI
2. WHEN submitting a prediction request, THE Dashboard SHALL disable the "Generate Prediction" button
3. WHEN a prediction is calculating, THE Dashboard SHALL show an animated loading indicator
4. WHEN data loading completes, THE Dashboard SHALL smoothly transition to displaying the results
5. THE Dashboard SHALL maintain responsive UI interactions during loading states

### Requirement 8: TypeScript Type Safety

**User Story:** As a developer, I want strong TypeScript types for all API interactions, so that I catch errors at compile time and have better IDE support.

#### Acceptance Criteria

1. THE API_Service SHALL define TypeScript interfaces for all request payloads
2. THE API_Service SHALL define TypeScript interfaces for all response data structures
3. THE API_Service SHALL define TypeScript types for error responses
4. THE Dashboard SHALL use typed API service functions with proper type checking
5. THE Frontend SHALL have no TypeScript compilation errors related to API data types

### Requirement 9: CORS and Network Configuration

**User Story:** As a developer, I want proper CORS configuration, so that the Frontend can communicate with the Backend without security issues.

#### Acceptance Criteria

1. THE Backend SHALL maintain CORS enabled for cross-origin requests
2. THE Frontend SHALL include appropriate headers in API requests
3. WHEN making API requests, THE Frontend SHALL handle CORS preflight requests correctly
4. THE API_Service SHALL set Content-Type header to "application/json" for POST requests
5. THE Frontend SHALL handle network timeouts gracefully with appropriate error messages

### Requirement 10: Government Spending Parameter Mapping

**User Story:** As a developer, I want correct parameter mapping between Frontend and Backend, so that all economic indicators are transmitted accurately.

#### Acceptance Criteria

1. THE Dashboard SHALL map the "Government Spending" input field to the "Govt_Spend" parameter in the Prediction_Request
2. THE Dashboard SHALL ensure all numeric inputs are converted to numbers before sending to the Backend
3. THE Dashboard SHALL validate that all required fields are present before making a prediction request
4. THE Prediction_Request SHALL match the exact field names expected by the Backend API
5. THE Dashboard SHALL handle any field name mismatches with clear error messages
