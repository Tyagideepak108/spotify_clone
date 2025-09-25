// Professional Spotify Clone - Music Player
class SpotifyPlayer {
    constructor() {
        this.isPlaying = false;
        this.currentSong = 0;
        this.songs = [
            { title: 'DayLight', artist: 'David Kushner', src: './assets/song.mp3' },
            { title: 'Top 50 - Global', artist: 'Various Artists', src: './assets/song.mp3' },
            { title: 'Trending Hits', artist: 'Popular Artists', src: './assets/song.mp3' }
        ];
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializePlayer();
    }

    initializeElements() {
        this.audio = document.getElementById('audio');
        this.playBtn = document.querySelector('.play-btn');
        this.progressBar = document.querySelector('.progress-bar');
        this.volumeBar = document.querySelector('.volume-bar');
        this.currTimeSpan = document.querySelector('.curr-time');
        this.totTimeSpan = document.querySelector('.tot-time');
        this.heartIcon = document.querySelector('.fa-heart');
        this.songTitle = document.querySelector('.daylight');
        this.artistName = document.querySelector('.david');
    }

    setupEventListeners() {
        // Play/Pause functionality with error handling
        this.playBtn?.addEventListener('click', () => this.togglePlayPause());
        
        // Audio event listeners
        this.audio?.addEventListener('loadedmetadata', () => this.onMetadataLoaded());
        this.audio?.addEventListener('timeupdate', () => this.onTimeUpdate());
        this.audio?.addEventListener('ended', () => this.onSongEnded());
        this.audio?.addEventListener('error', (e) => this.onAudioError(e));
        
        // Progress bar functionality
        this.progressBar?.addEventListener('input', () => this.seekAudio());
        this.progressBar?.addEventListener('mousedown', () => this.onSeekStart());
        this.progressBar?.addEventListener('mouseup', () => this.onSeekEnd());
        
        // Touch events for mobile
        this.progressBar?.addEventListener('touchstart', () => this.onSeekStart());
        this.progressBar?.addEventListener('touchend', () => this.onSeekEnd());
        
        // Volume control
        this.volumeBar?.addEventListener('input', () => this.adjustVolume());
        
        // Heart icon toggle
        this.heartIcon?.addEventListener('click', () => this.toggleFavorite());
        
        // Card interactions
        this.setupCardListeners();
        
        // Navigation
        this.setupNavigation();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Mobile menu
        this.setupMobileMenu();
        
        // Responsive handling
        this.setupResponsiveHandling();
    }

    togglePlayPause() {
        try {
            if (this.audio.paused) {
                this.playAudio();
            } else {
                this.pauseAudio();
            }
        } catch (error) {
            console.error('Error toggling play/pause:', error);
            this.showNotification('Audio playback error', 'error');
        }
    }

    async playAudio() {
        try {
            await this.audio.play();
            this.playBtn.src = './assets/play_musicbar.png';
            this.isPlaying = true;
            this.playBtn.style.filter = 'drop-shadow(0 0 12px rgba(29, 215, 96, 0.8))';
        } catch (error) {
            console.error('Error playing audio:', error);
            this.showNotification('Cannot play audio. Please check your browser settings.', 'error');
        }
    }

    pauseAudio() {
        this.audio.pause();
        this.playBtn.src = './assets/player_icon3.png';
        this.isPlaying = false;
        this.playBtn.style.filter = 'drop-shadow(0 0 8px rgba(29, 215, 96, 0.5))';
    }

    onMetadataLoaded() {
        if (this.audio.duration && !isNaN(this.audio.duration)) {
            this.totTimeSpan.textContent = this.formatTime(this.audio.duration);
            this.progressBar.max = this.audio.duration;
        }
    }

    onTimeUpdate() {
        if (!this.isSeeking) {
            this.currTimeSpan.textContent = this.formatTime(this.audio.currentTime);
            this.progressBar.value = this.audio.currentTime;
            
            // Update progress bar background
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            this.progressBar.style.background = `linear-gradient(to right, #1bd760 0%, #1bd760 ${progress}%, #4f4f4f ${progress}%, #4f4f4f 100%)`;
        }
    }

