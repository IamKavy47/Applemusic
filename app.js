// Main App JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the app
    initApp();
});

// Global variables
let currentSong = null;
let isPlaying = false;
let audio = new Audio();
let currentVolume = 0.7;
let deferredPrompt = null;
let currentTab = 'listen-now';
let playerIsMini = false;
let contextMenuTarget = null;
let shazamListening = false;

// Initialize the app
function initApp() {
    // Load data
    loadMusicData();
    
    // Initialize UI components
    initThemeToggle();
    initTabs();
    initPlayer();
    initContextMenu();
    initMobileMenu();
    initShazam();
    initPWA();
    
    // Add event listeners
    addEventListeners();
    
    // GSAP animations
    initAnimations();
}

// Load music data
function loadMusicData() {
    // Simulate API loading with setTimeout
    setTimeout(() => {
        // Load recently played
        loadRecentlyPlayed();
        
        // Load popular albums
        loadPopularAlbums();
        
        // Load top songs
        loadTopSongs();
        
        // Load browse categories
        loadBrowseCategories();
        
        // Load new releases
        loadNewReleases();
        
        // Load featured playlists
        loadFeaturedPlaylists();
        
        // Load radio stations
        loadRadioStations();
        
        // Load search categories
        loadSearchCategories();
        
        // Load playlists
        loadPlaylists();
    }, 1500);
}

// Initialize theme toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    themeToggle.addEventListener('click', toggleTheme);
    mobileThemeToggle.addEventListener('click', toggleTheme);
}

// Toggle theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // GSAP animation for theme transition
    gsap.to('body', {
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-primary'),
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
        duration: 0.5,
        ease: 'power2.out'
    });
    
    showNotification(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`);
}

// Initialize tabs
function initTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    const mobileMenuItems = document.querySelectorAll('.mobile-menu-item[data-tab]');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    mobileMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabName = item.getAttribute('data-tab');
            switchTab(tabName);
            toggleMobileMenu();
        });
    });
}

// Switch tab
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Remove active class from all tabs and contents
    tabs.forEach(tab => tab.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    document.querySelector(`.nav-tab[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    currentTab = tabName;
    
    // GSAP animation for tab transition
    gsap.fromTo(`#${tabName}-tab`, 
        { opacity: 0, y: 10 }, 
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    );
}

// Initialize player
function initPlayer() {
    const playPauseButton = document.getElementById('play-pause-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const progressBar = document.getElementById('progress-bar');
    const volumeSlider = document.getElementById('volume-slider');
    const miniPlayerToggle = document.getElementById('mini-player-toggle');
    
    // Set initial volume
    audio.volume = currentVolume;
    document.getElementById('volume-fill').style.width = `${currentVolume * 100}%`;
    
    // Play/Pause button
    playPauseButton.addEventListener('click', togglePlayPause);
    
    // Previous button
    prevButton.addEventListener('click', playPreviousSong);
    
    // Next button
    nextButton.addEventListener('click', playNextSong);
    
    // Progress bar
    progressBar.addEventListener('click', (e) => {
        if (!currentSong) return;
        
        const percent = e.offsetX / progressBar.offsetWidth;
        audio.currentTime = percent * audio.duration;
        document.getElementById('progress-fill').style.width = `${percent * 100}%`;
    });
    
    // Volume slider
    volumeSlider.addEventListener('click', (e) => {
        const percent = e.offsetX / volumeSlider.offsetWidth;
        currentVolume = percent;
        audio.volume = currentVolume;
        document.getElementById('volume-fill').style.width = `${percent * 100}%`;
    });
    
    // Mini player toggle
    miniPlayerToggle.addEventListener('click', toggleMiniPlayer);
    
    // Audio events
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', playNextSong);
    audio.addEventListener('play', () => {
        playPauseButton.innerHTML = '⏸';
        document.getElementById('equalizer').classList.add('active');
        animateEqualizer(true);
    });
    audio.addEventListener('pause', () => {
        playPauseButton.innerHTML = '▶';
        document.getElementById('equalizer').classList.remove('active');
        animateEqualizer(false);
    });
}

// Toggle play/pause
function togglePlayPause() {
    if (!currentSong) {
        // If no song is selected, play the first song in top songs
        const firstSong = document.querySelector('.song-item');
        if (firstSong) {
            playSong(firstSong.getAttribute('data-song-id'));
        }
        return;
    }
    
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
    } else {
        audio.play();
        isPlaying = true;
    }
}

// Play a song
function playSong(songId) {
    // Find song data
    const song = musicData.songs.find(s => s.id === songId);
    if (!song) return;
    
    // Update current song
    currentSong = song;
    
    // Update audio source
    audio.src = song.audioUrl;
    
    // Update player UI
    document.getElementById('player-title').textContent = song.title;
    document.getElementById('player-artist').textContent = song.artist;
    document.getElementById('player-cover-img').src = song.coverUrl;
    document.getElementById('current-time').textContent = '0:00';
    document.getElementById('total-time').textContent = formatTime(song.duration);
    
    // Play the song
    audio.play();
    isPlaying = true;
    
    // GSAP animation for player update
    gsap.fromTo('.player-details', 
        { opacity: 0, y: 10 }, 
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    );
    
    gsap.fromTo('.player-cover', 
        { scale: 0.9, opacity: 0.8 }, 
        { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
    );
}

// Play previous song
function playPreviousSong() {
    if (!currentSong) return;
    
    const currentIndex = musicData.songs.findIndex(s => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + musicData.songs.length) % musicData.songs.length;
    playSong(musicData.songs[prevIndex].id);
}

// Play next song
function playNextSong() {
    if (!currentSong) return;
    
    const currentIndex = musicData.songs.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % musicData.songs.length;
    playSong(musicData.songs[nextIndex].id);
}

// Update progress
function updateProgress() {
    const currentTime = audio.currentTime;
    const duration = audio.duration || 1;
    const percent = (currentTime / duration) * 100;
    
    document.getElementById('progress-fill').style.width = `${percent}%`;
    document.getElementById('current-time').textContent = formatTime(currentTime);
}

// Format time
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Toggle mini player
function toggleMiniPlayer() {
    const player = document.getElementById('player');
    playerIsMini = !playerIsMini;
    
    if (playerIsMini) {
        player.classList.add('mini');
    } else {
        player.classList.remove('mini');
    }
}

// Initialize context menu
function initContextMenu() {
    const contextMenu = document.getElementById('context-menu');
    
    // Close context menu on click outside
    document.addEventListener('click', () => {
        contextMenu.style.display = 'none';
    });
    
    // Context menu actions
    const contextMenuItems = document.querySelectorAll('.context-menu-item');
    contextMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            const action = item.getAttribute('data-action');
            handleContextMenuAction(action);
        });
    });
}

