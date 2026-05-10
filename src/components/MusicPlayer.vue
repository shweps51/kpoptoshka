<template>
  <div class="music-player">
    <div class="player-card">
      <!-- Анимированная обложка -->
      <div class="album-art" :class="{ playing: isPlaying }">
        <div class="vinyl-disc" v-if="isPlaying">
          <div class="vinyl-spin"></div>
        </div>
        <span class="album-emoji" v-else>🎤</span>
      </div>
      
      <div class="song-info">
        <h3>{{ currentSong.title }}</h3>
        <p>{{ currentSong.artist }}</p>
        <div class="mood-tag" v-if="currentSong.mood">
          <span>{{ getMoodIcon(currentSong.mood) }}</span>
          <span>{{ currentSong.mood }}</span>
        </div>
      </div>
      
      <!-- Управление в одну строку -->
      <div class="controls-row">
        <button @click="prevTrack" class="control-btn" title="Предыдущий трек">⏮️</button>
        <button @click="randomTrack" class="control-btn" title="Случайный трек">🔀</button>
        <button @click="togglePlay" class="play-btn-small">
          {{ isPlaying ? '⏸️' : '▶️' }}
        </button>
        <button @click="nextTrack" class="control-btn" title="Следующий трек">⏭️</button>
      </div>

      <audio 
        ref="audioElement" 
        :src="currentSong.src" 
        @timeupdate="updateProgress"
        @loadedmetadata="setDuration"
        @ended="nextTrack"
      ></audio>

      <div class="progress-section">
        <span class="time">{{ formatTime(currentTime) }}</span>
        <div class="progress-bar" @click="seek">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <span class="time">{{ formatTime(duration) }}</span>
      </div>

      <!-- Текст заметки к песне -->
      <div class="note-quote" v-if="currentNoteText">
        <span class="quote-icon">📝</span>
        <span class="quote-text">"{{ currentNoteText }}"</span>
      </div>
      <div class="note-quote" v-else>
        <span class="quote-icon">💭</span>
        <span class="quote-text">Нет заметок к этой песне...</span>
      </div>
    </div>

    <div class="playlist-layout">
      <!-- Левая часть: Группы и список песен -->
      <div class="playlist-left">
        <div class="playlist-header">
          <h4>🎵 K-pop Плейлист</h4>
        </div>
        
        <!-- Фильтр по группам -->
        <div class="groups-section">
          <span class="section-label">Группы:</span>
          <div class="groups-buttons">
            <div 
              v-for="group in uniqueGroups" 
              :key="group"
              class="group-chip-wrapper"
            >
              <button 
                @click="toggleGroup(group)"
                :class="['group-chip', { active: selectedGroups.includes(group) }]"
              >
                {{ group }}
              </button>
              <button 
                v-if="selectedGroups.includes(group)"
                @click="removeGroup(group)"
                class="remove-chip"
              >
                ✖
              </button>
            </div>
          </div>
        </div>

        <div class="playlist-items">
          <div 
            v-for="(song, index) in filteredPlaylist" 
            :key="index"
            @click="selectTrack(originalIndex(index))"
            :class="['playlist-item', { active: currentTrackIndex === originalIndex(index) }]"
          >
            <div class="playlist-info">
              <div class="playlist-title">{{ song.title }}</div>
              <div class="playlist-artist">{{ song.artist }}</div>
            </div>
            <div class="playlist-tags">
              <span class="mood-badge" v-if="song.mood">{{ getMoodIcon(song.mood) }}</span>
              <span class="play-indicator" v-if="currentTrackIndex === originalIndex(index) && isPlaying">🎵</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Правая часть: Фильтр по настроениям -->
      <div class="playlist-right">
        <div class="moods-section">
          <span class="section-label">😊 Настроение:</span>
          <div class="moods-buttons">
            <div 
              v-for="mood in uniqueMoods" 
              :key="mood"
              class="mood-chip-wrapper"
            >
              <button 
                @click="toggleMood(mood)"
                :class="['mood-chip', { active: selectedMoods.includes(mood) }]"
              >
                {{ getMoodIcon(mood) }} {{ mood }}
              </button>
              <button 
                v-if="selectedMoods.includes(mood)"
                @click="removeMood(mood)"
                class="remove-chip"
              >
                ✖
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from '../composables/useStore'

