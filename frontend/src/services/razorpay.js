// Backend API base URL - adjust this to match your backend server
const API_BASE_URL = 'http://localhost:5001'; // or whatever port your backend is running on

/* 
RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string (optional)
  handler: function(response)
  prefill: {
    name: string
    email: string
    contact: string
  }
  theme: {
    color: string
  }
}

RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string (optional)
  razorpay_signature: string (optional)
}

PaymentSuccessCallback: function(orderId: string)
*/

const RAZORPAY_KEY_ID = 'rzp_test_Bv9HsrboraxaMb';

export const createRazorpayOrder = async (amount, currency = 'INR') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, currency }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create order');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

// Check if Razorpay is loaded
export const isRazorpayLoaded = () => {
  return typeof window.Razorpay !== 'undefined';
};

// Initialize a Razorpay payment
export const initializeRazorpayPayment = (
  orderId,
  amount,
  items,
  user,
  onSuccess
) => {
  // Check if Razorpay is available
  if (!isRazorpayLoaded()) {
    console.error('Razorpay SDK not available');
    alert('Payment gateway is not available. Please try again later.');
    return;
  }
  
  const options = {
    key: RAZORPAY_KEY_ID,
    amount: amount * 100, // Razorpay expects amount in paise
    currency: 'INR',
    name: 'Beam',
    description: `Order for ${items.length} items`,
    order_id: orderId,
    handler: async (response) => {
      // Handle successful payment
      console.log('Payment successful:', response);
      
      // Call the success callback if provided
      if (onSuccess && response.razorpay_order_id) {
        onSuccess(response.razorpay_order_id);
      } else if (onSuccess && response.razorpay_payment_id) {
        // If no order ID, use payment ID as fallback
        onSuccess(response.razorpay_payment_id);
      }
    },
    prefill: {
      name: user.name,
      email: user.email,
      contact: user.phone || '',
    },
    theme: {
      color: '#4F46E5', // Indigo color matching your theme
    },
  };

  try {
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    console.error('Error opening Razorpay:', error);
    alert('There was an error initializing the payment gateway. Please try again.');
  }
};

export const verifyPayment = async (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payment/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
      }),
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

// Test the Razorpay API connection
export const testRazorpayConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payment/test-connection`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return { success: false, message: 'Failed to connect to payment API' };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error testing Razorpay connection:', error);
    return { success: false, message: 'Network error' };
  }
}; 