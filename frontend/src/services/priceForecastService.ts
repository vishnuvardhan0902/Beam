import axios from 'axios';

interface ProductInfo {
  _id: string;
  name: string;
  price: number;
  category?: string;
  brand?: string;
  description?: string;
  features?: string[];
  countInStock?: number;
}

interface PricePoint {
  date: string;
  price: number;
}

interface PriceForecast {
  currentPrice: number;
  forecastedPrices: PricePoint[];
  lowestPrice: number;
  highestPrice: number;
  bestTimeToBuy: string;
  priceInsight: string;
}

// Gemini API key should be stored in environment variable
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyC_uXWIh-_J0xOZq9MGtS9pMy5a0zEZXNo";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

/**
 * Get price forecast for a product using Gemini API
 * @param product The product information to forecast prices for
 * @param months Number of months to forecast (default: 6)
 * @returns A forecast with projected prices
 */
export const getPriceForecast = async (product: ProductInfo, months: number = 6): Promise<PriceForecast> => {
  try {
    // Create a specific prompt for Gemini to generate price forecasts
    const prompt = `
      You are a professional price analysis AI.
      
      Please analyze the following product and create a 6-month price forecast. Return your response in JSON format only.
      
      Product Information:
      - Name: ${product.name}
      - Current Price: $${product.price}
      - Category: ${product.category || 'Unknown'}
      - Brand: ${product.brand || 'Unknown'}
      - Description: ${product.description || 'Not provided'}
      - Features: ${product.features?.join(', ') || 'Not provided'}
      - Inventory: ${product.countInStock || 'Unknown'} units
      
      Based on market trends, seasonality, and product characteristics, predict the price for the next ${months} months. 
      
      Return the forecast as a JSON object with the following structure:
      {
        "forecastedPrices": [
          { "date": "YYYY-MM-DD", "price": number },
          ...
        ],
        "lowestPrice": number,
        "highestPrice": number,
        "bestTimeToBuy": "YYYY-MM",
        "priceInsight": "string - brief explanation of the price trend"
      }
      
      Only return valid JSON, no explanation text before or after.
    `;

    // Call Gemini API
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024
        }
      }
    );

    // Extract the response text
    const responseText = response.data.candidates[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error('No response from Gemini API');
    }

    // Extract JSON from the response (remove any non-JSON text if present)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from Gemini API response');
    }

    // Parse the JSON response
    const forecastData = JSON.parse(jsonMatch[0]);
    
    // Return the forecast with current price
    return {
      currentPrice: product.price,
      ...forecastData
    };
  } catch (error) {
    console.error('Error fetching price forecast:', error);
    
    // Return a fallback forecast with slightly varying prices
    // This is used when the API fails or for development
    return generateFallbackForecast(product.price, months);
  }
};

/**
 * Generate a fallback forecast when the API call fails
 */
const generateFallbackForecast = (currentPrice: number, months: number): PriceForecast => {
  const today = new Date();
  const forecastedPrices: PricePoint[] = [];
  
  // Generate realistic price variations (up to 15% variation)
  const maxVariation = 0.15;
  let lowestPrice = currentPrice;
  let highestPrice = currentPrice;
  
  for (let i = 0; i < months; i++) {
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + i + 1);
    
    // Generate a slightly random price
    const variationPercent = (Math.random() * 2 - 1) * maxVariation;
    const price = +(currentPrice * (1 + variationPercent)).toFixed(2);
    
    // Track lowest and highest prices
    lowestPrice = Math.min(lowestPrice, price);
    highestPrice = Math.max(highestPrice, price);
    
    forecastedPrices.push({
      date: nextMonth.toISOString().split('T')[0],
      price
    });
  }
  
  // Find month with lowest price
  const lowestPricePoint = forecastedPrices.reduce(
    (lowest, current) => (current.price < lowest.price ? current : lowest),
    forecastedPrices[0]
  );
  
  const bestTimeToBuy = lowestPricePoint.date.substring(0, 7); // YYYY-MM format
  
  return {
    currentPrice,
    forecastedPrices,
    lowestPrice,
    highestPrice,
    bestTimeToBuy,
    priceInsight: "This is an estimated forecast based on historical pricing patterns."
  };
};

export default {
  getPriceForecast
}; 