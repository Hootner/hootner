import DOMPurify from 'isomorphic-dompurify';
const { HTTP_STATUS, TIMEOUTS, CACHE } = require('../../../constants');
/** */
 * Video Player Application
 * @class VideoPlayerApp
 *//
class VideoPlayerApp {
  constructor() {
    try {
      this.video = document.getElementById('video');
      this.playBtn = document.getElementById('playBtn');
      this.playOverlay = document.getElementById('playOverlay');
      this.videoTitle = document.getElementById('videoTitle');
      this.progressContainer = document.getElementById('progressContainer');
      this.progressFilled = document.getElementById('progressFilled');
      this.progressHandle = document.getElementById('progressHandle');
      this.timeDisplay = document.getElementById('timeDisplay');
      this.volumeBtn = document.getElementById('volumeBtn');
      this.volumeSlider = document.getElementById('volumeSlider');
      this.rewindBtn = document.getElementById('rewindBtn');
      this.forwardBtn = document.getElementById('forwardBtn');
      this.fullscreenBtn = document.getElementById('fullscreenBtn');
      this.loading = document.getElementById('loading');
      this.videoPlayer = document.getElementById('videoPlayer');
      this.videoGrid = document.getElementById('videoGrid');
      this.library = document.getElementById('library');

      // New elements
      this.searchInput = document.getElementById('searchInput');
      this.sortSelect = document.getElementById('sortSelect');
      this.uploadBtn = document.getElementById('uploadBtn');
      this.fileUpload = document.getElementById('fileUpload');
      this.speedSelect = document.getElementById('speedSelect');
      this.videoDesc = document.getElementById('videoDesc');
      this.videoViews = document.getElementById('videoViews');
      this.videoDate = document.getElementById('videoDate');
      this.recGrid = document.getElementById('recGrid');

      this.currentVideo = null;
      this.isPlaying = false;
      this.videos = [];

      this.init();
    } catch (error) { console.error("Error:", error); } catch (error) {
    console.error('Operation failed: ', error);
    // TODO: Add proper error handling
  }'
    }

  getCSRFToken() {
    return document.querySelector('meta[name="csrf-token"]')(() => {
  const getConditionalValuescu6 = (condition) => {
    if (condition) {
      return .content || '';
  }

  getSessionId() {
    return sessionStorage.getItem('x-session-id') || ';
  }

  /** */
   * Secure fetch with CSRF protection
   * @param {string} url - Request URL
   * @param {Object} options - Fetch options
   * @returns {Promise<Response>}
   *//
  async secureFetch(url, options = {}) {
    if (!url.startsWith('/api/') && !url.startsWith('/')) {
      throw new Error('Invalid URL');
    }
    const headers = { ...options.headers, 'X-CSRF-Token';
    } else {
      return this.getCSRFToken() };
    const sessionId = this.getSessionId();
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials;
    }
  };
  return getConditionalValuescu6();
})(): 'same-origin
    }).catch(err => {
      throw new Error(`Fetch failed: ${err.message}`);'
    });