// Show context menu
function showContextMenu(e, songId) {
    e.preventDefault();
    
    const contextMenu = document.getElementById('context-menu');
    contextMenuTarget = songId;
    
    // Position the context menu
    contextMenu.style.top = `${e.pageY}px`;
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.classList.add('active');
    
    // Ensure the menu stays within viewport
    const menuRect = contextMenu.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    if (menuRect.bottom > viewportHeight) {
        contextMenu.style.top = `${e.pageY - menuRect.height}px`;
    }
    
    if (menuRect.right > viewportWidth) {
        contextMenu.style.left = `${e.pageX - menuRect.width}px`;
    }
}

// Handle context menu action
function handleContextMenuAction(action) {
    if (!contextMenuTarget) return;
    
    switch (action) {
        case 'play':
            playSong(contextMenuTarget);
            break;
        case 'add-library':
            showNotification('Added to your library');
            break;
        case 'add-playlist':
            showNotification('Added to playlist');
            break;
        case 'view-artist':
            showNotification('Viewing artist');
            break;
        case 'view-album':
            showNotification('Viewing album');
            break;
        case 'share':
            shareContent(contextMenuTarget);
            break;
        case 'lyrics':
            showLyrics(contextMenuTarget);
            break;
    }
    
    contextMenuTarget = null;
}

// Show notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('active');
    
    // GSAP animation for notification
    gsap.fromTo(notification, 
        { x: 100, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
    );
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        gsap.to(notification, {
            x: 100,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                notification.classList.remove('active');
            }
        });
    }, 3000);
}

