import Razorpay from 'razorpay';
import dotenv from 'dotenv/config'; // or however you load env vars


export const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});