interface ApiRequestParams {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: Record<string, any>;
  apiKey?: string;
  timeout?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

/**
 * Makes a request to an external API with proper error handling
 * @param params - Parameters for the API request
 * @returns API response with success status and data or error information
 */
export async function callExternalApi<T>(
  params: ApiRequestParams
): Promise<ApiResponse<T>> {
  // Validate required parameters
  if (!params.endpoint) {
    return {
      success: false,
      error: 'API endpoint is required',
      statusCode: 400
    };
  }

  // Set up API configuration
  const API_BASE_URL = process.env.API_BASE_URL || 'https://api.example.com';
  const API_KEY = params.apiKey || process.env.DEFAULT_API_KEY;
  const method = params.method || 'GET';
  const timeout = params.timeout || 10000; // Default timeout: 10 seconds

  if (!API_KEY) {
    return {
      success: false,
      error: 'API key is required either as a parameter or environment variable',
      statusCode: 401
    };
  }

  try {
    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Prepare request options
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    };

    // Add body for non-GET requests
    if (method !== 'GET' && params.data) {
      options.body = JSON.stringify(params.data);
    }

    // Make the API request
    const response = await fetch(`${API_BASE_URL}/${params.endpoint}`, options);
    clearTimeout(timeoutId);

    // Parse response data
    const data = await response.json();

    // Handle unsuccessful responses
    if (!response.ok) {
      return {
        success: false,
        error: data.message || `API error: ${response.status}`,
        statusCode: response.status,
        data
      };
    }

    // Return successful response
    return {
      success: true,
      data: data as T,
      statusCode: response.status
    };
  } catch (error) {
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: `Request timed out after ${timeout}ms`,
          statusCode: 408
        };
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Network error. Please check your connection and try again.',
          statusCode: 503
        };
      }
      
      return {
        success: false,
        error: `Unexpected error: ${error.message}`,
        statusCode: 500
      };
    }
    
    return {
      success: false,
      error: 'Unknown error occurred',
      statusCode: 500
    };
  }
}