// Share content
function shareContent(songId) {
    if (navigator.share) {
        const song = musicData.songs.find(s => s.id === songId);
        
        navigator.share({
            title: song.title,
            text: `Check out ${song.title} by ${song.artist} on Apple Music`,
            url: window.location.href
        })
        .then(() => showNotification('Shared successfully'))
        .catch(() => showNotification('Sharing failed'));
    } else {
        showNotification('Sharing not supported on this browser');
    }
}

// Show lyrics
function showLyrics(songId) {
    const lyricsModal = document.getElementById('lyrics-modal');
    const lyricsText = document.getElementById('lyrics-text');
    const song = musicData.songs.find(s => s.id === songId);
    
    if (song && song.lyrics) {
        lyricsText.textContent = song.lyrics;
    } else {
        lyricsText.textContent = 'Lyrics not available for this song.';
    }
    
    lyricsModal.classList.add('active');
    
    // GSAP animation for lyrics modal
    gsap.fromTo('.lyrics-content', 
        { scale: 0.9, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
    );
    
    // Close lyrics modal
    document.getElementById('lyrics-close').addEventListener('click', () => {
        gsap.to('.lyrics-content', {
            scale: 0.9,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                lyricsModal.classList.remove('active');
            }
        });
    });
}

// Initialize mobile menu
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileMenuButton.addEventListener('click', toggleMobileMenu);
    mobileMenuClose.addEventListener('click', toggleMobileMenu);
}

// Toggle mobile menu
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenu.classList.contains('active')) {
        // GSAP animation for closing mobile menu
        gsap.to(mobileMenu, {
            x: '-100%',
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                mobileMenu.classList.remove('active');
            }
        });
    } else {
        mobileMenu.classList.add('active');
        
        // GSAP animation for opening mobile menu
        gsap.fromTo(mobileMenu, 
            { x: '-100%' }, 
            { x: '0%', duration: 0.3, ease: 'power2.out' }
        );
    }
}

// Initialize Shazam
function initShazam() {
    const shazamButton = document.getElementById('shazam-button');
    const shazamModal = document.getElementById('shazam-modal');
    const shazamCancel = document.getElementById('shazam-cancel');
    const shazamClose = document.getElementById('shazam-close');
    const shazamPlay = document.getElementById('shazam-play');
    
    shazamButton.addEventListener('click', startShazam);
    shazamCancel.addEventListener('click', cancelShazam);
    shazamClose.addEventListener('click', cancelShazam);
    shazamPlay.addEventListener('click', playShazamResult);
}

// Start Shazam
function startShazam() {
    const shazamModal = document.getElementById('shazam-modal');
    const shazamResult = document.getElementById('shazam-result');
    
    shazamModal.classList.add('active');
    shazamResult.classList.remove('active');
    shazamListening = true;
    
    // GSAP animation for Shazam modal
    gsap.fromTo('.shazam-content', 
        { scale: 0.9, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
    );
    
    // Add listening class to button
    document.getElementById('shazam-button').classList.add('listening');
    
    // Simulate Shazam API call
    setTimeout(() => {
        if (shazamListening) {
            shazamIdentifySong();
        }
    }, 3000);
}

// Cancel Shazam
function cancelShazam() {
    const shazamModal = document.getElementById('shazam-modal');
    
    shazamListening = false;
    
    // GSAP animation for closing Shazam modal
    gsap.to('.shazam-content', {
        scale: 0.9,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
            shazamModal.classList.remove('active');
        }
    });
    
    // Remove listening class from button
    document.getElementById('shazam-button').classList.remove('listening');
}

// Shazam identify song
function shazamIdentifySong() {
    // Simulate Shazam API call
    const randomSong = musicData.songs[Math.floor(Math.random() * musicData.songs.length)];
    
    // Update Shazam result
    document.getElementById('shazam-result-img').src = randomSong.coverUrl;
    document.getElementById('shazam-result-title').textContent = randomSong.title;
    document.getElementById('shazam-result-artist').textContent = randomSong.artist;
    
    // Store identified song ID
    document.getElementById('shazam-play').setAttribute('data-song-id', randomSong.id);
    
    // Show result
    document.getElementById('shazam-result').classList.add('active');
    
    // GSAP animation for result
    gsap.fromTo('#shazam-result', 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    );
    
    // Remove listening class from button
    document.getElementById('shazam-button').classList.remove('listening');
}

