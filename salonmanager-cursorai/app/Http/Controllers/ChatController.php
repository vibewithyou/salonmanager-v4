<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\ChatMessage;
use App\Models\User;
use App\Models\Appointment;
use Pusher\Pusher;

class ChatController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $conversations = $this->getConversations($user);
        
        return view('chat.index', compact('conversations'));
    }

    public function show($conversationId)
    {
        $user = Auth::user();
        $conversation = $this->getConversation($conversationId, $user);
        
        if (!$conversation) {
            return redirect()->route('chat.index')->with('error', 'Konversation nicht gefunden');
        }
        
        $messages = ChatMessage::where('conversation_id', $conversationId)
            ->orderBy('created_at', 'asc')
            ->get();
        
        return view('chat.show', compact('conversation', 'messages'));
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|string',
            'message' => 'required|string|max:1000',
            'message_type' => 'nullable|string|in:text,image,file',
        ]);

        $user = Auth::user();
        $conversation = $this->getConversation($request->conversation_id, $user);
        
        if (!$conversation) {
            return response()->json(['error' => 'Konversation nicht gefunden'], 404);
        }

        $message = ChatMessage::create([
            'conversation_id' => $request->conversation_id,
            'sender_id' => $user->id,
            'receiver_id' => $conversation['other_user_id'],
            'message' => $request->message,
            'message_type' => $request->message_type ?? 'text',
            'is_read' => false,
        ]);

        // Send real-time notification via Pusher
        $this->broadcastMessage($message);

        return response()->json([
            'message' => $message,
            'timestamp' => $message->created_at,
        ]);
    }

    public function markAsRead(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|string',
        ]);

        $user = Auth::user();
        
        ChatMessage::where('conversation_id', $request->conversation_id)
            ->where('receiver_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }

    public function getUnreadCount()
    {
        $user = Auth::user();
        
        $unreadCount = ChatMessage::where('receiver_id', $user->id)
            ->where('is_read', false)
            ->count();

        return response()->json(['unread_count' => $unreadCount]);
    }

    public function startConversation(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'appointment_id' => 'nullable|exists:appointments,id',
        ]);

        $user = Auth::user();
        $receiver = User::find($request->receiver_id);
        
        if ($user->id === $receiver->id) {
            return response()->json(['error' => 'Du kannst nicht mit dir selbst chatten'], 400);
        }

        // Check if conversation already exists
        $existingConversation = $this->findExistingConversation($user->id, $receiver->id);
        
        if ($existingConversation) {
            return response()->json([
                'conversation_id' => $existingConversation,
                'redirect_url' => route('chat.show', $existingConversation),
            ]);
        }

        // Create new conversation
        $conversationId = $this->generateConversationId($user->id, $receiver->id);
        
        // Create initial message if appointment_id is provided
        if ($request->appointment_id) {
            $appointment = Appointment::find($request->appointment_id);
            $initialMessage = "Hallo! Ich habe einen Termin am {$appointment->start_time->format('d.m.Y H:i')} bei Ihnen.";
            
            ChatMessage::create([
                'conversation_id' => $conversationId,
                'sender_id' => $user->id,
                'receiver_id' => $receiver->id,
                'message' => $initialMessage,
                'message_type' => 'text',
                'is_read' => false,
            ]);
        }

        return response()->json([
            'conversation_id' => $conversationId,
            'redirect_url' => route('chat.show', $conversationId),
        ]);
    }

    public function getConversations($user)
    {
        $conversations = [];
        
        // Get all conversations where user is sender or receiver
        $messages = ChatMessage::where('sender_id', $user->id)
            ->orWhere('receiver_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('conversation_id');

        foreach ($messages as $conversationId => $conversationMessages) {
            $latestMessage = $conversationMessages->first();
            $otherUserId = $latestMessage->sender_id === $user->id 
                ? $latestMessage->receiver_id 
                : $latestMessage->sender_id;
            
            $otherUser = User::find($otherUserId);
            
            $unreadCount = $conversationMessages
                ->where('receiver_id', $user->id)
                ->where('is_read', false)
                ->count();

            $conversations[] = [
                'id' => $conversationId,
                'other_user' => $otherUser,
                'latest_message' => $latestMessage,
                'unread_count' => $unreadCount,
                'updated_at' => $latestMessage->created_at,
            ];
        }

        // Sort by latest message
        usort($conversations, function($a, $b) {
            return $b['updated_at']->compare($a['updated_at']);
        });

        return $conversations;
    }

    private function getConversation($conversationId, $user)
    {
        $message = ChatMessage::where('conversation_id', $conversationId)
            ->where(function($query) use ($user) {
                $query->where('sender_id', $user->id)
                      ->orWhere('receiver_id', $user->id);
            })
            ->first();

        if (!$message) {
            return null;
        }

        $otherUserId = $message->sender_id === $user->id 
            ? $message->receiver_id 
            : $message->sender_id;
        
        $otherUser = User::find($otherUserId);

        return [
            'id' => $conversationId,
            'other_user' => $otherUser,
        ];
    }

    private function findExistingConversation($userId1, $userId2)
    {
        $message = ChatMessage::where(function($query) use ($userId1, $userId2) {
            $query->where('sender_id', $userId1)
                  ->where('receiver_id', $userId2);
        })->orWhere(function($query) use ($userId1, $userId2) {
            $query->where('sender_id', $userId2)
                  ->where('receiver_id', $userId1);
        })->first();

        return $message ? $message->conversation_id : null;
    }

    private function generateConversationId($userId1, $userId2)
    {
        $ids = [$userId1, $userId2];
        sort($ids);
        return 'conv_' . implode('_', $ids) . '_' . time();
    }

    private function broadcastMessage($message)
    {
        try {
            $pusher = new Pusher(
                config('broadcasting.connections.pusher.key'),
                config('broadcasting.connections.pusher.secret'),
                config('broadcasting.connections.pusher.app_id'),
                config('broadcasting.connections.pusher.options')
            );

            $pusher->trigger(
                'chat-channel',
                'new-message',
                [
                    'message' => $message,
                    'sender' => $message->sender,
                    'conversation_id' => $message->conversation_id,
                ]
            );
        } catch (\Exception $e) {
            \Log::error('Pusher broadcast failed: ' . $e->getMessage());
        }
    }

    public function uploadFile(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|string',
            'file' => 'required|file|max:10240', // 10MB max
            'message_type' => 'required|string|in:image,file',
        ]);

        $user = Auth::user();
        $conversation = $this->getConversation($request->conversation_id, $user);
        
        if (!$conversation) {
            return response()->json(['error' => 'Konversation nicht gefunden'], 404);
        }

        $file = $request->file('file');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('chat-files', $fileName, 'public');

        $message = ChatMessage::create([
            'conversation_id' => $request->conversation_id,
            'sender_id' => $user->id,
            'receiver_id' => $conversation['other_user_id'],
            'message' => $filePath,
            'message_type' => $request->message_type,
            'is_read' => false,
        ]);

        $this->broadcastMessage($message);

        return response()->json([
            'message' => $message,
            'file_url' => asset('storage/' . $filePath),
        ]);
    }

    public function getOnlineUsers()
    {
        $user = Auth::user();
        $salon = $user->salon;
        
        if (!$salon) {
            return response()->json(['online_users' => []]);
        }

        $onlineUsers = User::where('salon_id', $salon->id)
            ->where('is_active', true)
            ->where('last_activity_at', '>', now()->subMinutes(5))
            ->where('id', '!=', $user->id)
            ->get(['id', 'name', 'role']);

        return response()->json(['online_users' => $onlineUsers]);
    }

    public function updateActivity()
    {
        $user = Auth::user();
        $user->update(['last_activity_at' => now()]);
        
        return response()->json(['success' => true]);
    }
} 