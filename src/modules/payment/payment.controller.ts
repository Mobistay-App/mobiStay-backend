import { Request, Response } from 'express';
import { PaymentService } from './payment.service.js';
import { prisma } from '../../shared/prisma.js';

export class PaymentController {

    /**
     * Handle the redirect callback from Flutterwave
     * 1. Verifies the transaction
     * 2. Updates the booking status
     * 3. Redirects to the mobile app deep link
     */
    static async handleCallback(req: Request, res: Response) {
        const { status, tx_ref, transaction_id } = req.query;

        console.log('Payment Callback Received:', { status, tx_ref, transaction_id });

        if (status === 'cancelled' || status === 'failed') {
            // Redirect to mobile app failed screen
            // TODO: Replace with your actual app scheme
            return res.redirect('mobistaymobile://payment-failed');
        }

        if (status === 'successful' && typeof transaction_id === 'string') {
            try {
                // Verify against Flutterwave API
                const verification = await PaymentService.verifyTransaction(transaction_id);

                if (verification.status === 'successful' && verification.amount >= 0) {
                    // Success! Update Booking
                    // tx_ref was set to bookingId in initiatePayment
                    const bookingId = tx_ref as string;

                    await prisma.booking.update({
                        where: { id: bookingId },
                        data: {
                            status: 'CONFIRMED',
                            paymentId: transaction_id
                        }
                    });

                    console.log(`✅ Booking ${bookingId} CONFIRMED via Payment ${transaction_id}`);

                    // Redirect to success screen in mobile app
                    return res.redirect(`mobistaymobile://payment-success?bookingId=${bookingId}`);
                } else {
                    console.error('❌ Payment verification failed:', verification);
                    return res.redirect('mobistaymobile://payment-failed?reason=verification_failed');
                }

            } catch (error) {
                console.error('❌ Error verifying payment:', error);
                return res.redirect('mobistaymobile://payment-failed?reason=server_error');
            }
        }

        res.status(400).send('Invalid callback parameters');
    }

    /**
     * Webhook Handler (Optional but recommended for reliability)
     */
    static async handleWebhook(req: Request, res: Response) {
        // Retrieve the signature from the header
        const hash = req.headers['verif-hash'];

        if (!hash || hash !== process.env.FLUTTERWAVE_WEBHOOK_HASH) {
            // Silently ignore invalid requests
            res.status(401).end();
            return;
        }

        const payload = req.body;
        console.log('🔔 Flutterwave Webhook:', payload);

        // Process 'charge.completed' event
        if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
            const bookingId = payload.data.tx_ref;
            const transactionId = String(payload.data.id);

            try {
                await prisma.booking.update({
                    where: { id: bookingId },
                    data: {
                        status: 'CONFIRMED',
                        paymentId: transactionId
                    }
                });
                console.log(`✅ Webhook confirmed booking ${bookingId}`);
            } catch (err) {
                console.error('Webhook DB update failed:', err);
            }
        }

        res.status(200).end();
    }
}
