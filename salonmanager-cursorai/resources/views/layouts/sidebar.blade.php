<div class="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
    <div class="flex items-center flex-shrink-0 px-4">
        <div class="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <i class="fas fa-cut text-white text-sm"></i>
        </div>
        <span class="ml-2 text-lg font-semibold text-gray-900 dark:text-white">SalonManager</span>
    </div>
    
    <nav class="mt-5 flex-1 px-2 space-y-1">
        @auth
            @php
                $user = auth()->user();
                $salon = session('selected_salon');
            @endphp

            <!-- Dashboard -->
            <a href="{{ route('dashboard') }}" 
               class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('dashboard') ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white' }}">
                <i class="fas fa-tachometer-alt mr-3 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"></i>
                Dashboard
            </a>

            <!-- Salon Selection -->
            @if($salon)
                <div class="px-2 py-2">
                    <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Aktueller Salon
                    </div>
                    <div class="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                        {{ $salon->name }}
                    </div>
                    <a href="{{ route('salon.select') }}" class="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-500">
                        Salon wechseln
                    </a>
                </div>
            @endif

            <!-- Appointments -->
            <div class="space-y-1">
                <div class="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Termine
                </div>
                
                <a href="{{ route('appointments.index') }}" 
                   class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('appointments.*') ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white' }}">
                    <i class="fas fa-calendar-alt mr-3 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"></i>
                    Termine
                </a>
                
                <a href="{{ route('appointments.create') }}" 
                   class="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white">
                    <i class="fas fa-plus mr-3 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"></i>
                    Neuer Termin
                </a>
            </div>

            <!-- Services -->
            <div class="space-y-1">
                <div class="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Leistungen
                </div>
                
                <a href="{{ route('services.index') }}" 
                   class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('services.*') ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white' }}">
                    <i class="fas fa-list mr-3 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"></i>
                    Alle Leistungen
                </a>
                
                @if($user->isAdmin() || $user->isStylist())
                    <a href="{{ route('services.create') }}" 
                       class="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white">
                        <i class="fas fa-plus mr-3 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"></i>
                        Neue Leistung
                    </a>
                @endif
            </div>

            <!-- Team Management -->
            @if($user->isAdmin())
                <div class="space-y-1">
                    <div class="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Team
                    </div>
                    
                    <a href="{{ route('team.index') }}" 
                       class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('team.*') ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white' }}">
                        <i class="fas fa-users mr-3 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"></i>
                        Team
                    </a>
                    
                    <a href="{{ route('team.invite') }}" 
                       class="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white">
                        <i class="fas fa-user-plus mr-3 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"></i>
                        Einladen
                    </a>
                </div>
            @endif

            <!-- Customers -->
            <div class="space-y-1">
                <div class="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Kunden
                </div>
                
                <a href="{{ route('customers.index') }}" 
                   class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('customers.*') ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white' }}">
                    <i class="fas fa-user-friends mr-3 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"></i>
                    Kunden
                </a>
                
                @if($user->isAdmin() || $user->isStylist())
                    <a href="{{ route('customers.create') }}" 
                       class="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white">
                        <i class="fas fa-user-plus mr-3 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"></i>
                        Neuer Kunde
                    </a>
                @endif
            </div>

            <!-- Shop -->
            <div class="space-y-1">
                <div class="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Shop
                </div>
                
                <a href="{{ route('shop.index') }}" 
                   class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('shop.*') ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white' }}">
                    <i class="fas fa-shopping-cart mr-3 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"></i>
                    Shop
                </a>
                
                <a href="{{ route('orders.index') }}" 
                   class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('orders.*') ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white' }}">
                    <i class="fas fa-shopping-bag mr-3 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"></i>
                    Bestellungen
                </a>
                
                <a href="{{ route('gift-cards.index') }}" 
                   class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('gift-cards.*') ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white' }}">
                    <i class="fas fa-gift mr-3 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"></i>
                    Gutscheine
                </a>
            </div>

            <!-- Analytics -->
            @if($user->isAdmin())
                <div class="space-y-1">
                    <div class="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Analytics
                    </div>
                    
                    <a href="{{ route('analytics.dashboard') }}" 
                       class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('analytics.*') ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white' }}">
                        <i class="fas fa-chart-bar mr-3 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"></i>
                        Dashboard
                    </a>
                    
                    <a href="{{ route('analytics.reports') }}" 
                       class="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white">
                        <i class="fas fa-file-alt mr-3 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"></i>
                        Berichte
                    </a>
                    
                    <a href="{{ route('analytics.export') }}" 
                       class="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white">
                        <i class="fas fa-download mr-3 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"></i>
                        Export
                    </a>
                </div>
            @endif

            <!-- Settings -->
            <div class="space-y-1">
                <div class="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Einstellungen
                </div>
                
                <a href="{{ route('salon.settings') }}" 
                   class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('salon.settings') ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white' }}">
                    <i class="fas fa-cog mr-3 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"></i>
                    Salon-Einstellungen
                </a>
                
                <a href="{{ route('profile.show') }}" 
                   class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('profile.*') ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white' }}">
                    <i class="fas fa-user mr-3 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"></i>
                    Profil
                </a>
                
                @if($user->isAdmin())
                    <a href="{{ route('backups.index') }}" 
                       class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('backups.*') ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white' }}">
                        <i class="fas fa-database mr-3 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"></i>
                        Backups
                    </a>
                    
                    <a href="{{ route('dsgvo.index') }}" 
                       class="group flex items-center px-2 py-2 text-sm font-medium rounded-md {{ request()->routeIs('dsgvo.*') ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white' }}">
                        <i class="fas fa-shield-alt mr-3 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"></i>
                        DSGVO
                    </a>
                @endif
            </div>

        @else
            <!-- Guest Navigation -->
            <a href="{{ route('login') }}" 
               class="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white">
                <i class="fas fa-sign-in-alt mr-3 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"></i>
                Anmelden
            </a>
            
            <a href="{{ route('register') }}" 
               class="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white">
                <i class="fas fa-user-plus mr-3 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"></i>
                Registrieren
            </a>
        @endauth
    </nav>
</div>

<!-- Bottom Section -->
<div class="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
    @auth
        <div class="flex items-center">
            <div class="flex-shrink-0">
                <img class="h-8 w-8 rounded-full" src="{{ auth()->user()->avatar_url }}" alt="{{ auth()->user()->name }}">
            </div>
            <div class="ml-3">
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ auth()->user()->name }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ auth()->user()->email }}</p>
            </div>
        </div>
    @else
        <div class="text-sm text-gray-500 dark:text-gray-400">
            <a href="{{ route('login') }}" class="text-purple-600 dark:text-purple-400 hover:text-purple-500">
                Anmelden
            </a>
        </div>
    @endauth
</div> 