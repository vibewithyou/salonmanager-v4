<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Service;

class AiController extends Controller
{
    public function getHairstyleSuggestions(Request $request)
    {
        $request->validate([
            'face_shape' => 'required|string|in:oval,round,square,heart,diamond',
            'hair_type' => 'required|string|in:straight,wavy,curly,coily',
            'hair_length' => 'required|string|in:short,medium,long',
            'age' => 'required|integer|min:16|max:80',
            'gender' => 'required|string|in:male,female,other',
            'preferences' => 'nullable|array',
        ]);

        try {
            $prompt = $this->buildHairstylePrompt($request->all());
            
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.openai.api_key'),
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Du bist ein erfahrener Friseur und Stylist. Gib detaillierte, praktische Vorschläge für Frisuren basierend auf den gegebenen Parametern.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 1000,
                'temperature' => 0.7,
            ]);

            if ($response->successful()) {
                $suggestions = $response->json()['choices'][0]['message']['content'];
                
                return response()->json([
                    'suggestions' => $suggestions,
                    'face_shape' => $request->face_shape,
                    'hair_type' => $request->hair_type,
                    'hair_length' => $request->hair_length,
                ]);
            }

            return response()->json(['error' => 'AI service unavailable'], 503);
        } catch (\Exception $e) {
            Log::error('AI hairstyle suggestion failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get suggestions'], 500);
        }
    }

    private function buildHairstylePrompt($data)
    {
        return "Erstelle 3-5 spezifische Frisuren-Vorschläge für eine Person mit folgenden Eigenschaften:
        
        Gesichtsform: {$data['face_shape']}
        Haartyp: {$data['hair_type']}
        Haarlänge: {$data['hair_length']}
        Alter: {$data['age']} Jahre
        Geschlecht: {$data['gender']}
        
        Zusätzliche Präferenzen: " . ($data['preferences'] ? implode(', ', $data['preferences']) : 'Keine spezifischen Präferenzen') . "
        
        Für jeden Vorschlag gib an:
        - Name der Frisur
        - Beschreibung des Stils
        - Pflegeaufwand (niedrig/mittel/hoch)
        - Styling-Tipps
        - Passende Produkte
        - Geschätzte Behandlungsdauer";
    }

    public function analyzeReviews(Request $request)
    {
        $request->validate([
            'reviews' => 'required|array',
            'reviews.*.text' => 'required|string',
            'reviews.*.rating' => 'required|integer|min:1|max:5',
        ]);

        try {
            $reviews = collect($request->reviews);
            $analysisPrompt = $this->buildReviewAnalysisPrompt($reviews);
            
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.openai.api_key'),
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Du bist ein Experte für Kundenbewertungen und Sentiment-Analyse. Analysiere die gegebenen Bewertungen und gib strukturierte Erkenntnisse zurück.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $analysisPrompt
                    ]
                ],
                'max_tokens' => 1500,
                'temperature' => 0.3,
            ]);

            if ($response->successful()) {
                $analysis = $response->json()['choices'][0]['message']['content'];
                
                return response()->json([
                    'analysis' => $analysis,
                    'total_reviews' => $reviews->count(),
                    'average_rating' => $reviews->avg('rating'),
                    'sentiment_score' => $this->calculateSentimentScore($reviews),
                ]);
            }

            return response()->json(['error' => 'AI analysis service unavailable'], 503);
        } catch (\Exception $e) {
            Log::error('AI review analysis failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to analyze reviews'], 500);
        }
    }

    private function buildReviewAnalysisPrompt($reviews)
    {
        $reviewsText = $reviews->map(function($review) {
            return "Bewertung: {$review['rating']}/5 - {$review['text']}";
        })->implode("\n");

        return "Analysiere die folgenden Kundenbewertungen und gib eine strukturierte Analyse zurück:

        Bewertungen:
        {$reviewsText}

        Bitte analysiere:
        1. Gesamtsentiment (positiv/neutral/negativ)
        2. Häufigste positive Aspekte
        3. Häufigste negative Aspekte
        4. Verbesserungsvorschläge
        5. Trends in den Bewertungen
        6. Empfehlungen für das Team

        Gib die Antwort in JSON-Format zurück.";
    }

    private function calculateSentimentScore($reviews)
    {
        $positiveWords = ['gut', 'toll', 'super', 'perfekt', 'zufrieden', 'empfehlen', 'freundlich', 'professionell'];
        $negativeWords = ['schlecht', 'schlimm', 'enttäuscht', 'unzufrieden', 'teuer', 'langsam', 'unfreundlich'];
        
        $score = 0;
        $totalWords = 0;
        
        foreach ($reviews as $review) {
            $words = strtolower($review['text']);
            $totalWords += str_word_count($words);
            
            foreach ($positiveWords as $word) {
                $score += substr_count($words, $word);
            }
            
            foreach ($negativeWords as $word) {
                $score -= substr_count($words, $word);
            }
        }
        
        return $totalWords > 0 ? ($score / $totalWords) * 100 : 0;
    }

    public function getAppointmentSuggestions(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'preferred_date' => 'required|date|after:today',
            'service_id' => 'nullable|exists:services,id',
            'duration' => 'nullable|integer|min:30|max:480',
        ]);

        try {
            $user = User::find($request->user_id);
            $service = $request->service_id ? Service::find($request->service_id) : null;
            $duration = $request->duration ?? ($service ? $service->duration : 60);
            
            $suggestions = $this->generateAppointmentSuggestions($user, $request->preferred_date, $duration);
            
            return response()->json([
                'suggestions' => $suggestions,
                'user_preferences' => $user->preferences,
                'service' => $service,
            ]);
        } catch (\Exception $e) {
            Log::error('AI appointment suggestions failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate suggestions'], 500);
        }
    }

    private function generateAppointmentSuggestions($user, $preferredDate, $duration)
    {
        $suggestions = [];
        $preferredTime = $user->preferences['preferred_time'] ?? '10:00';
        
        // Generate suggestions for the preferred date and surrounding dates
        for ($dayOffset = -2; $dayOffset <= 2; $dayOffset++) {
            $date = date('Y-m-d', strtotime($preferredDate . " {$dayOffset} days"));
            
            // Check if it's a working day (Monday-Friday)
            $dayOfWeek = date('N', strtotime($date));
            if ($dayOfWeek >= 1 && $dayOfWeek <= 5) {
                $timeSlots = $this->generateTimeSlots($date, $preferredTime, $duration);
                $suggestions[] = [
                    'date' => $date,
                    'day_name' => date('l', strtotime($date)),
                    'time_slots' => $timeSlots,
                    'priority' => $dayOffset == 0 ? 'high' : ($dayOffset == 1 || $dayOffset == -1 ? 'medium' : 'low'),
                ];
            }
        }
        
        return $suggestions;
    }

    private function generateTimeSlots($date, $preferredTime, $duration)
    {
        $slots = [];
        $startHour = 9; // Salon opens at 9 AM
        $endHour = 18; // Salon closes at 6 PM
        
        $preferredHour = (int) explode(':', $preferredTime)[0];
        
        // Generate slots around preferred time
        for ($hour = max($startHour, $preferredHour - 2); $hour <= min($endHour, $preferredHour + 2); $hour++) {
            for ($minute = 0; $minute < 60; $minute += 30) {
                $time = sprintf('%02d:%02d', $hour, $minute);
                $slots[] = [
                    'time' => $time,
                    'available' => true,
                    'duration' => $duration,
                ];
            }
        }
        
        return $slots;
    }

    public function chatWithAi(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'context' => 'nullable|array',
        ]);

        try {
            $context = $request->context ?? [];
            $user = auth()->user();
            
            $prompt = $this->buildChatPrompt($request->message, $context, $user);
            
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.openai.api_key'),
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Du bist ein hilfreicher Assistent für ein Friseursalon-Management-System. Du hilfst Kunden bei Terminbuchungen, Service-Auswahl und allgemeinen Fragen rund um den Salon.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 500,
                'temperature' => 0.7,
            ]);

            if ($response->successful()) {
                $aiResponse = $response->json()['choices'][0]['message']['content'];
                
                return response()->json([
                    'response' => $aiResponse,
                    'timestamp' => now(),
                    'context' => $context,
                ]);
            }

            return response()->json(['error' => 'AI chat service unavailable'], 503);
        } catch (\Exception $e) {
            Log::error('AI chat failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to process message'], 500);
        }
    }

    private function buildChatPrompt($message, $context, $user)
    {
        $userInfo = "Benutzer: {$user->name} (ID: {$user->id})";
        $contextInfo = $context ? "Kontext: " . json_encode($context) : "Kein spezifischer Kontext";
        
        return "{$userInfo}
        {$contextInfo}
        
        Benutzer-Nachricht: {$message}
        
        Antworte hilfreich und freundlich. Wenn es um Terminbuchungen geht, gib konkrete Anweisungen. Bei Service-Fragen, erkläre die Optionen klar.";
    }
} 