    onSongEnded() {
        this.playBtn.src = './assets/player_icon3.png';
        this.isPlaying = false;
        this.progressBar.value = 0;
        this.currTimeSpan.textContent = '00:00';
        this.playBtn.style.filter = 'drop-shadow(0 0 8px rgba(29, 215, 96, 0.5))';
    }

    onAudioError(error) {
        console.error('Audio error:', error);
        this.showNotification('Audio file could not be loaded', 'error');
    }

    seekAudio() {
        if (this.audio.duration) {
            this.audio.currentTime = this.progressBar.value;
        }
    }

    onSeekStart() {
        this.isSeeking = true;
    }

    onSeekEnd() {
        this.isSeeking = false;
    }

    adjustVolume() {
        this.audio.volume = this.volumeBar.value / 100;
        
        // Visual feedback for volume
        const volumeProgress = this.volumeBar.value;
        this.volumeBar.style.background = `linear-gradient(to right, #1bd760 0%, #1bd760 ${volumeProgress}%, #4f4f4f ${volumeProgress}%, #4f4f4f 100%)`;
    }

    toggleFavorite() {
        this.heartIcon.classList.toggle('fa-regular');
        this.heartIcon.classList.toggle('fa-solid');
        const isFavorite = this.heartIcon.classList.contains('fa-solid');
        this.heartIcon.style.color = isFavorite ? '#1bd760' : '#fff';
        this.heartIcon.style.transform = 'scale(1.2)';
        setTimeout(() => {
            this.heartIcon.style.transform = 'scale(1)';
        }, 200);
        
        this.showNotification(isFavorite ? 'Added to Liked Songs' : 'Removed from Liked Songs', 'success');
    }

    setupCardListeners() {
        document.querySelectorAll('.card').forEach((card, index) => {
            card.addEventListener('click', () => this.selectSong(card, index));
            
            // Add play button overlay on hover
            const playOverlay = document.createElement('div');
            playOverlay.className = 'play-overlay';
            playOverlay.innerHTML = '<i class="fa-solid fa-play"></i>';
            card.appendChild(playOverlay);
        });
    }

    selectSong(card, index) {
        const title = card.querySelector('.card-title').textContent;
        const info = card.querySelector('.card-info').textContent;
        
        // Update song info with animation
        this.songTitle.style.opacity = '0';
        this.artistName.style.opacity = '0';
        
        setTimeout(() => {
            this.songTitle.textContent = title;
            this.artistName.textContent = info.substring(0, 30) + '...';
            this.songTitle.style.opacity = '1';
            this.artistName.style.opacity = '1';
        }, 150);
        
        // Reset and play new song
        this.audio.currentTime = 0;
        if (this.isPlaying) {
            this.playAudio();
        }
        
        this.showNotification(`Now playing: ${title}`, 'info');
    }