const { notes } = useStore()

const playlist = ref([
  { 
    title: 'Its Me', 
    artist: 'ILLIT', 
    group: 'ILLIT',
    src: import.meta.env.BASE_URL + 'music/itsme.mp3', 
    mood: 'счастливое'
  },
  { 
    title: 'ALL FOR YOU', 
    artist: 'ILLIT', 
    group: 'ILLIT',
    src: import.meta.env.BASE_URL + 'music/all4u.mp3', 
    mood: 'романтичное'
  },
  { 
    title: 'Billyeoon Goyangi (Do the Dance)', 
    artist: 'ILLIT', 
    group: 'ILLIT',
    src: import.meta.env.BASE_URL + 'music/BG.mp3', 
    mood: 'энергичное'
  },
  { 
    title: '20cm', 
    artist: 'TOMORROW X TOGETHER', 
    group: 'TXT',
    src: import.meta.env.BASE_URL + 'music/20cm.mp3', 
    mood: 'ностальгичное'
  },
  { 
    title: '21st Century Romance', 
    artist: 'TOMORROW X TOGETHER', 
    group: 'TXT',
    src: import.meta.env.BASE_URL + 'music/Romance.mp3', 
    mood: 'романтичное'
  },
  { 
    title: 'Dirty Work', 
    artist: 'aespa', 
    group: 'aespa',
    src: import.meta.env.BASE_URL + 'music/dirtywork.mp3', 
    mood: 'уверенное'
  },
  { 
    title: 'New World', 
    artist: 'ateez', 
    group: 'ateez',
    src: import.meta.env.BASE_URL + 'music/newworld.mp3', 
    mood: 'вдохновляющее'
  },
  { 
    title: 'Pretty Boy', 
    artist: 'P1Harmony', 
    group: 'P1Harmony',
    src: import.meta.env.BASE_URL + 'music/prettyboy.mp3', 
    mood: 'уверенное'
  },
  { 
    title: 'Ash', 
    artist: 'ateez', 
    group: 'ateez',
    src: import.meta.env.BASE_URL + 'music/ash.mp3', 
    mood: 'меланхоличное'
  },
  { 
    title: 'Stunner', 
    artist: 'TEN', 
    group: 'TEN',
    src: import.meta.env.BASE_URL + 'music/stunner.mp3', 
    mood: 'энергичное'
  }
])

const currentTrackIndex = ref(0)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const audioElement = ref(null)
const progressPercent = ref(0)
const selectedGroups = ref([])
const selectedMoods = ref([])
const currentNoteText = ref('')

const currentSong = ref(playlist.value[0])

// Уникальные группы
const uniqueGroups = computed(() => {
  const groups = [...new Set(playlist.value.map(song => song.group))]
  return groups.sort()
})

// Уникальные настроения
const uniqueMoods = computed(() => {
  const moods = [...new Set(playlist.value.map(song => song.mood))]
  return moods.sort()
})

// Фильтрованный плейлист
const filteredPlaylist = computed(() => {
  let result = [...playlist.value]
  
  // Фильтр по группам (если выбраны)
  if (selectedGroups.value.length > 0) {
    result = result.filter(song => selectedGroups.value.includes(song.group))
  }
  
  // Фильтр по настроениям (если выбраны)
  if (selectedMoods.value.length > 0) {
    result = result.filter(song => selectedMoods.value.includes(song.mood))
  }
  
  return result
})

// Переключение группы
function toggleGroup(group) {
  if (selectedGroups.value.includes(group)) {
    selectedGroups.value = selectedGroups.value.filter(g => g !== group)
  } else {
    selectedGroups.value.push(group)
  }
}

// Удаление группы
function removeGroup(group) {
  selectedGroups.value = selectedGroups.value.filter(g => g !== group)
}

// Переключение настроения
function toggleMood(mood) {
  if (selectedMoods.value.includes(mood)) {
    selectedMoods.value = selectedMoods.value.filter(m => m !== mood)
  } else {
    selectedMoods.value.push(mood)
  }
}

