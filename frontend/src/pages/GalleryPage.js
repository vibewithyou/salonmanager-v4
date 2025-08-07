import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import {
  PhotoIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BookmarkIcon,
  ShareIcon,
  EyeIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const GalleryPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [bookmarks, setBookmarks] = useState(new Set());

  const categories = [
    { id: 'all', name: 'Alle Styles', icon: PhotoIcon },
    { id: 'fade', name: 'Fade Cuts', icon: PhotoIcon },
    { id: 'undercut', name: 'Undercuts', icon: PhotoIcon },
    { id: 'beard', name: 'Bart Styles', icon: PhotoIcon },
    { id: 'classic', name: 'Klassisch', icon: PhotoIcon },
    { id: 'modern', name: 'Modern', icon: PhotoIcon },
    { id: 'long', name: 'Langes Haar', icon: PhotoIcon },
    { id: 'short', name: 'Kurzes Haar', icon: PhotoIcon },
  ];

  const hairLengths = ['Kurz', 'Mittel', 'Lang'];
  const hairTypes = ['Glatt', 'Wellig', 'Lockig'];
  const colors = ['Schwarz', 'Braun', 'Blond', 'Rot', 'Grau'];

  useEffect(() => {
    loadGalleryImages();
    if (isAuthenticated) {
      loadUserPreferences();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterImages();
  }, [images, searchQuery, activeFilter]);

  const loadGalleryImages = async () => {
    try {
      // Simulate API call - in reality this would load from backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const sampleImages = [
        {
          id: 1,
          title: 'Modern Fade Cut',
          salon: 'Elite Cuts Barbershop',
          salon_id: 'elite-cuts',
          category: 'fade',
          hair_length: 'Kurz',
          hair_type: 'Glatt',
          color: 'Schwarz',
          tags: ['fade', 'modern', 'trendy'],
          image_url: '/api/placeholder/400/500',
          likes: 142,
          views: 1203,
          description: 'Perfekter Fade Cut mit modernem Styling',
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          title: 'Classic Undercut',
          salon: 'Gentleman\'s Choice',
          salon_id: 'gentlemans-choice',
          category: 'undercut',
          hair_length: 'Mittel',
          hair_type: 'Wellig',
          color: 'Braun',
          tags: ['undercut', 'classic', 'elegant'],
          image_url: '/api/placeholder/400/500',
          likes: 89,
          views: 756,
          description: 'Zeitloser Undercut für den modernen Gentleman',
          created_at: '2024-01-14T15:20:00Z'
        },
        {
          id: 3,
          title: 'Beard Styling Deluxe',
          salon: 'Barber Kings',
          salon_id: 'barber-kings',
          category: 'beard',
          hair_length: 'Mittel',
          hair_type: 'Lockig',
          color: 'Schwarz',
          tags: ['beard', 'styling', 'premium'],
          image_url: '/api/placeholder/400/500',
          likes: 256,
          views: 1890,
          description: 'Professionelle Bartpflege und Styling',
          created_at: '2024-01-13T09:15:00Z'
        },
        // Add more sample images...
        ...Array.from({length: 20}, (_, i) => ({
          id: i + 4,
          title: `Hairstyle ${i + 4}`,
          salon: `Salon ${i + 4}`,
          salon_id: `salon-${i + 4}`,
          category: categories[Math.floor(Math.random() * (categories.length - 1)) + 1].id,
          hair_length: hairLengths[Math.floor(Math.random() * hairLengths.length)],
          hair_type: hairTypes[Math.floor(Math.random() * hairTypes.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          tags: ['style', 'modern'],
          image_url: '/api/placeholder/400/500',
          likes: Math.floor(Math.random() * 300),
          views: Math.floor(Math.random() * 2000),
          description: `Beschreibung für Hairstyle ${i + 4}`,
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        }))
      ];
      
      setImages(sampleImages);
    } catch (error) {
      console.error('Error loading gallery:', error);
      toast.error('Fehler beim Laden der Galerie');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFavorites(new Set(data.favorites || []));
        setBookmarks(new Set(data.bookmarks || []));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const filterImages = () => {
    let filtered = images;

    // Filter by category
    if (activeFilter !== 'all') {
      filtered = filtered.filter(img => img.category === activeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(img =>
        img.title.toLowerCase().includes(query) ||
        img.salon.toLowerCase().includes(query) ||
        img.tags.some(tag => tag.toLowerCase().includes(query)) ||
        img.description.toLowerCase().includes(query)
      );
    }

    setFilteredImages(filtered);
  };

  const toggleFavorite = async (imageId) => {
    if (!isAuthenticated) {
      toast.error('Bitte melden Sie sich an, um Favoriten zu verwalten');
      return;
    }

    try {
      const isFavorite = favorites.has(imageId);
      const method = isFavorite ? 'DELETE' : 'POST';
      
      const response = await fetch(`/api/gallery/${imageId}/favorite`, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          if (isFavorite) {
            newFavorites.delete(imageId);
          } else {
            newFavorites.add(imageId);
          }
          return newFavorites;
        });

        // Update likes count
        setImages(prev => prev.map(img => 
          img.id === imageId 
            ? { ...img, likes: img.likes + (isFavorite ? -1 : 1) }
            : img
        ));

        toast.success(isFavorite ? 'Aus Favoriten entfernt' : 'Zu Favoriten hinzugefügt');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Fehler beim Aktualisieren der Favoriten');
    }
  };

  const toggleBookmark = async (imageId) => {
    if (!isAuthenticated) {
      toast.error('Bitte melden Sie sich an, um Bookmarks zu verwalten');
      return;
    }

    try {
      const isBookmarked = bookmarks.has(imageId);
      const method = isBookmarked ? 'DELETE' : 'POST';
      
      const response = await fetch(`/api/gallery/${imageId}/bookmark`, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setBookmarks(prev => {
          const newBookmarks = new Set(prev);
          if (isBookmarked) {
            newBookmarks.delete(imageId);
          } else {
            newBookmarks.add(imageId);
          }
          return newBookmarks;
        });

        toast.success(isBookmarked ? 'Bookmark entfernt' : 'Bookmark hinzugefügt');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Fehler beim Aktualisieren der Bookmarks');
    }
  };

  const shareImage = async (image) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title,
          text: `Schau dir diesen coolen Style an: ${image.title}`,
          url: window.location.href + `#image-${image.id}`
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback - copy link to clipboard
      navigator.clipboard.writeText(`${window.location.href}#image-${image.id}`);
      toast.success('Link wurde kopiert!');
    }
  };

  const ImageCard = ({ image }) => (
    <div className="card overflow-hidden group cursor-pointer hover-lift">
      <div 
        className="relative aspect-[4/5] overflow-hidden"
        onClick={() => setSelectedImage(image)}
      >
        <img
          src={image.image_url}
          alt={image.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
          <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(image.id);
              }}
              className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
            >
              {favorites.has(image.id) ? (
                <HeartSolidIcon className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(image.id);
              }}
              className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
            >
              {bookmarks.has(image.id) ? (
                <BookmarkSolidIcon className="w-5 h-5 text-yellow-500" />
              ) : (
                <BookmarkIcon className="w-5 h-5" />
              )}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                shareImage(image);
              }}
              className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
            >
              <ShareIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center justify-between text-white text-sm">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <HeartIcon className="w-4 h-4" />
                  <span>{image.likes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <EyeIcon className="w-4 h-4" />
                  <span>{image.views}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white mb-1 line-clamp-1">{image.title}</h3>
        <p className="text-gray-400 text-sm mb-2">{image.salon}</p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {image.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-yellow-500 bg-opacity-20 text-yellow-500 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-3">
            <span>{image.hair_length}</span>
            <span>•</span>
            <span>{image.hair_type}</span>
          </div>
          <span>{new Date(image.created_at).toLocaleDateString('de-DE')}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <PhotoIcon className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Style <span className="text-gradient-gold">Galerie</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Entdecke inspirierende Hairstyles und finde deinen perfekten Look
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Search */}
            <div className="relative flex-1 max-w-2xl">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Suche nach Styles, Salons oder Tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {/* Upload Button (for salon owners) */}
            {user && (user.role === 'salon_owner' || user.role === 'stylist') && (
              <button className="btn-primary px-6 py-3 rounded-lg font-semibold flex items-center space-x-2">
                <PlusIcon className="w-5 h-5" />
                <span>Bild hochladen</span>
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeFilter === category.id
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Results Count */}
          <div className="mt-4">
            <p className="text-gray-400">
              <span className="text-white font-semibold">{filteredImages.length}</span> Style
              {filteredImages.length !== 1 ? 's' : ''} gefunden
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredImages.length === 0 ? (
          <div className="text-center py-20">
            <PhotoIcon className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">
              Keine Styles gefunden
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Versuche es mit anderen Suchbegriffen oder wähle eine andere Kategorie.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredImages.map((image) => (
              <ImageCard key={image.id} image={image} />
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="max-w-4xl max-h-full overflow-auto bg-gray-900 rounded-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Image */}
              <div className="aspect-square lg:aspect-auto">
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {selectedImage.title}
                    </h2>
                    <p className="text-yellow-500 font-semibold mb-4">
                      {selectedImage.salon}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <p className="text-gray-300 mb-6">
                  {selectedImage.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="text-gray-400 text-sm">Haarlänge</span>
                    <p className="text-white font-medium">{selectedImage.hair_length}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Haartyp</span>
                    <p className="text-white font-medium">{selectedImage.hair_type}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Farbe</span>
                    <p className="text-white font-medium">{selectedImage.color}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Kategorie</span>
                    <p className="text-white font-medium capitalize">{selectedImage.category}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedImage.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-yellow-500 bg-opacity-20 text-yellow-500 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-6 text-gray-400">
                    <div className="flex items-center space-x-2">
                      <HeartIcon className="w-5 h-5" />
                      <span>{selectedImage.likes} Likes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <EyeIcon className="w-5 h-5" />
                      <span>{selectedImage.views} Views</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => toggleFavorite(selectedImage.id)}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                      favorites.has(selectedImage.id)
                        ? 'bg-red-500 text-white'
                        : 'btn-outline'
                    }`}
                  >
                    {favorites.has(selectedImage.id) ? 'Favorit entfernen' : 'Favorit hinzufügen'}
                  </button>
                  
                  <button
                    onClick={() => shareImage(selectedImage)}
                    className="px-4 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                  >
                    <ShareIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;