const axios = require('axios');

//  የክፍያ ሊንክ መፍጠር 
const initializeChapaPayment = async ({ amount, currency = 'ETB', email, first_name, last_name, tx_ref, callback_url }) => {
  try {
    const response = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      {
        amount,
        currency,
        email: email || 'customer@example.com',
        first_name: first_name || 'Customer',
        last_name: last_name || 'User',
        tx_ref,
        callback_url: callback_url || process.env.CHAPA_CALLBACK_URL,
        return_url: 'http://localhost:3000/payment-success',
        customization: {
          title: 'Payment Test',
          description: 'Testing transaction'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.log('--- CHAPA INITIALIZE ERROR ---');
    console.log(error.response?.data || error.message);
    console.log('------------------------------');

    throw new Error(error.response?.data?.message || error.message || 'Chapa API መገናኘት አልተቻለም');
  }
};

// Verify Payment
const verifyChapaPayment = async (tx_ref) => {
  try {
    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.log('--- CHAPA VERIFY ERROR ---');
    console.log(error.response?.data || error.message);
    console.log('--------------------------');

    throw new Error(error.response?.data?.message || error.message || 'ክፍያውን ማረጋገጥ አልተቻለም');
  }
};

// ፋይሉ መጨረሻ ላይ ሁለቱም Export መደረጋቸውን አረጋግጥ
module.exports = {
  initializeChapaPayment,
  verifyChapaPayment
};