// Удаление настроения
function removeMood(mood) {
  selectedMoods.value = selectedMoods.value.filter(m => m !== mood)
}

// Получить случайный текст заметки для песни
function getRandomNoteForSong(songTitle, songArtist) {
  const songNotes = notes.value.filter(note => 
    note.selectedSong && 
    note.selectedSong.title === songTitle && 
    note.selectedSong.artist === songArtist
  )
  
  if (songNotes.length === 0) return null
  
  const randomIndex = Math.floor(Math.random() * songNotes.length)
  const note = songNotes[randomIndex]
  return note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content
}

// Обновить текст заметки для текущей песни
function updateCurrentNote() {
  const noteText = getRandomNoteForSong(currentSong.value.title, currentSong.value.artist)
  currentNoteText.value = noteText
}

// Функция для получения оригинального индекса
function originalIndex(filteredIndex) {
  let filtered = [...playlist.value]
  
  if (selectedGroups.value.length > 0) {
    filtered = filtered.filter(song => selectedGroups.value.includes(song.group))
  }
  
  if (selectedMoods.value.length > 0) {
    filtered = filtered.filter(song => selectedMoods.value.includes(song.mood))
  }
  
  const song = filtered[filteredIndex]
  return playlist.value.findIndex(s => s.title === song.title && s.artist === song.artist)
}

// Получить иконку настроения
function getMoodIcon(mood) {
  const icons = {
    'счастливое': '😊',
    'романтичное': '💕',
    'энергичное': '🔥',
    'ностальгичное': '💭',
    'уверенное': '✨',
    'вдохновляющее': '💜',
    'меланхоличное': '🌙'
  }
  return icons[mood] || '🎵'
}

// Случайный трек
function randomTrack() {
  if (filteredPlaylist.value.length === 0) return
  const randomIndex = Math.floor(Math.random() * filteredPlaylist.value.length)
  const realIndex = originalIndex(randomIndex)
  selectTrack(realIndex)
}

function selectTrack(index) {
  currentTrackIndex.value = index
  currentSong.value = playlist.value[index]
  updateCurrentNote()
  
  if (audioElement.value) {
    audioElement.value.load()
    
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
  if (filteredPlaylist.value.length === 0) return
  
  const currentFilteredIndex = filteredPlaylist.value.findIndex(song => 
    song.title === currentSong.value.title && song.artist === currentSong.value.artist
  )
  
  let nextIndex
  if (currentFilteredIndex !== -1) {
    nextIndex = (currentFilteredIndex + 1) % filteredPlaylist.value.length
    const nextSong = filteredPlaylist.value[nextIndex]
    const realIndex = playlist.value.findIndex(s => s.title === nextSong.title)
    selectTrack(realIndex)
  } else {
    const firstSong = filteredPlaylist.value[0]
    const realIndex = playlist.value.findIndex(s => s.title === firstSong.title)
    selectTrack(realIndex)
  }
}

function prevTrack() {
  if (filteredPlaylist.value.length === 0) return
  
  const currentFilteredIndex = filteredPlaylist.value.findIndex(song => 
    song.title === currentSong.value.title && song.artist === currentSong.value.artist
  )
  
  let prevIndex
  if (currentFilteredIndex !== -1) {
    prevIndex = (currentFilteredIndex - 1 + filteredPlaylist.value.length) % filteredPlaylist.value.length
    const prevSong = filteredPlaylist.value[prevIndex]
    const realIndex = playlist.value.findIndex(s => s.title === prevSong.title)
    selectTrack(realIndex)
  } else {
    const firstSong = filteredPlaylist.value[0]
    const realIndex = playlist.value.findIndex(s => s.title === firstSong.title)
    selectTrack(realIndex)
  }
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

// Следим за изменением заметок, чтобы обновлять текст
watch([notes, currentSong], () => {
  updateCurrentNote()
}, { deep: true })

onMounted(() => {
  updateCurrentNote()
})
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
  position: relative;
}

/* Анимированная обложка */
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
  transition: all 0.3s;
}