// Play Shazam result
function playShazamResult() {
    const songId = document.getElementById('shazam-play').getAttribute('data-song-id');
    playSong(songId);
    cancelShazam();
}

// Initialize PWA
function initPWA() {
    // Check if the app can be installed
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallPrompt();
    });
    
    // Install button
    document.getElementById('install-button').addEventListener('click', () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                showNotification('Thank you for installing Apple Music');
            }
            deferredPrompt = null;
            hideInstallPrompt();
        });
    });
    
    // Dismiss install prompt
    document.getElementById('install-dismiss').addEventListener('click', hideInstallPrompt);
}

// Show install prompt
function showInstallPrompt() {
    const installPrompt = document.getElementById('install-prompt');
    
    // GSAP animation for install prompt
    gsap.to(installPrompt, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
        onStart: () => {
            installPrompt.classList.add('active');
        }
    });
}

// Hide install prompt
function hideInstallPrompt() {
    const installPrompt = document.getElementById('install-prompt');
    
    // GSAP animation for hiding install prompt
    gsap.to(installPrompt, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
            installPrompt.classList.remove('active');
        }
    });
}

// Add event listeners
function addEventListeners() {
    // Hero button
    document.getElementById('hero-button').addEventListener('click', () => {
        const randomSong = musicData.songs[Math.floor(Math.random() * musicData.songs.length)];
        playSong(randomSong.id);
        showNotification('Playing random song');
    });
    
    // Library button
    document.querySelector('.library-button').addEventListener('click', () => {
        switchTab('browse');
    });
    
    // Search input
    document.getElementById('search-input').addEventListener('input', handleSearch);
    
    // Close lyrics modal on click outside
    document.getElementById('lyrics-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('lyrics-modal')) {
            document.getElementById('lyrics-close').click();
        }
    });
    
    // Close Shazam modal on click outside
    document.getElementById('shazam-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('shazam-modal')) {
            cancelShazam();
        }
    });
}

// Handle search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    if (searchTerm.length > 0) {
        switchTab('search');
        
        // Filter songs
        const filteredSongs = musicData.songs.filter(song => 
            song.title.toLowerCase().includes(searchTerm) || 
            song.artist.toLowerCase().includes(searchTerm)
        );
        
        // Update search results
        updateSearchResults(filteredSongs);
    } else {
        // Clear search results
        document.getElementById('search-results').innerHTML = `
            <div class="search-empty">
                <div class="search-empty-icon">🔍</div>
                <h3 class="search-empty-title">Search Apple Music</h3>
                <p class="search-empty-text">Find your favorite songs, artists, albums, and playlists.</p>
            </div>
        `;
    }
}

