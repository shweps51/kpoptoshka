<template>
  <div class="notes-list">
    <div class="list-header">
      <h2>📝 Мои записи</h2>

      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input 
          v-model="searchTerm" 
          type="text" 
          placeholder="Поиск по записям..."
          class="search-input"
        />
      </div>

      <div class="tabs-container">
        <div class="tabs">
          <button 
            @click="activeTab = 'all'"
            :class="['tab-btn', { active: activeTab === 'all' }]"
          >
            🏠 Все записи
          </button>
          <button 
            @click="activeTab = 'moods'"
            :class="['tab-btn', { active: activeTab === 'moods' }]"
          >
            😊 По настроению
          </button>
          <button 
            @click="activeTab = 'artists'"
            :class="['tab-btn', { active: activeTab === 'artists' }]"
          >
            🌟 По группам
          </button>
        </div>
      </div>

      <!-- Фильтр по настроению (только во вкладке "По настроению") -->
      <div class="mood-filters" v-if="activeTab === 'moods'">
        <div class="filter-group">
          <span class="filter-title">😊 Выберите настроение:</span>
          <div class="filter-wrapper">
            <div 
              v-for="mood in moods" 
              :key="mood.value"
              class="filter-chip-wrapper"
            >
              <button 
                @click="toggleMoodFilter(mood.value)"
                :class="['mood-chip', { active: selectedMoods.includes(mood.value) }]"
              >
                {{ mood.emoji }} {{ mood.label }}
              </button>
              <button 
                v-if="selectedMoods.includes(mood.value)"
                @click="removeMoodFilter(mood.value)"
                class="remove-chip"
              >
                ✖
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Фильтр по группам (только во вкладке "По группам") -->
      <div class="artist-filters" v-if="activeTab === 'artists'">
        <div class="filter-group">
          <span class="filter-title">🌟 Выберите группу:</span>
          <div class="filter-wrapper">
            <div 
              v-for="group in allGroups" 
              :key="group.name"
              class="filter-chip-wrapper"
            >
              <button 
                @click="toggleArtistFilter(group.name)"
                :class="['artist-chip', { active: selectedArtists.includes(group.name) }]"
              >
                🌟 {{ group.name }} ({{ group.count }})
              </button>
              <button 
                v-if="selectedArtists.includes(group.name)"
                @click="removeArtistFilter(group.name)"
                class="remove-chip"
              >
                ✖
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredNotes.length === 0" class="empty-state">
      <span class="empty-emoji" v-if="activeTab === 'all'">📭</span>
      <span class="empty-emoji" v-else-if="activeTab === 'moods'">😊</span>
      <span class="empty-emoji" v-else>🌟</span>
      <p>
        <span v-if="activeTab === 'all'">Пока нет записей</span>
        <span v-else-if="activeTab === 'moods' && selectedMoods.length > 0">Нет записей с выбранными настроениями</span>
        <span v-else-if="activeTab === 'artists' && selectedArtists.length > 0">Нет записей с выбранными группами</span>
        <span v-else>Нет записей</span>
      </p>
      <p class="empty-hint">Нажмите ➕ Добавить запись</p>
    </div>

    <div v-else class="notes-grid">
      <div 
        v-for="note in filteredNotes" 
        :key="note.id" 
        class="note-card"
        :class="{ 'mood-highlight': note.mood }"
      >
        <div class="note-header">
          <div class="note-mood">{{ getMoodEmoji(note.mood) }}</div>
          <div class="note-date">{{ note.date }}</div>
          <div class="note-actions">
            <button @click="$emit('edit', note)" class="action-btn edit-btn">✏️</button>
            <button @click="$emit('delete', note.id)" class="action-btn delete-btn">🗑️</button>
          </div>
        </div>
        
        <h3 class="note-title">{{ note.title || 'Без названия' }}</h3>
        <p class="note-preview">{{ note.content || 'Нет текста' }}</p>
        
        <div v-if="note.selectedSong" class="note-song">
          <div class="song-badge">
            <span class="song-icon">🎵</span>
            <div class="song-info">
              <strong>{{ note.selectedSong.title }}</strong>
              <span class="song-artist">{{ note.selectedSong.artist }}</span>
            </div>
            <button 
              @click="playSongPreview(note.selectedSong)" 
              class="mini-play-btn"
              :class="{ playing: currentPlaying === note.selectedSong.title + note.selectedSong.artist }"
            >
              {{ currentPlaying === note.selectedSong.title + note.selectedSong.artist ? '⏸' : '▶' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <audio ref="listAudioPlayer" style="display: none"></audio>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  notes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['edit', 'delete'])

const searchTerm = ref('')
const selectedMoods = ref([])
const selectedArtists = ref([])
const activeTab = ref('all')
const currentPlaying = ref(null)
const listAudioPlayer = ref(null)

const moods = [
  { value: 'happy', emoji: '😊', label: 'Счастлив' },
  { value: 'excited', emoji: '🤩', label: 'Восторг' },
  { value: 'calm', emoji: '😌', label: 'Спокоен' },
  { value: 'sad', emoji: '😢', label: 'Грустен' },
  { value: 'inspired', emoji: '💜', label: 'Вдохновлён' },
  { value: 'romantic', emoji: '💕', label: 'Романтичный' },
  { value: 'energetic', emoji: '🔥', label: 'Энергичный' },
  { value: 'melancholic', emoji: '🌙', label: 'Меланхоличный' },
  { value: 'confident', emoji: '✨', label: 'Уверенный' },
  { value: 'nostalgic', emoji: '💭', label: 'Ностальгичный' }
]

// Все группы из приложения (всегда показываем все, независимо от наличия заметок)
const allGroups = computed(() => {
  const allPossibleGroups = [
    { name: 'ILLIT', count: 0 },
    { name: 'TXT', count: 0 },
    { name: 'aespa', count: 0 },
    { name: 'ateez', count: 0 },
    { name: 'P1Harmony', count: 0 },
    { name: 'TEN', count: 0 }
  ]
  
  // Подсчитываем количество заметок для каждой группы
  props.notes.forEach(note => {
    if (note.selectedSong?.artist) {
      const artist = note.selectedSong.artist
      const group = allPossibleGroups.find(g => g.name === artist)
      if (group) group.count++
    }
  })
  
  // Возвращаем все группы, включая те, где count = 0
  return allPossibleGroups.sort((a, b) => b.count - a.count)
})

const getMoodEmoji = (mood) => {
  const found = moods.find(m => m.value === mood)
  return found ? found.emoji : '📝'
}

const getMoodLabel = (mood) => {
  const found = moods.find(m => m.value === mood)
  return found ? found.label : mood
}

// Переключение фильтра настроений
function toggleMoodFilter(mood) {
  if (selectedMoods.value.includes(mood)) {
    selectedMoods.value = selectedMoods.value.filter(m => m !== mood)
  } else {
    selectedMoods.value.push(mood)
  }
}

// Удаление фильтра настроения
function removeMoodFilter(mood) {
  selectedMoods.value = selectedMoods.value.filter(m => m !== mood)
}

// Переключение фильтра групп
function toggleArtistFilter(artist) {
  if (selectedArtists.value.includes(artist)) {
    selectedArtists.value = selectedArtists.value.filter(a => a !== artist)
  } else {
    selectedArtists.value.push(artist)
  }
}

// Удаление фильтра группы
function removeArtistFilter(artist) {
  selectedArtists.value = selectedArtists.value.filter(a => a !== artist)
}

// Очистка фильтров при переключении вкладок
watch(activeTab, () => {
  selectedMoods.value = []
  selectedArtists.value = []
})

const playSongPreview = (song) => {
  if (!listAudioPlayer.value || !song?.src) {
    console.warn('Аудио не загружено или нет src')
    return
  }
  
  const previewId = song.title + song.artist
  
  if (currentPlaying.value === previewId) {
    listAudioPlayer.value.pause()
    listAudioPlayer.value.currentTime = 0
    currentPlaying.value = null
  } else {
    if (currentPlaying.value) {
      listAudioPlayer.value.pause()
    }
    listAudioPlayer.value.src = song.src
    listAudioPlayer.value.play().catch(e => console.log('Ошибка воспроизведения:', e))
    currentPlaying.value = previewId
  }
}

const filteredNotes = computed(() => {
  let result = [...props.notes]
  
  result = result.map(note => ({
    ...note,
    selectedSong: note.selectedSong || null
  }))
  
  // Поиск по тексту (работает во всех вкладках)
  if (searchTerm.value.trim()) {
    const term = searchTerm.value.toLowerCase()
    result = result.filter(note => 
      note.title?.toLowerCase().includes(term) || 
      note.content?.toLowerCase().includes(term)
    )
  }
  
  // Фильтр по настроениям (только если активна вкладка "По настроению")
  if (activeTab.value === 'moods' && selectedMoods.value.length > 0) {
    result = result.filter(note => selectedMoods.value.includes(note.mood))
  }
  
  // Фильтр по группам (только если активна вкладка "По группам")
  if (activeTab.value === 'artists' && selectedArtists.value.length > 0) {
    result = result.filter(note => note.selectedSong && selectedArtists.value.includes(note.selectedSong.artist))
  }
  
  return result.sort((a, b) => b.timestamp - a.timestamp)
})

import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (listAudioPlayer.value) {
    listAudioPlayer.value.pause()
    listAudioPlayer.value.src = ''
  }
})
</script>