.album-art.playing {
  animation: pulse 2s infinite;
  box-shadow: 0 0 20px rgba(255,255,255,0.3);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.vinyl-disc {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vinyl-spin {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: repeating-radial-gradient(circle at center, #333 0px, #333 2px, #555 2px, #555 8px);
  animation: spin 3s linear infinite;
  box-shadow: 0 0 10px rgba(0,0,0,0.3);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.album-emoji {
  font-size: 60px;
}

.song-info h3 {
  font-size: 22px;
  color: white;
  margin-bottom: 6px;
}

.song-info p {
  color: rgba(255,255,255,0.8);
  font-size: 14px;
  margin-bottom: 10px;
}

.mood-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  color: white;
  margin-bottom: 15px;
}

/* Управление в одну строку */
.controls-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.control-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  font-size: 24px;
  padding: 10px 18px;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
}

.control-btn:hover {
  background: rgba(255,255,255,0.4);
  transform: scale(1.05);
}

.play-btn-small {
  background: white;
  border: none;
  font-size: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  color: #5a4a8c;
}

.play-btn-small:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-bottom: 20px;
}

.time {
  font-size: 12px;
  color: white;
  min-width: 40px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,0.3);
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #CDB4F3, white);
  border-radius: 4px;
  width: 0%;
  transition: width 0.1s linear;
}

/* Текст заметки */
.note-quote {
  background: rgba(255,255,255,0.15);
  border-radius: 20px;
  padding: 12px 16px;
  margin: 10px 0 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: white;
  text-align: left;
  width: 100%;
  font-style: italic;
  line-height: 1.4;
}

.quote-icon {
  font-size: 18px;
  min-width: 28px;
}

.quote-text {
  flex: 1;
}

/* Новая двухколоночная компоновка */
.playlist-layout {
  display: flex;
  gap: 24px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.2);
}

.playlist-left {
  flex: 2;
}

.playlist-right {
  flex: 1;
  min-width: 160px;
}

.playlist-header {
  margin-bottom: 16px;
}

.playlist-header h4 {
  font-size: 18px;
  color: white;
  text-align: left;
  margin: 0;
}

/* Секция групп */
.groups-section {
  margin-bottom: 20px;
}

.section-label {
  display: block;
  font-size: 13px;
  color: rgba(255,255,255,0.9);
  margin-bottom: 10px;
  font-weight: 600;
}

.groups-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.group-chip-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.group-chip {
  background: rgba(255,255,255,0.15);
  border: none;
  padding: 8px 16px;
  border-radius: 24px;
  font-size: 13px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.group-chip:hover {
  background: rgba(255,255,255,0.3);
}

.group-chip.active {
  background: #CDB4F3;
  color: #5a4a8c;
  padding-right: 32px;
}

.remove-chip {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.3);
  border: none;
  font-size: 10px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-chip:hover {
  background: rgba(0,0,0,0.5);
  transform: translateY(-50%) scale(1.1);
}

/* Секция настроений */
.moods-section {
  background: rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 15px;
}

.moods-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mood-chip-wrapper {
  position: relative;
  display: block;
}

.mood-chip {
  background: rgba(255,255,255,0.15);
  border: none;
  padding: 8px 16px;
  border-radius: 24px;
  font-size: 13px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
  text-align: left;
  padding-right: 32px;
}

.mood-chip:hover {
  background: rgba(255,255,255,0.3);
}

.mood-chip.active {
  background: #CDB4F3;
  color: #5a4a8c;
}

/* Список песен */
.playlist-items {
  max-height: 300px;
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
}

.playlist-item.active {
  background: rgba(255,255,255,0.3);
  border-left: 4px solid white;
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

.playlist-tags {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mood-badge {
  font-size: 14px;
}

.play-indicator {
  font-size: 14px;
  opacity: 0.8;
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

/* Адаптивность */
@media (max-width: 768px) {
  .playlist-layout {
    flex-direction: column;
  }
  
  .playlist-right {
    order: -1;
  }
  
  .moods-buttons {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .mood-chip {
    width: auto;
  }
}
</style>