// Update search results
function updateSearchResults(songs) {
    const searchResults = document.getElementById('search-results');
    
    if (songs.length === 0) {
        searchResults.innerHTML = `
            <div class="search-empty">
                <div class="search-empty-icon">🔍</div>
                <h3 class="search-empty-title">No Results Found</h3>
                <p class="search-empty-text">Try a different search term.</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Search Results</h2>
            </div>
            <div class="song-list">
    `;
    
    songs.forEach(song => {
        html += `
            <div class="song-item" data-song-id="${song.id}">
                <div class="song-cover">
                    <img src="${song.coverUrl}" alt="${song.title}">
                </div>
                <div class="song-info">
                    <div class="song-title">${song.title}</div>
                    <div class="song-artist">${song.artist}</div>
                </div>
                <div class="song-duration">${formatTime(song.duration)}</div>
                <div class="song-actions">
                    <div class="song-action-btn">⋯</div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    searchResults.innerHTML = html;
    
    // Add event listeners to search results
    const songItems = searchResults.querySelectorAll('.song-item');
    songItems.forEach(item => {
        item.addEventListener('click', () => {
            playSong(item.getAttribute('data-song-id'));
        });
        
        item.addEventListener('contextmenu', (e) => {
            showContextMenu(e, item.getAttribute('data-song-id'));
        });
    });
}

// Initialize GSAP animations
function initAnimations() {
    // Hero section animation
    gsap.fromTo('.hero-section', 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );
    
    // Stagger animations for sections
    gsap.fromTo('.section', 
        { opacity: 0, y: 20 }, 
        { 
            opacity: 1, 
            y: 0, 
            duration: 0.5, 
            stagger: 0.1, 
            ease: 'power2.out' 
        }
    );
    
    // Animate equalizer bars
    animateEqualizer(false);
}

// Animate equalizer
function animateEqualizer(isActive) {
    const bars = document.querySelectorAll('.equalizer-bar');
    
    if (isActive) {
        bars.forEach(bar => {
            gsap.to(bar, {
                height: () => Math.floor(Math.random() * 15) + 3,
                duration: 0.3,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut'
            });
        });
    } else {
        bars.forEach(bar => {
            gsap.killTweensOf(bar);
            gsap.to(bar, {
                height: 5,
                duration: 0.3,
                ease: 'power1.out'
            });
        });
    }
}

// Load recently played
function loadRecentlyPlayed() {
    const container = document.getElementById('recently-played');
    
    // Clear skeleton loading
    container.innerHTML = '';
    
    // Add albums
    musicData.recentlyPlayed.forEach(album => {
        container.innerHTML += `
            <div class="album-card" data-album-id="${album.id}">
                <div class="album-cover">
                    <img src="${album.coverUrl}" alt="${album.title}">
                    <div class="play-button"></div>
                </div>
                <div class="album-info">
                    <div class="album-title">${album.title}</div>
                    <div class="album-artist">${album.artist}</div>
                </div>
            </div>
        `;
    });
    
    // Add event listeners
    const albumCards = container.querySelectorAll('.album-card');
    albumCards.forEach(card => {
        card.addEventListener('click', () => {
            const albumId = card.getAttribute('data-album-id');
            const album = musicData.recentlyPlayed.find(a => a.id === albumId);
            if (album && album.songs && album.songs.length > 0) {
                playSong(album.songs[0]);
            }
        });
        
        card.addEventListener('contextmenu', (e) => {
            const albumId = card.getAttribute('data-album-id');
            const album = musicData.recentlyPlayed.find(a => a.id === albumId);
            if (album && album.songs && album.songs.length > 0) {
                showContextMenu(e, album.songs[0]);
            }
        });
    });
    
    // GSAP animation
    gsap.fromTo(albumCards, 
        { opacity: 0, y: 20 }, 
        { 
            opacity: 1, 
            y: 0, 
            duration: 0.5, 
            stagger: 0.1, 
            ease: 'power2.out' 
        }
    );
}

// Load popular albums
function loadPopularAlbums() {
    const container = document.getElementById('popular-albums');
    
    // Clear skeleton loading
    container.innerHTML = '';
    
    // Add albums
    musicData.popularAlbums.forEach(album => {
        container.innerHTML += `
            <div class="album-card" data-album-id="${album.id}">
                <div class="album-cover">
                    <img src="${album.coverUrl}" alt="${album.title}">
                    <div class="play-button"></div>
                </div>
                <div class="album-info">
                    <div class="album-title">${album.title}</div>
                    <div class="album-artist">${album.artist}</div>
                </div>
            </div>
        `;
    });
    
    // Add event listeners
    const albumCards = container.querySelectorAll('.album-card');
    albumCards.forEach(card => {
        card.addEventListener('click', () => {
            const albumId = card.getAttribute('data-album-id');
            const album = musicData.popularAlbums.find(a => a.id === albumId);
            if (album && album.songs && album.songs.length > 0) {
                playSong(album.songs[0]);
            }
        });
        
        card.addEventListener('contextmenu', (e) => {
            const albumId = card.getAttribute('data-album-id');
            const album = musicData.popularAlbums.find(a => a.id === albumId);
            if (album && album.songs && album.songs.length > 0) {
                showContextMenu(e, album.songs[0]);
            }
        });
    });
    
    // GSAP animation
    gsap.fromTo(albumCards, 
        { opacity: 0, y: 20 }, 
        { 
            opacity: 1, 
            y: 0, 
            duration: 0.5, 
            stagger: 0.1, 
            ease: 'power2.out' 
        }
    );
}

// Load top songs
function loadTopSongs() {
    const container = document.getElementById('top-songs');
    
    // Clear skeleton loading
    container.innerHTML = '';
    
    // Add songs
    musicData.songs.slice(0, 5).forEach(song => {
        container.innerHTML += `
            <div class="song-item" data-song-id="${song.id}">
                <div class="song-cover">
                    <img src="${song.coverUrl}" alt="${song.title}">
                </div>
                <div class="song-info">
                    <div class="song-title">${song.title}</div>
                    <div class="song-artist">${song.artist}</div>
                </div>
                <div class="song-duration">${formatTime(song.duration)}</div>
                <div class="song-actions">
                    <div class="song-action-btn">⋯</div>
                </div>
            </div>
        `;
    });
    
    // Add event listeners
    const songItems = container.querySelectorAll('.song-item');
    songItems.forEach(item => {
        item.addEventListener('click', () => {
            playSong(item.getAttribute('data-song-id'));
        });
        
        item.addEventListener('contextmenu', (e) => {
            showContextMenu(e, item.getAttribute('data-song-id'));
        });
        
        const actionBtn = item.querySelector('.song-action-btn');
        actionBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showContextMenu(e, item.getAttribute('data-song-id'));
        });
    });
    
    // GSAP animation
    gsap.fromTo(songItems, 
        { opacity: 0, x: -20 }, 
        { 
            opacity: 1, 
            x: 0, 
            duration: 0.5, 
            stagger: 0.1, 
            ease: 'power2.out' 
        }
    );
}

// Load browse categories
function loadBrowseCategories() {
    const container = document.getElementById('browse-categories');
    
    // Add categories
    musicData.categories.forEach(category => {
        container.innerHTML += `
            <div class="category-card">
                <div class="category-cover">
                    <img src="${category.imageUrl}" alt="${category.name}">
                    <div class="category-overlay">
                        <div class="category-title">${category.name}</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    // Add event listeners
    const categoryCards = container.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            showNotification(`Browsing ${card.querySelector('.category-title').textContent}`);
        });
    });
    
    // GSAP animation
    gsap.fromTo(categoryCards, 
        { opacity: 0, scale: 0.9 }, 
        { 
            opacity: 1, 
            scale: 1, 
            duration: 0.5, 
            stagger: 0.1, 
            ease: 'power2.out' 
        }
    );
}

