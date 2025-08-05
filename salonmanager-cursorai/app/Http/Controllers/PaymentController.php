<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Appointment;
use App\Models\Order;
use App\Models\User;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Customer;

class PaymentController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function createPaymentIntent(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'currency' => 'required|string|size:3',
            'appointment_id' => 'nullable|exists:appointments,id',
            'order_id' => 'nullable|exists:orders,id',
        ]);

        try {
            $amount = $request->amount * 100; // Convert to cents
            
            $paymentIntent = PaymentIntent::create([
                'amount' => $amount,
                'currency' => $request->currency,
                'metadata' => [
                    'appointment_id' => $request->appointment_id,
                    'order_id' => $request->order_id,
                    'user_id' => auth()->id(),
                ],
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            return response()->json([
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Payment intent creation failed: ' . $e->getMessage());
            return response()->json(['error' => 'Payment creation failed'], 500);
        }
    }

    public function confirmPayment(Request $request)
    {
        $request->validate([
            'payment_intent_id' => 'required|string',
            'appointment_id' => 'nullable|exists:appointments,id',
            'order_id' => 'nullable|exists:orders,id',
        ]);

        try {
            $paymentIntent = PaymentIntent::retrieve($request->payment_intent_id);
            
            if ($paymentIntent->status === 'succeeded') {
                // Update appointment or order
                if ($request->appointment_id) {
                    $appointment = Appointment::find($request->appointment_id);
                    $appointment->update([
                        'payment_status' => 'paid',
                        'payment_method' => 'stripe',
                    ]);
                }
                
                if ($request->order_id) {
                    $order = Order::find($request->order_id);
                    $order->update([
                        'payment_status' => 'paid',
                        'payment_method' => 'stripe',
                    ]);
                }

                return response()->json(['success' => true]);
            }

            return response()->json(['error' => 'Payment not completed'], 400);
        } catch (\Exception $e) {
            Log::error('Payment confirmation failed: ' . $e->getMessage());
            return response()->json(['error' => 'Payment confirmation failed'], 500);
        }
    }

    public function createPayPalOrder(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'currency' => 'required|string|size:3',
            'appointment_id' => 'nullable|exists:appointments,id',
            'order_id' => 'nullable|exists:orders,id',
        ]);

        // PayPal API integration would go here
        // For now, return a mock response
        return response()->json([
            'order_id' => 'PAYPAL_' . uniqid(),
            'status' => 'created',
        ]);
    }

    public function createSEPAMandate(Request $request)
    {
        $request->validate([
            'iban' => 'required|string',
            'bic' => 'required|string',
            'account_holder' => 'required|string',
            'mandate_reference' => 'required|string',
        ]);

        // SEPA mandate creation logic
        $mandate = [
            'id' => uniqid('SEPA_'),
            'iban' => $request->iban,
            'bic' => $request->bic,
            'account_holder' => $request->account_holder,
            'mandate_reference' => $request->mandate_reference,
            'status' => 'pending',
            'created_at' => now(),
        ];

        // Store mandate in database
        // Mandate::create($mandate);

        return response()->json([
            'mandate_id' => $mandate['id'],
            'status' => 'created',
        ]);
    }

    public function webhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload, $sigHeader, $endpointSecret
            );
        } catch (\UnexpectedValueException $e) {
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        switch ($event->type) {
            case 'payment_intent.succeeded':
                $this->handlePaymentSucceeded($event->data->object);
                break;
            case 'payment_intent.payment_failed':
                $this->handlePaymentFailed($event->data->object);
                break;
        }

        return response()->json(['status' => 'success']);
    }

    private function handlePaymentSucceeded($paymentIntent)
    {
        $appointmentId = $paymentIntent->metadata->appointment_id ?? null;
        $orderId = $paymentIntent->metadata->order_id ?? null;

        if ($appointmentId) {
            $appointment = Appointment::find($appointmentId);
            if ($appointment) {
                $appointment->update([
                    'payment_status' => 'paid',
                    'payment_method' => 'stripe',
                ]);
            }
        }

        if ($orderId) {
            $order = Order::find($orderId);
            if ($order) {
                $order->update([
                    'payment_status' => 'paid',
                    'payment_method' => 'stripe',
                ]);
            }
        }
    }

    private function handlePaymentFailed($paymentIntent)
    {
        Log::warning('Payment failed for intent: ' . $paymentIntent->id);
        
        $appointmentId = $paymentIntent->metadata->appointment_id ?? null;
        $orderId = $paymentIntent->metadata->order_id ?? null;

        if ($appointmentId) {
            $appointment = Appointment::find($appointmentId);
            if ($appointment) {
                $appointment->update([
                    'payment_status' => 'failed',
                ]);
            }
        }

        if ($orderId) {
            $order = Order::find($orderId);
            if ($order) {
                $order->update([
                    'payment_status' => 'failed',
                ]);
            }
        }
    }

    public function getPaymentMethods()
    {
        $user = auth()->user();
        
        return response()->json([
            'payment_methods' => [
                'stripe' => [
                    'enabled' => true,
                    'methods' => ['card', 'klarna', 'apple_pay', 'google_pay'],
                ],
                'paypal' => [
                    'enabled' => true,
                    'methods' => ['paypal'],
                ],
                'sepa' => [
                    'enabled' => true,
                    'methods' => ['sepa_direct_debit'],
                ],
                'cash' => [
                    'enabled' => true,
                    'methods' => ['cash'],
                ],
            ],
        ]);
    }
} 