<style scoped>
.notes-list {
  width: 100%;
}

.list-header {
  margin-bottom: 24px;
}

.list-header h2 {
  font-size: 24px;
  color: #5a4a8c;
  margin-bottom: 16px;
}

.theme-dark .list-header h2 {
  color: #CDB4F3;
}

.search-bar {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 30px;
  padding: 8px 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.theme-dark .search-bar {
  background: #2d2d4a;
}

.search-icon {
  font-size: 18px;
  margin-right: 10px;
  color: #B0A8D9;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #333;
}

.theme-dark .search-input {
  color: #D6CEF7;
}

.tabs-container {
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  gap: 8px;
  border-bottom: 2px solid #E7E0FC;
  padding-bottom: 8px;
  flex-wrap: wrap;
}

.theme-dark .tabs {
  border-bottom-color: #4a4a6a;
}

.tab-btn {
  padding: 8px 20px;
  background: transparent;
  border: none;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
  color: #5a4a8c;
  cursor: pointer;
  transition: all 0.3s;
}

.theme-dark .tab-btn {
  color: #CDB4F3;
}

.tab-btn:hover {
  background: #E7E0FC;
}

.theme-dark .tab-btn:hover {
  background: #3a3a5a;
}

.tab-btn.active {
  background: #CDB4F3;
  color: white;
}

.theme-dark .tab-btn.active {
  background: #6a5a9a;
}

/* Фильтры */
.filter-group {
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(205, 180, 243, 0.1);
  border-radius: 20px;
}

.filter-title {
  display: block;
  font-size: 14px;
  color: #5a4a8c;
  font-weight: 600;
  margin-bottom: 12px;
}

.theme-dark .filter-title {
  color: #CDB4F3;
}

.filter-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-chip-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.mood-chip,
.artist-chip {
  padding: 8px 16px;
  border-radius: 24px;
  border: 1px solid #D3D3FB;
  background: white;
  font-size: 13px;
  color: #5a4a8c;
  cursor: pointer;
  transition: all 0.3s;
  padding-right: 16px;
}

.theme-dark .mood-chip,
.theme-dark .artist-chip {
  background: #2d2d4a;
  border-color: #3a3a5a;
  color: #D6CEF7;
}

.mood-chip:hover,
.artist-chip:hover {
  background: rgba(205, 180, 243, 0.2);
}

.mood-chip.active,
.artist-chip.active {
  background: #CDB4F3;
  color: white;
  border-color: #CDB4F3;
  padding-right: 32px;
}

.theme-dark .mood-chip.active,
.theme-dark .artist-chip.active {
  background: #6a5a9a;
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
  background: rgba(0,0,0,0.6);
  transform: translateY(-50%) scale(1.1);
}

/* Карточки заметок */
.note-card {
  background: white;
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.3s;
}

.theme-dark .note-card {
  background: #2d2d4a;
}

.note-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
}