    setupNavigation() {
        document.querySelectorAll('.nav-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.nav-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Add ripple effect
                this.createRipple(option, e);
            });
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;
            
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'ArrowLeft':
                    this.audio.currentTime = Math.max(0, this.audio.currentTime - 10);
                    break;
                case 'ArrowRight':
                    this.audio.currentTime = Math.min(this.audio.duration, this.audio.currentTime + 10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.volumeBar.value = Math.min(100, parseInt(this.volumeBar.value) + 10);
                    this.adjustVolume();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.volumeBar.value = Math.max(0, parseInt(this.volumeBar.value) - 10);
                    this.adjustVolume();
                    break;
            }
        });
    }

    createRipple(element, event) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'error' ? '#e22134' : type === 'success' ? '#1bd760' : '#333'};
            color: white;
            border-radius: 8px;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    setupMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const sidebar = document.querySelector('.sidebar');
        
        mobileMenuBtn?.addEventListener('click', () => {
            sidebar?.classList.toggle('mobile-open');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                !sidebar?.contains(e.target) && 
                !mobileMenuBtn?.contains(e.target)) {
                sidebar?.classList.remove('mobile-open');
            }
        });
    }
    
    setupResponsiveHandling() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Initial resize handling
        this.handleResize();
    }
    
    handleResize() {
        const width = window.innerWidth;
        const sidebar = document.querySelector('.sidebar');
        
        // Close mobile sidebar on desktop
        if (width > 768) {
            sidebar?.classList.remove('mobile-open');
        }
        
        // Adjust layouts based on screen size
        this.adjustResponsiveLayout(width);
        
        // Update cards container
        this.updateCardsLayout(width);
        
        // Adjust player for different screen sizes
        this.adjustPlayerLayout(width);
    }
    
    adjustResponsiveLayout(width) {
        const main = document.querySelector('.main');
        const cardsContainers = document.querySelectorAll('.cards-container');
        
        if (width <= 480) {
            // Ultra mobile optimizations
            main?.style.setProperty('--mobile-padding', '0.2rem');
            this.createVolumeFAB();
        } else if (width <= 768) {
            // Tablet optimizations
            main?.style.setProperty('--mobile-padding', '0.3rem');
            this.removeVolumeFAB();
        } else {
            // Desktop optimizations
            main?.style.removeProperty('--mobile-padding');
            this.removeVolumeFAB();
        }
    }
    
    updateCardsLayout(width) {
        const cardsContainers = document.querySelectorAll('.cards-container');
        
        cardsContainers.forEach(container => {
            if (width <= 360) {
                container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(100px, 1fr))';
            } else if (width <= 480) {
                container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(120px, 1fr))';
            } else if (width <= 768) {
                container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(140px, 1fr))';
            } else {
                container.style.removeProperty('grid-template-columns');
            }
        });
    }
    
    adjustPlayerLayout(width) {
        const musicPlayer = document.querySelector('.music_player');
        const controls = document.querySelector('.controls');
        
        if (width <= 480) {
            // Mobile: Stack layout
            musicPlayer?.style.setProperty('grid-template-columns', '1fr');
            musicPlayer?.style.setProperty('grid-template-rows', 'auto auto');
            musicPlayer?.style.setProperty('height', '120px');
            controls?.style.setProperty('display', 'none');
        } else if (width <= 768) {
            // Tablet: Adjusted grid
            musicPlayer?.style.setProperty('grid-template-columns', '1.5fr 2fr 1fr');
            musicPlayer?.style.removeProperty('grid-template-rows');
            musicPlayer?.style.setProperty('height', '100px');
            controls?.style.removeProperty('display');
        } else {
            // Desktop: Default grid
            musicPlayer?.style.removeProperty('grid-template-columns');
            musicPlayer?.style.removeProperty('grid-template-rows');
            musicPlayer?.style.removeProperty('height');
            controls?.style.removeProperty('display');
        }
    }
    
    createVolumeFAB() {
        if (document.querySelector('.volume-fab')) return;
        
        const fab = document.createElement('div');
        fab.className = 'volume-fab';
        fab.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        
        fab.addEventListener('click', () => {
            this.toggleVolumeModal();
        });
        
        document.body.appendChild(fab);
    }
    
    removeVolumeFAB() {
        const fab = document.querySelector('.volume-fab');
        fab?.remove();
    }
    
    toggleVolumeModal() {
        let modal = document.querySelector('.volume-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'volume-modal';
            modal.innerHTML = `
                <div class="volume-modal-content">
                    <div class="volume-slider-container">
                        <i class="fa-solid fa-volume-low"></i>
                        <input type="range" min="0" max="100" class="volume-slider-mobile" value="${this.volumeBar.value}">
                        <i class="fa-solid fa-volume-high"></i>
                    </div>
                    <button class="volume-close">×</button>
                </div>
            `;
            
            const slider = modal.querySelector('.volume-slider-mobile');
            slider.addEventListener('input', (e) => {
                this.volumeBar.value = e.target.value;
                this.adjustVolume();
            });
            
            modal.querySelector('.volume-close').addEventListener('click', () => {
                modal.remove();
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });
            
            document.body.appendChild(modal);
        } else {
            modal.remove();
        }
    }

    initializePlayer() {
        // Set initial values
        this.currTimeSpan.textContent = '00:00';
        this.totTimeSpan.textContent = '00:00';
        this.volumeBar.value = 50;
        this.audio.volume = 0.5;
        
        // Initialize volume bar styling
        this.adjustVolume();
        
        // Set first nav option as active
        document.querySelector('.nav-option')?.classList.add('active');
        
        console.log('🎵 Spotify Clone initialized successfully!');
    }
}