// Load new releases
function loadNewReleases() {
    const container = document.getElementById('new-releases');
    
    // Add albums
    musicData.newReleases.forEach(album => {
        container.innerHTML += `
            <div class="album-card" data-album-id="${album.id}">
                <div class="album-cover">
                    <img src="${album.coverUrl}" alt="${album.title}">
                    <div class="play-button"></div>
                </div>
                <div class="album-info">
                    <div class="album-title">${album.title}</div>
                    <div class="album-artist">${album.artist}</div>
                </div>
            </div>
        `;
    });
    
    // Add event listeners
    const albumCards = container.querySelectorAll('.album-card');
    albumCards.forEach(card => {
        card.addEventListener('click', () => {
            const albumId = card.getAttribute('data-album-id');
            const album = musicData.newReleases.find(a => a.id === albumId);
            if (album && album.songs && album.songs.length > 0) {
                playSong(album.songs[0]);
            }
        });
    });
}

// Load featured playlists
function loadFeaturedPlaylists() {
    const container = document.getElementById('featured-playlists');
    
    // Add playlists
    musicData.featuredPlaylists.forEach(playlist => {
        container.innerHTML += `
            <div class="album-card" data-playlist-id="${playlist.id}">
                <div class="album-cover">
                    <img src="${playlist.coverUrl}" alt="${playlist.title}">
                    <div class="play-button"></div>
                </div>
                <div class="album-info">
                    <div class="album-title">${playlist.title}</div>
                    <div class="album-artist">Playlist • Apple Music</div>
                </div>
            </div>
        `;
    });
    
    // Add event listeners
    const playlistCards = container.querySelectorAll('.album-card');
    playlistCards.forEach(card => {
        card.addEventListener('click', () => {
            const playlistId = card.getAttribute('data-playlist-id');
            const playlist = musicData.featuredPlaylists.find(p => p.id === playlistId);
            if (playlist && playlist.songs && playlist.songs.length > 0) {
                playSong(playlist.songs[0]);
            }
        });
    });
}

