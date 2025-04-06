# Price Optimization Feature

## Overview

This feature allows sellers to optimize their product prices using Google's Gemini AI model. The optimization considers product details such as name, category, brand, features, and current stock to suggest a competitive price that maximizes profit potential.

## How It Works

1. **User Experience**:
   - When adding or editing a product, sellers see a new "Price Optimization" section at the end of the form
   - Clicking "Optimize Price" sends the product details to the Gemini API
   - The suggested price appears with an option to apply it to the product or dismiss it

2. **Technical Implementation**:
   - The feature uses the Gemini 2.0 Flash API to generate price suggestions
   - Product details are sent as a structured prompt to the AI model
   - The response is parsed to extract the numerical price value
   - Error handling ensures the app continues to function if the API is unavailable

## Technical Components

### Frontend Files:

- **src/services/priceOptimizer.ts**: Core service with the Gemini API integration
- **src/pages/ProductEditor.tsx**: UI implementation in the product form

### API Configuration:

```typescript
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";
const GEMINI_API_KEY = "AIzaSyC_uXWIh-_J0xOZq9MGtS9pMy5a0zEZXNo";
```

## How to Use

1. Navigate to "Add New Product" or edit an existing product
2. Fill in the product details (name, category, description, etc.)
3. Scroll to the "Price Optimization" section
4. Click the "Optimize Price" button
5. If you like the suggested price, click "Apply" to use it

## Benefits for Sellers

- **Data-Driven Pricing**: Leverages AI to suggest market-competitive prices
- **Maximize Profits**: Find the optimal balance between price and expected sales
- **Time-Saving**: Eliminates manual market research for pricing
- **Competitive Edge**: Keep prices aligned with market trends and competitor pricing

## Example Prompt

The AI receives this prompt format:

```
Based on the following product details, recommend an optimized price in USD that would be competitive in the market while maximizing profit potential. Format your response as a number only (e.g., 49.99).

Product name: Wireless Noise-Cancelling Headphones
Category: Electronics
Brand: AudioTech
Description: Premium wireless headphones with active noise cancellation, 30-hour battery life, and memory foam ear cups.
Features: Bluetooth 5.0, Active Noise Cancellation, 30-hour battery, Memory foam cushions, Quick charge
Stock quantity: 50
Current suggested price: 149.99

Respond with just the price as a number (no $ sign, no text).
```

## Future Enhancements

- Add historical data from previous sales to improve pricing recommendations
- Incorporate competitor pricing data
- Add batch price optimization for multiple products
- Include seasonal pricing adjustment recommendations 