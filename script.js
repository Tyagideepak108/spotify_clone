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

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .play-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(29, 215, 96, 0.9);
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: all 0.3s ease;
        pointer-events: none;
    }
    
    .card:hover .play-overlay {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.1);
    }
    
    .play-overlay i {
        color: white;
        font-size: 18px;
        margin-left: 2px;
    }
    
    .daylight, .david {
        transition: opacity 0.3s ease;
    }
`;
document.head.appendChild(style);

// Initialize the player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SpotifyPlayer();
});