.note-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.note-mood {
  font-size: 20px;
}

.note-date {
  font-size: 12px;
  color: #999;
  flex: 1;
}

.theme-dark .note-date {
  color: #aaa;
}

.note-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.3s;
}

.edit-btn:hover {
  background: #E7E0FC;
  transform: scale(1.1);
}

.delete-btn:hover {
  background: #ffe0e0;
  transform: scale(1.1);
}

.note-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.theme-dark .note-title {
  color: #E7E0FC;
}

.note-preview {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 12px;
}

.theme-dark .note-preview {
  color: #aaa;
}

.note-song {
  margin: 12px 0;
}

.song-badge {
  background: linear-gradient(135deg, #E7E0FC, #F3EDFF);
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-left: 3px solid #CDB4F3;
}

.theme-dark .song-badge {
  background: #3a3a5a;
  border-left-color: #6a5a9a;
}

.song-icon {
  font-size: 20px;
}

.song-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.song-info strong {
  font-size: 13px;
  color: #5a4a8c;
}

.theme-dark .song-info strong {
  color: #CDB4F3;
}

.song-artist {
  font-size: 11px;
  color: #999;
}

.theme-dark .song-artist {
  color: #aaa;
}

.mini-play-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: #CDB4F3;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-play-btn:hover {
  transform: scale(1.1);
}

.mini-play-btn.playing {
  background: #5a4a8c;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 24px;
  color: #B0A8D9;
}

.theme-dark .empty-state {
  background: #2d2d4a;
}

.empty-emoji {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

.empty-hint {
  font-size: 14px;
  margin-top: 8px;
  opacity: 0.7;
}
</style>