// Load radio stations
function loadRadioStations() {
    const featuredContainer = document.getElementById('featured-stations');
    const genreContainer = document.getElementById('genre-stations');
    
    // Add featured stations
    musicData.radioStations.featured.forEach(station => {
        featuredContainer.innerHTML += `
            <div class="radio-card" data-station-id="${station.id}">
                <div class="radio-cover">
                    <img src="${station.imageUrl}" alt="${station.name}">
                </div>
                <div class="radio-info">
                    <div class="radio-title">${station.name}</div>
                    <div class="radio-desc">${station.description}</div>
                </div>
            </div>
        `;
    });
    
    // Add genre stations
    musicData.radioStations.genres.forEach(station => {
        genreContainer.innerHTML += `
            <div class="radio-card" data-station-id="${station.id}">
                <div class="radio-cover">
                    <img src="${station.imageUrl}" alt="${station.name}">
                </div>
                <div class="radio-info">
                    <div class="radio-title">${station.name}</div>
                    <div class="radio-desc">${station.description}</div>
                </div>
            </div>
        `;
    });
    
    // Add event listeners
    const radioCards = document.querySelectorAll('.radio-card');
    radioCards.forEach(card => {
        card.addEventListener('click', () => {
            const stationId = card.getAttribute('data-station-id');
            showNotification(`Playing ${card.querySelector('.radio-title').textContent} radio`);
            
            // Simulate playing a random song from the station
            const randomSong = musicData.songs[Math.floor(Math.random() * musicData.songs.length)];
            playSong(randomSong.id);
        });
    });
}

// Load search categories
function loadSearchCategories() {
    const container = document.getElementById('search-categories');
    
    // Add categories
    musicData.categories.slice(0, 8).forEach(category => {
        container.innerHTML += `
            <div class="category-card">
                <div class="category-cover">
                    <img src="${category.imageUrl}" alt="${category.name}">
                    <div class="category-overlay">
                        <div class="category-title">${category.name}</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    // Add event listeners
    const categoryCards = container.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            showNotification(`Browsing ${card.querySelector('.category-title').textContent}`);
        });
    });
}

// Load playlists
function loadPlaylists() {
    const yourPlaylistsContainer = document.getElementById('your-playlists');
    const applePlaylistsContainer = document.getElementById('apple-playlists');
    
    // Add your playlists
    musicData.yourPlaylists.forEach(playlist => {
        yourPlaylistsContainer.innerHTML += `
            <div class="playlist-card" data-playlist-id="${playlist.id}">
                <div class="playlist-cover">
                    <img src="${playlist.coverUrl}" alt="${playlist.title}">
                </div>
                <div class="playlist-info">
                    <div class="playlist-title">${playlist.title}</div>
                    <div class="playlist-desc">${playlist.description}</div>
                    <div class="playlist-songs">${playlist.songCount} songs</div>
                </div>
            </div>
        `;
    });
    
    // Add Apple playlists
    musicData.applePlaylists.forEach(playlist => {
        applePlaylistsContainer.innerHTML += `
            <div class="playlist-card" data-playlist-id="${playlist.id}">
                <div class="playlist-cover">
                    <img src="${playlist.coverUrl}" alt="${playlist.title}">
                </div>
                <div class="playlist-info">
                    <div class="playlist-title">${playlist.title}</div>
                    <div class="playlist-desc">${playlist.description}</div>
                    <div class="playlist-songs">${playlist.songCount} songs</div>
                </div>
            </div>
        `;
    });
    
    // Add event listeners
    const playlistCards = document.querySelectorAll('.playlist-card');
    playlistCards.forEach(card => {
        card.addEventListener('click', () => {
            const playlistId = card.getAttribute('data-playlist-id');
            showNotification(`Playing ${card.querySelector('.playlist-title').textContent} playlist`);
            
            // Simulate playing a random song from the playlist
            const randomSong = musicData.songs[Math.floor(Math.random() * musicData.songs.length)];
            playSong(randomSong.id);
        });
    });
}

// Shazam API function
async function shazamApiSearch(query) {
    const url = `https://shazam-core.p.rapidapi.com/v1/search/suggest?query=${encodeURIComponent(query)}`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '73ec588339msh0aad14b831a7fb2p1fb80cjsnf7918996415b',
            'x-rapidapi-host': 'shazam-core.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Shazam API Error:', error);
        return null;
    }
}

