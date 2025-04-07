/**
 * Product Price Optimizer
 * 
 * This service uses the Gemini API to recommend optimal product pricing
 * based on product details such as name, category, features, etc.
 * 
 * The service is designed to help sellers optimize their pricing strategy
 * by leveraging Google's Gemini AI model to analyze product attributes
 * and suggest competitive market prices.
 */

// API configuration
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";
const GEMINI_API_KEY = "AIzaSyC_uXWIh-_J0xOZq9MGtS9pMy5a0zEZXNo";

/**
 * ProductDetails structure:
 * {
 *   name: string
 *   price: number (optional)
 *   category: string
 *   brand: string
 *   description: string
 *   features: string[]
 *   countInStock: number
 * }
 */

/**
 * Get an optimized price recommendation from Gemini API
 * 
 * @param productDetails Product details to base the price recommendation on
 * @returns Optimized price as a number, or original price if optimization fails
 */
export const getOptimizedPrice = async (productDetails) => {
  // Default to original price or 0 if none provided
  const originalPrice = productDetails.price || 0;
  
  try {
    // Validate required fields
    if (!productDetails.name || !productDetails.category) {
      console.warn('Missing required product fields for price optimization');
      return originalPrice;
    }
    
    // Build Gemini API request payload
    const payload = {
      contents: [
        {
          parts: [
            {
              text: buildPrompt(productDetails)
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 100
      }
    };

    console.log('Sending request to Gemini API for price optimization');
    
    // Make API request
    const response = await fetch(`${GEMINI_ENDPOINT}${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    // Process response
    const data = await response.json();
    
    if (!data.candidates || !data.candidates.length) {
      throw new Error('Empty response from Gemini API');
    }
    
    const priceText = data.candidates[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!priceText) {
      throw new Error('No price text in Gemini response');
    }
    
    // Try to extract price from response
    return extractPrice(priceText, originalPrice);
    
  } catch (error) {
    console.error('Price optimization error:', error);
    return originalPrice; // Return original price on error
  }
};

/**
 * Build the prompt for the Gemini API
 */
function buildPrompt(productDetails) {
  return `Based on the following product details, recommend an optimized price in USD that would be competitive in the market while maximizing profit potential. Format your response as a number only (e.g., 49.99).

Product name: ${productDetails.name}
Category: ${productDetails.category}
Brand: ${productDetails.brand || 'Not specified'}
Description: ${productDetails.description || 'Not provided'}
Features: ${productDetails.features?.length ? productDetails.features.join(', ') : 'None specified'}
Stock quantity: ${productDetails.countInStock}
Current suggested price: ${productDetails.price || 'Not specified'}

Respond with just the price as a number (no $ sign, no text).`;
}

/**
 * Extract price from Gemini API response text
 */
function extractPrice(priceText, fallbackPrice) {
  // Try to extract just the number from the response
  const priceMatch = priceText.match(/\$?(\d+\.?\d*)/);
  if (priceMatch && priceMatch[1]) {
    return parseFloat(priceMatch[1]);
  }
  
  // If we can't extract a number pattern, try to parse the whole response
  const parsedPrice = parseFloat(priceText);
  if (!isNaN(parsedPrice)) {
    return parsedPrice;
  }
  
  // If all extraction attempts fail, return the fallback price
  console.warn('Could not extract price from Gemini response:', priceText);
  return fallbackPrice;
} 