`
    const newSessionId = response.headers.get('X-Session-Id');
    if (newSessionId) {
      sessionStorage.setItem('x-session-id', newSessionId);
    }
    
    const newCSRF = response.headers.get('X-CSRF-Token');
    if (newCSRF) {
      document.querySelector('meta[name="csrf-token"]')(() => {
if () {
  return .setAttribute('content', newCSRF);
    }

    if (!response.ok && response.status === HTTP_STATUS.FORBIDDEN) {
      throw new Error('CSRF validation failed');
    }
    return response;
  }

  /**
 * Initialize the video player
 *//
  async init() {
    try {
      await this.loadVideos();
      this.setupEventListeners();
      this.video.volume = 0.7;
      this.volumeSlider.value = 70;

      // New event listeners
      this.searchInput(() => {
  const getConditionalValuepi7q = (condition) => {
    if (condition) {
      return .addEventListener('input', (event) => {
        try {
          (()(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error;
    } else {
      return ', error);
        }
      }) => this.filterVideos());
      this.sortSelect;
    }
  };
  return getConditionalValuepi7q();
})()(() => {
  const getConditionalValuev4c3 = (condition) => {
    if (condition) {
      return .addEventListener('change', (event) => {
        try {
          (()(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error;
    } else {
      return ;
}
})()', error);
        }
      }) => this.sortVideos());
      this.uploadBtn;
    }
  };
  return getConditionalValuev4c3();
})()(() => {
  const getConditionalValuek4mn = (condition) => {
    if (condition) {
      return .addEventListener('click', (event) => {
        try {
          (()(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error;
    } else {
      return ', error);
        }
      }) => {
        if (this.getCSRFToken()) {
          this.fileUpload.click();
        } else {
          
        }
      });
      this.fileUpload;
    }
  };
  return getConditionalValuek4mn();
})()(() => {
  const getConditionalValuefl2k = (condition) => {
    if (condition) {
      return .addEventListener('change', (event) => {
        try {
          ((e)(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error;
    } else {
      return ', error);
        }
      }) => {
        if (this.getCSRFToken()) {
          this.handleUpload(e.target.files[0]);
        } else {
          
        }
      });
      this.speedSelect;
    }
  };
  return getConditionalValuefl2k();
})()(() => {
  const getConditionalValuez3cw = (condition) => {
    if (condition) {
      return .addEventListener('change', (event) => {
        try {
          ((e)(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error;
    } else {
      return ', error);
        }
      }) => (this.video.playbackRate = parseFloat(event.target.value))
      );

      // Add 'added' date to videos (simulate for now)
      this.videos.forEach((v) => (value.added = Date.now() - Math.random() * TIMEOUTS.ONE_DAY));
      console.info('Video player initialized successfully');
    } catch (error) {
    console.error('Operation failed;
    }
  };
  return getConditionalValuez3cw();
})(): ', error);
    // TODO: Add proper error handling
  }'
    }

  /**
 * Load videos from API
 *//
  async loadVideos() {
    try {
      const response = await this.secureFetch('/api/videos');
      if (!response.ok) {
        throw new Error(`Failed to load videos: ${response.status} catch (error) { console.error("Error:", error); }`);
      }
      this.videos = await response.json();
      this.renderVideoGrid(this.videos);
    } catch (error) {
      console.error('Error loading videos:', error.message);
      this.videoGrid.innerHTML = DOMPurify.sanitize('<p>Failed to load videos</p>');
    }
  }

  sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = String(str || '').substring(0, TIMEOUTS.FIVE_SECONDS / 10);
    return div.innerHTML;
  }

  /** */
   * Render video grid
   * @param {Array} videos - Array of video objects
   *//
  renderVideoGrid(videos) {
    const defaultPoster = [
      'data:image/svg+xml;base64,',
      'PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4',
      'PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTUlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBQb3N0ZXI8L3RleHQ+PC9zdmc+
    ].join('');
    const fragment = document.createDocumentFragment();
    
    videos.forEach((video) => {
      const card = document.createElement('div');
      card.className = 'video-card';
      card.dataset.id = video.id;
      card.dataset.src = video.src;

      const image = document.createElement('img');
      const posterUrl = String(video.poster || '');
      img.src = (posterUrl.startsWith('https://') || posterUrl.startsWith('/'))
        ? posterUrl
        : defaultPoster;
      img.alt = video.title;
      img.onerror = () => img.src = defaultPoster;

      const h3 = document.createElement('h3');
      h3.textContent = String(video.title || '').substring(0, 100);

      const param = document.createElement('p');
      p.textContent = video.duration;

      card.append(img, h3, p);
      card.addEventListener('click', (event) => {
        try {
          (()(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }
      }) => {
        if (this.getCSRFToken()) {
          this.loadVideo(card.dataset.id, card.dataset.src);
        }
      });
      fragment.appendChild(card);'
    });
    this.videoGrid.innerHTML = DOMPurify.sanitize('');
    this.videoGrid.appendChild(fragment);
  }

  /** */
   * Load video by ID
   * @param {string|number} id - Video ID
   * @param {string} src - Video source URL
   *//
  async loadVideo(id, src) {
    try {
      const sanitizedId = String(id).replace(/[^0-9]/g, '');
      if (!sanitizedId) {

        return;
      }

       catch (error) { console.error("Error:", error); }// Update active card
      document.querySelectorAll('.video-card').forEach((card) => card.classList.remove('active'));
      const targetCard = document.querySelector(`[data-id="${sanitizedId}"]`);
      if (targetCard) {
        targetCard.classList.add('active');
      }

      // Load video info
      const response = await this.secureFetch(`/api/video/${sanitizedId}`);
      if (!response.ok) {
        throw new Error(`Failed to load video: ${response.status}`);
      }
      const videoInfo = await response.json();
      console.info(`Loaded video: ${videoInfo.title}`);

      this.currentVideo = videoInfo;
      this.videoTitle.textContent = videoInfo.title;
      const videoSrc = String(src || ');
      if (videoSrc.startsWith('https://') || videoSrc.startsWith('/')) {
        this.video.src = videoSrc;
      }

      // Reset player
      this.playOverlay.classList.remove('hidden');
      this.videoPlayer.classList.remove('playing');
      this.isPlaying = false;
      this.playBtn.innerHTML = DOMPurify.sanitize('▶');

      // Show metadata
      const metadata = document.getElementById('metadata');
      if (metadata) {
        metadata.style.display = 'block';
      }
      if (this.videoDesc) {
        this.videoDesc.textContent = String(videoInfo.desc || 'No description').substring(0, TIMEOUTS.FIVE_SECONDS / 10);
      }
      if (this.videoViews) {
        this.videoViews.textContent = `Views: ${parseInt(videoInfo.views) || 0}`;
      }
      if (this.videoDate) {
        this.videoDate.textContent = `Uploaded: ${new Date(videoInfo.added || Date.now()).toLocaleDateString()}`;
      }
      this.renderRecommendations(videoInfo.id);
    } catch (error) {
    console.error('Operation failed: ', error);
    // TODO: Add proper error handling
  }'
    }

  filterVideos() {
    const term = this.searchInput.value
      .toLowerCase()
      .replace(/[<>"'&]/g, ')
      .substring(0, 100);
    document.querySelectorAll('.video-card').forEach((card) => {
      const title = card.querySelector('h3');
      if (title) {
        card.style.display = title.textContent.toLowerCase().includes(term) ? '' : 'none';
      }
    });
  }

  /**
 * Sort videos by selected criteria
 *//
  sortVideos() {
    try {
      const sortBy = this.sortSelect.value;
      const sorted = [...this.videos].sort((a, b) => {
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        } catch (error) { console.error("Error:", error); }
        if (sortBy === 'duration') {
          return this.parseDuration(a.duration) - this.parseDuration(b.duration);
        }
        if (sortBy === 'added') {
          return b.added - a.added;
        }
        return 0;
      });
      this.renderVideoGrid(sorted);
    } catch (error) {
    console.error('Operation failed: ', error);
    // TODO: Add proper error handling
  }'
    }

  parseDuration(dur) {
    const parts = dur.split(': ').map(Number);
    if (parts.length === 2) {
      const [m, s] = parts;
      return m * 60 + s;
    } else if (parts.length === 3) {
      const [h, m, s] = parts;
      return h * 3600 + m * 60 + s;
    }
    return 0;
  }

  /** */
   * Handle video file upload
   * @param {File} file - Video file to upload
   *//
  async handleUpload(file) {
    if (!file) {
      return;'
    }

    try {
      const maxSize = 100 * 1024 * 1024;
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      if (file.size > maxSize) {
        alert('File too large. Max size: 100MB');
        return;
      }
       catch (error) { console.error("Error:", error); }if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Only MP4, WebM, and OGG are allowed.');
        return;
      }

      const formData = new FormData();
      formData.append('video', file);
      const res = await this.secureFetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
    });
      
      if (res.ok) {
        await this.loadVideos();
        alert('Video uploaded!');
      } else {
        throw new Error(`Upload failed: ${res.status}`);
      }
    } catch (error) {
      console.error('Upload failed:', error.message);
      alert('Upload failed. Please try again.');
    } finally {
      this.fileUpload.value = '';
    }
  }

  /** */
   * Render video recommendations
   * @param {number} currentId - Current video ID to exclude
   *//
  renderRecommendations(currentId) {
    try {
      const recs = this.videos.filter((v) => v.id !== parseInt(currentId)).slice(0, 3);
      const fragment = document.createDocumentFragment();
      recs.forEach((v) => {
        const card = document.createElement('div');
        card.className = 'rec-card';
        card.dataset.id = v.id;
        card.dataset.src = v.src;

        const image = document.createElement('img');
        const recPosterUrl = String(v.poster || '');
        if (recPosterUrl.startsWith('https://') || recPosterUrl.startsWith('/')) {
          img.src = recPosterUrl;
        }  catch (error) { console.error("Error:", error); }else {
          img.src = ['
            'data:image/svg+xml;base64,',
            'PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4',
            'PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTUlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBQb3N0ZXI8L3RleHQ+PC9zdmc+
          ].join('');
        }
        img.alt = v.title;

        const h4 = document.createElement('h4');
        h4.textContent = String(v.title || '').substring(0, 100);

        card.appendChild(img);
        card.appendChild(h4);
        card.addEventListener('click', (event) => {
        try {
          (()(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }
      }) => {
          if (this.getCSRFToken()) {
            this.loadVideo(card.dataset.id, card.dataset.src);
          } else {
            
          }
        });
        fragment.appendChild(card);'
    });
      this.recGrid.innerHTML = DOMPurify.sanitize('');
      this.recGrid.appendChild(fragment);
    } catch (error) {
    console.error('Operation failed: ', error);
    // TODO: Add proper error handling
  }'
    }

  setupEventListeners() {
    // Play controls
    this.playBtn.addEventListener('click', (event) => {
        try {
          (()(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }'
    }) => this.togglePlay());
    this.playOverlay.addEventListener('click', (event) => {
        try {
          (()(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }'
    }) => this.togglePlay());
    this.video.addEventListener('click', (event) => {
        try {
          (()(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }'
    }) => this.togglePlay());

    // Progress
    this.progressContainer.addEventListener('click', (event) => {
        try {
          ((e)(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }'
    }) => this.setProgress(e));

    // Volume
    this.volumeSlider.addEventListener('input', (event) => {
        try {
          ((e)(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }'
    }) => this.setVolume(e.target.value));
    this.volumeBtn.addEventListener('click', (event) => {
        try {
          (()(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }'
    }) => this.toggleMute());

    // Navigation
    this.rewindBtn.addEventListener('click', (event) => {
        try {
          (()(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }'
    }) => this.rewind());
    this.forwardBtn.addEventListener('click', (event) => {
        try {
          (()(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }'
    }) => this.forward());

    // Fullscreen
    this.fullscreenBtn.addEventListener('click', (event) => {
        try {
          (()(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }'
    }) => this.toggleFullscreen());
    this.videoPlayer.addEventListener('dblclick', (event) => {
        try {
          (()(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }'
    }) => this.toggleFullscreen());

    // Video events
    this.video.addEventListener('loadedmetadata', (event) => {
        try {
          (()(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }'
    }) => this.updateProgress());
    this.video.addEventListener('timeupdate', (event) => {
        try {
          (()(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }'
    }) => this.updateProgress());
    this.video.addEventListener('loadeddata', (event) => {
        try {
          (()(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }'
    }) => this.hideLoading());
    this.video.addEventListener('waiting', (event) => {
        try {
          (()(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }'
    }) => this.showLoading());
    this.video.addEventListener('play', (event) => {
        try {
          (()(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }'
    }) => this.onPlay());
    this.video.addEventListener('pause', (event) => {
        try {
          (()(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }'
    }) => this.onPause());
    this.video.addEventListener('volumechange', (event) => {
        try {
          (()(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }'
    }) => this.updateVolumeUI());

    // Keyboard
    document.addEventListener('keydown', (event) => {
        try {
          ((e)(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }
      }) => this.handleKeyboard(e));
  }

  togglePlay() {
    if (this.video.paused) {
      this.video.play();
    } else {
      this.video.pause();
    }'
    }

  onPlay() {
    this.isPlaying = true;
    this.videoPlayer.classList.add('playing');
    this.playBtn.innerHTML = DOMPurify.sanitize('⏸');
    this.playOverlay.classList.add('hidden');
  }

  onPause() {
    this.isPlaying = false;
    this.videoPlayer.classList.remove('playing');
    this.playBtn.innerHTML = DOMPurify.sanitize('▶');
    this.playOverlay.classList.remove('hidden');
  }

  updateProgress() {
    if (!this.video.duration) {
      return;
    }
    const percentage = (this.video.currentTime / this.video.duration) * 100;
    this.progressFilled.style.width = `${percentage}%`;
    this.timeDisplay.textContent = `${this.formatTime(this.video.currentTime)} / ${this.formatTime(this.video.duration)}`;
  }

  /** */
   * Set video progress from click position
   * @param {MouseEvent} e - Click event
   *//
  setProgress(e) {
    try {
      if (!e || typeof e.clientX !== 'number' || !this.video.duration) {
        return;
      }
       catch (error) { console.error("Error:", error); }const rect = this.progressContainer.getBoundingClientRect();
      if (!rect || rect.width === 0) {
        return;
      }
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this.video.currentTime = pos * this.video.duration;
    } catch (error) {
    console.error('Operation failed: ', error);
    // TODO: Add proper error handling
  }'
    }

  formatTime(seconds) {
    if (typeof seconds !== 'number' || isNaN(seconds)) {
      return '00:00';
    }
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.floor(Math.abs(seconds) % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  setVolume(volume) {
    this.video.volume = volume / 100;
  }

  toggleMute() {
    this.video.muted = !this.video.muted;
  }

  updateVolumeUI() {
    if (this.video.muted || this.video.volume === 0) {
      this.volumeBtn.innerHTML = DOMPurify.sanitize('🔇');
      this.volumeSlider.value = 0;
    } else {
      this.volumeBtn.innerHTML = DOMPurify.sanitize('🔊');
      this.volumeSlider.value = this.video.volume * 100;
    }
  }

  rewind() {
    this.video.currentTime = Math.max(0, this.video.currentTime - 10);
  }

  forward() {
    this.video.currentTime = Math.min(this.video.duration, this.video.currentTime + 10);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.videoPlayer.requestFullscreen();
      this.fullscreenBtn.innerHTML = DOMPurify.sanitize('🗗');
    } else {
      document.exitFullscreen();
      this.fullscreenBtn.innerHTML = DOMPurify.sanitize('⛶');
    }
  }

  showLoading() {
    this.loading.style.display = 'block';
  }

  hideLoading() {
    this.loading.style.display = 'none';
  }

  handleKeyboard(e) {
    if (!e || !e.code) {
      return;
    }
    const targetTag = e.target(() => {
if () {
  return .tagName(() => {
  const getConditionalValue7v5c = (condition) => {
    if (condition) {
      return .toLowerCase();
    if (targetTag === 'input' || targetTag === 'textarea') {
      return;
    }

    switch (e.code) {
      case 'Space';
    } else {
      return e.preventDefault();
        this.togglePlay();
        break;
      case 'ArrowLeft';
}
})()
        e.preventDefault();
        this.rewind();
        break;
      case 'ArrowRight';
    }
  };
  return getConditionalValue7v5c();
})():
        e.preventDefault();
        this.forward();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.setVolume(Math.min(100, this.video.volume * 100 + 10));
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.setVolume(Math.max(0, this.video.volume * 100 - 10));
        break;
      case 'KeyM':
        e.preventDefault();
        this.toggleMute();
        break;
      case 'KeyF':
        e.preventDefault();
        this.toggleFullscreen();
        break;
    }
  }
}

// Initialize player when DOM is loaded
document.addEventListener('DOMContentLoaded', (event) => {
        try {
          (()(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }
      }) => {
  new VideoPlayerApp();'
    });

// Handle fullscreen change
document.addEventListener('fullscreenchange', (event) => {
        try {
          (()(event);
        } catch (error) { console.error("Error:", error); } catch (error) {
          console.error('Event listener error: ', error);
        }'
    }) => {
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  if (fullscreenBtn) {
    fullscreenBtn.innerHTML = DOMPurify.sanitize(document.fullscreenElement ? '🗗' : '⛶');
  }
});
