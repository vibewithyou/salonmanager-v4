<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'SalonManager') }} - @yield('title', 'Dashboard')</title>

    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#7C3AED">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="SalonManager">
    <link rel="apple-touch-icon" href="{{ asset('images/icons/icon-192x192.png') }}">

    <!-- Manifest -->
    <link rel="manifest" href="{{ asset('manifest.json') }}">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet" />

    <!-- Styles -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    
    <!-- Additional Styles -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    
    <!-- Custom Styles -->
    <style>
        [x-cloak] { display: none !important; }
        
        .dark {
            color-scheme: dark;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 6px;
        }
        
        ::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
        }
        
        /* Dark mode scrollbar */
        .dark ::-webkit-scrollbar-track {
            background: #374151;
        }
        
        .dark ::-webkit-scrollbar-thumb {
            background: #6b7280;
        }
        
        .dark ::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
        }
    </style>

    @stack('styles')
</head>
<body class="h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-200" 
      x-data="{ 
          sidebarOpen: false, 
          theme: localStorage.getItem('theme') || 'light',
          language: localStorage.getItem('language') || 'de'
      }" 
      x-init="
          $watch('theme', value => {
              localStorage.setItem('theme', value);
              if (value === 'dark') {
                  document.documentElement.classList.add('dark');
              } else {
                  document.documentElement.classList.remove('dark');
              }
          });
          
          if (theme === 'dark') {
              document.documentElement.classList.add('dark');
          }
      ">

    <!-- Loading Spinner -->
    <div id="loading-spinner" class="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center" style="display: none;">
        <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
    </div>

    <!-- Navigation -->
    <nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <!-- Left side -->
                <div class="flex items-center">
                    <!-- Mobile menu button -->
                    <button @click="sidebarOpen = true" class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <!-- Logo -->
                    <div class="flex-shrink-0 flex items-center">
                        <a href="{{ route('dashboard') }}" class="flex items-center space-x-2">
                            <div class="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                                <i class="fas fa-cut text-white text-sm"></i>
                            </div>
                            <span class="text-xl font-bold text-gray-900 dark:text-white">SalonManager</span>
                        </a>
                    </div>
                </div>

                <!-- Right side -->
                <div class="flex items-center space-x-4">
                    <!-- Theme Toggle -->
                    <button @click="theme = theme === 'light' ? 'dark' : 'light'" 
                            class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <i class="fas fa-sun" x-show="theme === 'dark'"></i>
                        <i class="fas fa-moon" x-show="theme === 'light'"></i>
                    </button>

                    <!-- Language Toggle -->
                    <div class="relative" x-data="{ open: false }">
                        <button @click="open = !open" 
                                class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <i class="fas fa-globe"></i>
                        </button>
                        
                        <div x-show="open" @click.away="open = false" 
                             class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                            <a href="#" @click="language = 'de'; open = false" 
                               class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                🇩🇪 Deutsch
                            </a>
                            <a href="#" @click="language = 'en'; open = false" 
                               class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                🇺🇸 English
                            </a>
                            <a href="#" @click="language = 'fr'; open = false" 
                               class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                🇫🇷 Français
                            </a>
                        </div>
                    </div>

                    <!-- Notifications -->
                    <div class="relative" x-data="{ open: false }">
                        <button @click="open = !open" 
                                class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 relative">
                            <i class="fas fa-bell"></i>
                            @if(auth()->check() && auth()->user()->hasUnreadNotifications())
                                <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {{ auth()->user()->getUnreadNotificationsCount() }}
                                </span>
                            @endif
                        </button>
                        
                        <div x-show="open" @click.away="open = false" 
                             class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 max-h-96 overflow-y-auto">
                            @if(auth()->check())
                                @forelse(auth()->user()->notifications()->latest()->take(5)->get() as $notification)
                                    <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                        <div class="flex items-start">
                                            <div class="flex-shrink-0">
                                                <i class="fas fa-info-circle text-blue-500"></i>
                                            </div>
                                            <div class="ml-3 flex-1">
                                                <p class="text-sm text-gray-900 dark:text-gray-300">
                                                    {{ $notification->data['message'] ?? 'Neue Benachrichtigung' }}
                                                </p>
                                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {{ $notification->created_at->diffForHumans() }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                @empty
                                    <div class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                        Keine neuen Benachrichtigungen
                                    </div>
                                @endforelse
                            @endif
                        </div>
                    </div>

                    <!-- User Menu -->
                    @auth
                        <div class="relative" x-data="{ open: false }">
                            <button @click="open = !open" 
                                    class="flex items-center space-x-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <img class="h-8 w-8 rounded-full" src="{{ auth()->user()->avatar_url }}" alt="{{ auth()->user()->name }}">
                                <span class="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {{ auth()->user()->name }}
                                </span>
                                <i class="fas fa-chevron-down text-xs"></i>
                            </button>
                            
                            <div x-show="open" @click.away="open = false" 
                                 class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                                <a href="{{ route('profile.show') }}" 
                                   class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <i class="fas fa-user mr-2"></i> Profil
                                </a>
                                <a href="{{ route('settings.index') }}" 
                                   class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <i class="fas fa-cog mr-2"></i> Einstellungen
                                </a>
                                <hr class="my-1 border-gray-200 dark:border-gray-700">
                                <form method="POST" action="{{ route('logout') }}">
                                    @csrf
                                    <button type="submit" 
                                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <i class="fas fa-sign-out-alt mr-2"></i> Abmelden
                                    </button>
                                </form>
                            </div>
                        </div>
                    @else
                        <a href="{{ route('login') }}" 
                           class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                            Anmelden
                        </a>
                    @endauth
                </div>
            </div>
        </div>
    </nav>

    <!-- Sidebar -->
    <div class="lg:hidden" x-show="sidebarOpen" x-transition:enter="transition-opacity ease-linear duration-300" 
         x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100" 
         x-transition:leave="transition-opacity ease-linear duration-300" 
         x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0">
        <div class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75" @click="sidebarOpen = false"></div>
    </div>

    <div class="lg:hidden" x-show="sidebarOpen" x-transition:enter="transition ease-in-out duration-300 transform" 
         x-transition:enter-start="-translate-x-full" x-transition:enter-end="translate-x-0" 
         x-transition:leave="transition ease-in-out duration-300 transform" 
         x-transition:leave-start="translate-x-0" x-transition:leave-end="-translate-x-full">
        <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg">
            @include('layouts.sidebar')
        </div>
    </div>

    <!-- Desktop Sidebar -->
    <div class="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div class="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            @include('layouts.sidebar')
        </div>
    </div>

    <!-- Main Content -->
    <div class="lg:pl-64 flex flex-col flex-1">
        <main class="flex-1">
            <!-- Page Header -->
            @hasSection('header')
                <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        @yield('header')
                    </div>
                </div>
            @endif

            <!-- Page Content -->
            <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                @if(session('success'))
                    <div class="mb-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-md">
                        {{ session('success') }}
                    </div>
                @endif

                @if(session('error'))
                    <div class="mb-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md">
                        {{ session('error') }}
                    </div>
                @endif

                @if($errors->any())
                    <div class="mb-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md">
                        <ul class="list-disc list-inside">
                            @foreach($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                @yield('content')
            </div>
        </main>
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://unpkg.com/leaflet@1.9.0/dist/leaflet.js"></script>
    <script src="https://js.pusher.com/8.2.0/pusher.min.js"></script>
    
    <script>
        // Initialize global functions
        window.SalonManager = {
            showLoading: function() {
                document.getElementById('loading-spinner').style.display = 'flex';
            },
            hideLoading: function() {
                document.getElementById('loading-spinner').style.display = 'none';
            },
            showConfirm: function(message, callback) {
                Swal.fire({
                    title: 'Bestätigung',
                    text: message,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Ja',
                    cancelButtonText: 'Nein',
                    reverseButtons: true
                }).then((result) => {
                    if (result.isConfirmed && callback) {
                        callback();
                    }
                });
            },
            showSuccess: function(message) {
                Swal.fire({
                    title: 'Erfolg!',
                    text: message,
                    icon: 'success',
                    timer: 3000,
                    showConfirmButton: false
                });
            },
            showError: function(message) {
                Swal.fire({
                    title: 'Fehler!',
                    text: message,
                    icon: 'error'
                });
            }
        };

        // Initialize Pusher for real-time features
        @if(config('broadcasting.default') === 'pusher')
            const pusher = new Pusher('{{ config('broadcasting.connections.pusher.key') }}', {
                cluster: '{{ config('broadcasting.connections.pusher.options.cluster') }}'
            });
            
            @auth
                const channel = pusher.subscribe('private-user.{{ auth()->id() }}');
                channel.bind('appointment-booked', function(data) {
                    SalonManager.showSuccess('Neuer Termin gebucht!');
                });
            @endauth
        @endif
    </script>

    @stack('scripts')
</body>
</html> 