// Add CSS for animations and responsive features
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
    
    .play-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, rgba(29, 215, 96, 0.9), rgba(30, 215, 96, 0.9));
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        pointer-events: none;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 25px rgba(29, 215, 96, 0.3);
    }
    
    .card:hover .play-overlay {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.2);
        animation: pulse 2s infinite;
    }
    
    .play-overlay i {
        color: white;
        font-size: 18px;
        margin-left: 2px;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    }
    
    .daylight, .david {
        transition: all 0.3s ease;
    }
    
    .volume-fab {
        animation: fadeInUp 0.5s ease;
    }
    
    .volume-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
        animation: fadeInUp 0.3s ease;
    }
    
    .volume-modal-content {
        background: linear-gradient(145deg, #181818, #242424);
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        border: 1px solid rgba(29, 215, 96, 0.3);
        position: relative;
        min-width: 300px;
    }
    
    .volume-slider-container {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .volume-slider-mobile {
        flex: 1;
        height: 6px;
        border-radius: 3px;
        background: rgba(255,255,255,0.2);
        appearance: none;
        cursor: pointer;
    }
    
    .volume-slider-mobile::-webkit-slider-thumb {
        appearance: none;
        width: 20px;
        height: 20px;
        background: linear-gradient(45deg, #1bd760, #1ed760);
        border-radius: 50%;
        margin-top: -7px;
        box-shadow: 0 4px 12px rgba(29, 215, 96, 0.5);
        cursor: pointer;
    }
    
    .volume-close {
        position: absolute;
        top: 10px;
        right: 15px;
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }
    
    .volume-close:hover {
        background: rgba(255,255,255,0.1);
        transform: scale(1.1);
    }
    
    /* Smooth scrolling for cards */
    .cards-container {
        scroll-behavior: smooth;
    }
    
    /* Enhanced card animations */
    .card {
        animation: fadeInUp 0.6s ease forwards;
        animation-delay: calc(var(--card-index, 0) * 0.1s);
    }
    
    /* Loading states */
    .loading {
        opacity: 0.6;
        pointer-events: none;
    }
    
    .loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        margin: -10px 0 0 -10px;
        border: 2px solid rgba(29, 215, 96, 0.3);
        border-top: 2px solid #1bd760;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    /* Responsive container queries */
    @container (max-width: 400px) {
        .card {
            padding: 0.8rem;
        }
    }
`;
document.head.appendChild(style);

// Add card index for staggered animations
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.card').forEach((card, index) => {
        card.style.setProperty('--card-index', index);
    });
});

// Initialize the player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add loading state
    document.body.classList.add('loading');
    
    // Initialize player after a short delay for smooth loading
    setTimeout(() => {
        new SpotifyPlayer();
        document.body.classList.remove('loading');
        
        // Add staggered card animations
        document.querySelectorAll('.card').forEach((card, index) => {
            card.style.setProperty('--card-index', index);
            card.style.animationDelay = `${index * 0.1}s`;
        });
        
        // Add intersection observer for lazy loading
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, { threshold: 0.1 });
            
            document.querySelectorAll('.card').forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'all 0.6s ease';
                observer.observe(card);
            });
        }
    }, 300);
});

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Performance optimization: Debounce resize events
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Trigger custom resize event for player
        window.dispatchEvent(new CustomEvent('optimizedResize'));
    }, 250);
});