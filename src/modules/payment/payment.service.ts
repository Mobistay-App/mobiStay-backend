import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

interface PaymentInitiateResponse {
    status: string;
    message: string;
    data: {
        link: string;
    }
}

export class PaymentService {
    private static baseUrl = 'https://api.flutterwave.com/v3';
    private static secretKey = process.env.FLUTTERWAVE_SECRET_KEY;

    /**
     * Initialize a payment
     */
    static async initiatePayment(bookingId: string, amount: number, email: string, name: string, phoneNumber: string) {
        if (!this.secretKey) {
            throw new Error('Flutterwave Secret Key is missing');
        }

        try {
            const tx_ref = bookingId; // Use booking ID as transaction reference for simplicity, or UUID: `${bookingId}_${uuidv4()}`

            // Define your redirect URL. 
            // For mobile deep linking, you might use a custom scheme or a backend endpoint that redirects to the app.
            // Let's use a backend endpoint that can handle the success response and then redirect to the app.
            const redirect_url = `${process.env.API_BASE_URL || 'http://localhost:5000'}/api/payment/callback`;

            const payload = {
                tx_ref,
                amount,
                currency: 'XAF', // Central African CFA Franc
                redirect_url,
                payment_options: 'card,mobilemoneyfrancophone',
                customer: {
                    email,
                    phonenumber: phoneNumber,
                    name,
                },
                customizations: {
                    title: 'Mobistay Booking',
                    description: 'Payment for your stay',
                    logo: 'https://mobistay.com/logo.png', // Replace with valid logo
                }
            };

            const response = await axios.post<PaymentInitiateResponse>(
                `${this.baseUrl}/payments`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            return response.data.data.link;

        } catch (error: any) {
            console.error('Flutterwave Payment Init Error:', error.response?.data || error.message);
            throw new Error('Failed to initiate payment');
        }
    }

    /**
     * Verify a transaction
     */
    static async verifyTransaction(transactionId: string) {
        if (!this.secretKey) {
            throw new Error('Flutterwave Secret Key is missing');
        }

        try {
            const response = await axios.get(
                `${this.baseUrl}/transactions/${transactionId}/verify`,
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`,
                    }
                }
            );

            return response.data.data;

        } catch (error: any) {
            console.error('Flutterwave Verification Error:', error.response?.data || error.message);
            throw new Error('Failed to verify payment');
        }
    }
}
