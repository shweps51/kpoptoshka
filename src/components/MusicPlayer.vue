<template>
  <div class="music-player">
    <div class="player-card">
      <div class="album-art">
        🎧
      </div>
      <div class="song-info">
        <h3>{{ currentSong.title }}</h3>
        <p>{{ currentSong.artist }}</p>
      </div>
      
      <div class="track-nav">
        <button @click="prevTrack" class="nav-track-btn">⏮️</button>
        <span class="track-counter">{{ currentTrackIndex + 1 }} / {{ playlist.length }}</span>
        <button @click="nextTrack" class="nav-track-btn">⏭️</button>
      </div>

      <div class="player-controls">
        <button @click="togglePlay" class="play-btn">
          {{ isPlaying ? '⏸️' : '▶️' }}
        </button>
        <audio 
          ref="audioElement" 
          :src="currentSong.src" 
          @timeupdate="updateProgress"
          @loadedmetadata="setDuration"
          @ended="nextTrack"
        ></audio>
      </div>

      <div class="progress-section">
        <span class="time">{{ formatTime(currentTime) }}</span>
        <div class="progress-bar" @click="seek">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <span class="time">{{ formatTime(duration) }}</span>
      </div>
    </div>

    <div class="playlist">
      <h4>📋 Плейлист ({{ playlist.length }} песен)</h4>
      <div class="playlist-items">
        <div 
          v-for="(song, index) in playlist" 
          :key="index"
          @click="selectTrack(index)"
          :class="['playlist-item', { active: currentTrackIndex === index }]"
        >
          <div class="playlist-number">{{ index + 1 }}</div>
          <div class="playlist-info">
            <div class="playlist-title">{{ song.title }}</div>
            <div class="playlist-artist">{{ song.artist }}</div>
          </div>
          <div class="playlist-play">▶️</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const playlist = ref([
  { 
    title: 'Its Me', 
    artist: 'ILLIT', 
    src: '/music/itsme.mp3' 
  },
  { 
    title: 'ALL FOR YOU', 
    artist: 'ILLIT', 
    src: '/music/all4u.mp3' 
  },
  { 
    title: 'Billyeoon Goyangi (Do the Dance)', 
    artist: 'ILLIT', 
    src: '/music/BG.mp3' 
  },
  { 
    title: '20cm', 
    artist: 'TOMORROW X TOGETHER', 
    src: '/music/20cm.mp3' 
  },
  { 
    title: '21st Century Romance', 
    artist: 'TOMORROW X TOGETHER', 
    src: '/music/Romance.mp3' 
  },
  { 
    title: 'Dirty Work', 
    artist: 'aespa', 
    src: '/music/dirtywork.mp3' 
  },
  { 
    title: 'New World', 
    artist: 'ateez', 
    src: '/music/newworld.mp3' 
  },
  { 
    title: 'Pretty Boy', 
    artist: 'P1Harmony', 
    src: '/music/prettyboy.mp3' 
  },
  { 
    title: 'Ash', 
    artist: 'ateez', 
    src: '/music/ash.mp3' 
  },
  { 
    title: 'Stunner', 
    artist: 'TEN', 
    src: '/music/stunner.mp3' 
  }
])

const currentTrackIndex = ref(0)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const audioElement = ref(null)
const progressPercent = ref(0)

const currentSong = ref(playlist.value[0])

function selectTrack(index) {
  currentTrackIndex.value = index
  currentSong.value = playlist.value[index]
  
  if (audioElement.value) {
    audioElement.value.load()
    
    // Если до переключения музыка играла, запускаем новый трек
    if (isPlaying.value) {
      setTimeout(() => {
        if (audioElement.value) {
          audioElement.value.play()
        }
      }, 50)
    }
  }
}

function nextTrack() {
  const nextIndex = (currentTrackIndex.value + 1) % playlist.value.length
  selectTrack(nextIndex)
}

function prevTrack() {
  const prevIndex = (currentTrackIndex.value - 1 + playlist.value.length) % playlist.value.length
  selectTrack(prevIndex)
}

function togglePlay() {
  if (!audioElement.value) return
  
  if (isPlaying.value) {
    audioElement.value.pause()
    isPlaying.value = false
  } else {
    audioElement.value.play()
    isPlaying.value = true
  }
}

function updateProgress() {
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime
    if (duration.value > 0) {
      progressPercent.value = (currentTime.value / duration.value) * 100
    }
  }
}

function setDuration() {
  if (audioElement.value) {
    duration.value = audioElement.value.duration
  }
}

function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' + secs : secs}`
}

function seek(event) {
  if (!audioElement.value || !duration.value) return
  
  const bar = event.currentTarget
  const rect = bar.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  audioElement.value.currentTime = percent * duration.value
}
</script>

<style scoped>
.music-player {
  background: #B0A8D9;
  border-radius: 32px;
  padding: 24px;
  margin-bottom: 20px;
}

.theme-dark .music-player {
  background: #2d2d4a;
}

.player-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.album-art {
  font-size: 80px;
  background: rgba(255,255,255,0.2);
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 30px;
  margin-bottom: 20px;
}

.song-info h3 {
  font-size: 22px;
  color: white;
  margin-bottom: 6px;
}

.song-info p {
  color: rgba(255,255,255,0.8);
  font-size: 14px;
  margin-bottom: 15px;
}

.track-nav {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.nav-track-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  font-size: 20px;
  padding: 8px 16px;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
}

.nav-track-btn:hover {
  background: rgba(255,255,255,0.4);
  transform: scale(1.05);
}

.track-counter {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.play-btn {
  background: white;
  border: none;
  font-size: 32px;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.time {
  font-size: 12px;
  color: white;
  min-width: 40px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255,255,255,0.3);
  border-radius: 4px;
  cursor: pointer;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: white;
  border-radius: 4px;
  width: 0%;
  transition: width 0.1s linear;
}

.playlist {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.2);
}

.playlist h4 {
  font-size: 16px;
  color: white;
  margin-bottom: 12px;
  text-align: left;
}

.playlist-items {
  max-height: 250px;
  overflow-y: auto;
  border-radius: 16px;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(255,255,255,0.1);
  margin-bottom: 6px;
}

.playlist-item:hover {
  background: rgba(255,255,255,0.2);
  transform: translateX(5px);
}

.playlist-item.active {
  background: rgba(255,255,255,0.3);
  border-left: 4px solid white;
}

.playlist-number {
  font-size: 14px;
  color: white;
  font-weight: 600;
  min-width: 30px;
}

.playlist-info {
  flex: 1;
  text-align: left;
}

.playlist-title {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.playlist-artist {
  font-size: 11px;
  color: rgba(255,255,255,0.7);
}

.playlist-play {
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.3s;
  color: white;
}

.playlist-item:hover .playlist-play {
  opacity: 1;
}

.playlist-items::-webkit-scrollbar {
  width: 4px;
}

.playlist-items::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
}

.playlist-items::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.4);
  border-radius: 4px;
}
</style>