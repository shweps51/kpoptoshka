<template>
  <div class="note-editor">
    <h3>{{ note?.id ? '✏️ Редактировать' : '➕ Новая заметка' }}</h3>
    
    <div class="editor-field">
      <label>Заголовок *</label>
      <input v-model="form.title" type="text" placeholder="О чём эта заметка?" />
      <div v-if="errors.title" class="error-text">{{ errors.title }}</div>
    </div>

    <div class="editor-field">
      <label>Текст заметки *</label>
      <textarea v-model="form.content" rows="6" placeholder="Поделись своими мыслями..."></textarea>
      <div v-if="errors.content" class="error-text">{{ errors.content }}</div>
    </div>

    <div class="editor-field">
      <label>Настроение</label>
      <div class="mood-selector">
        <button 
          v-for="mood in moods" 
          :key="mood.value"
          @click="form.mood = mood.value"
          :class="['mood-btn', { active: form.mood === mood.value }]"
        >
          {{ mood.emoji }} {{ mood.label }}
        </button>
      </div>
    </div>

    <!-- БЛОК: ВЫБОР ПЕСНИ К ЗАМЕТКЕ -->
    <div class="editor-field">
      <label>🎵 Связать с песней</label>
      <div class="song-selector">
        <div class="song-search">
          <input 
            type="text" 
            v-model="songSearch" 
            placeholder="Поиск по названию или артисту..."
            class="song-search-input"
          />
        </div>
        
        <div class="song-list">
          <div 
            v-for="song in filteredSongs" 
            :key="song.title + song.artist"
            @click="selectSong(song)"
            :class="['song-item', { selected: form.selectedSong?.title === song.title && form.selectedSong?.artist === song.artist }]"
          >
            <div class="song-info">
              <div class="song-cover">
                <span class="cover-placeholder">🎤</span>
              </div>
              <div class="song-details">
                <div class="song-title">{{ song.title }}</div>
                <div class="song-artist">{{ song.artist }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Отображение выбранной песни -->
      <div v-if="form.selectedSong" class="selected-song">
        <div class="selected-song-info">
          <span class="selected-icon">🎵</span>
          <div>
            <strong>{{ form.selectedSong.title }}</strong> — {{ form.selectedSong.artist }}
          </div>
        </div>
        <button @click="clearSong" class="clear-song-btn">✖</button>
      </div>
      <div v-else class="no-song">
        <span>💿 Выберите песню, связанную с этой заметкой</span>
      </div>
    </div>

    <div class="editor-actions">
      <button @click="saveNote" class="save-btn">💾 Сохранить</button>
      <button @click="$emit('cancel')" class="cancel-btn">❌ Отмена</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, ref, computed } from 'vue'

const props = defineProps({
  note: {
    type: Object,
    default: null
  },
  moods: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['save', 'cancel'])

// Полный плейлист
const fullPlaylist = ref([
  { title: 'Its Me', artist: 'ILLIT', src: '/music/itsme.mp3' },
  { title: 'ALL FOR YOU', artist: 'ILLIT', src: '/music/all4u.mp3' },
  { title: 'Billyeoon Goyangi (Do the Dance)', artist: 'ILLIT', src: '/music/BG.mp3' },
  { title: '20cm', artist: 'TOMORROW X TOGETHER', src: '/music/20cm.mp3' },
  { title: '21st Century Romance', artist: 'TOMORROW X TOGETHER', src: '/music/Romance.mp3' },
  { title: 'Dirty Work', artist: 'aespa', src: '/music/dirtywork.mp3' },
  { title: 'New World', artist: 'ateez', src: '/music/newworld.mp3' },
  { title: 'Pretty Boy', artist: 'P1Harmony', src: '/music/prettyboy.mp3' },
  { title: 'Ash', artist: 'ateez', src: '/music/ash.mp3' },
  { title: 'Stunner', artist: 'TEN', src: '/music/stunner.mp3' }
])

const form = reactive({
  title: '',
  content: '',
  mood: 'happy',
  selectedSong: null
})

const errors = ref({
  title: '',
  content: ''
})

const songSearch = ref('')

const filteredSongs = computed(() => {
  let songs = [...fullPlaylist.value]
  if (songSearch.value.trim()) {
    const query = songSearch.value.toLowerCase()
    songs = songs.filter(song => 
      song.title.toLowerCase().includes(query) || 
      song.artist.toLowerCase().includes(query)
    )
  }
  return songs
})

const selectSong = (song) => {
  form.selectedSong = { ...song }
}

const clearSong = () => {
  form.selectedSong = null
}

const saveNote = () => {
  // Очищаем ошибки
  errors.value = { title: '', content: '' }
  let hasError = false

  if (!form.title.trim()) {
    errors.value.title = 'Введите заголовок'
    hasError = true
  }

  if (!form.content.trim()) {
    errors.value.content = 'Введите текст заметки'
    hasError = true
  }

  if (hasError) return

  const noteToSave = {
    title: form.title,
    content: form.content,
    mood: form.mood,
    selectedSong: form.selectedSong ? { ...form.selectedSong } : null
  }
  emit('save', noteToSave)
}

watch(() => props.note, (newNote) => {
  if (newNote) {
    form.title = newNote.title || ''
    form.content = newNote.content || ''
    form.mood = newNote.mood || 'happy'
    form.selectedSong = newNote.selectedSong ? { ...newNote.selectedSong } : null
  } else {
    form.title = ''
    form.content = ''
    form.mood = 'happy'
    form.selectedSong = null
  }
  errors.value = { title: '', content: '' }
  songSearch.value = ''
}, { immediate: true })
</script>

<style scoped>
.note-editor {
  background: #E7E0FC;
  border-radius: 24px;
  padding: 24px;
  margin-top: 20px;
}

.theme-dark .note-editor {
  background: #2d2d4a;
}

.note-editor h3 {
  font-size: 20px;
  color: #5a4a8c;
  margin-bottom: 20px;
}

.theme-dark .note-editor h3 {
  color: #CDB4F3;
}

.editor-field {
  margin-bottom: 20px;
}

.editor-field label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #5a4a8c;
  margin-bottom: 8px;
}

.theme-dark .editor-field label {
  color: #CDB4F3;
}

.error-text {
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 6px;
  margin-left: 4px;
}

.theme-dark .error-text {
  color: #ff8888;
}

.editor-field input,
.editor-field textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #D3D3FB;
  border-radius: 16px;
  font-size: 14px;
  font-family: inherit;
  background: white;
  transition: all 0.3s;
  box-sizing: border-box;
}

.theme-dark .editor-field input,
.theme-dark .editor-field textarea {
  background: #3a3a5a;
  border-color: #4a4a6a;
  color: #fff;
}

.editor-field input:focus,
.editor-field textarea:focus {
  outline: none;
  border-color: #CDB4F3;
}

.mood-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.mood-btn {
  padding: 8px 16px;
  border-radius: 40px;
  border: 1px solid #D3D3FB;
  background: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.theme-dark .mood-btn {
  background: #3a3a5a;
  border-color: #4a4a6a;
  color: #fff;
}

.mood-btn.active {
  background: #CDB4F3;
  color: white;
  border-color: #CDB4F3;
}

.song-selector {
  border: 2px solid #D3D3FB;
  border-radius: 16px;
  background: white;
  overflow: hidden;
}

.theme-dark .song-selector {
  background: #3a3a5a;
  border-color: #4a4a6a;
}

.song-search {
  padding: 12px;
  border-bottom: 1px solid #D3D3FB;
}

.theme-dark .song-search {
  border-bottom-color: #4a4a6a;
}

.song-search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #E7E0FC;
  border-radius: 20px;
  font-size: 13px;
  background: #faf9ff;
}

.theme-dark .song-search-input {
  background: #2d2d4a;
  border-color: #4a4a6a;
  color: #fff;
}

.song-list {
  max-height: 240px;
  overflow-y: auto;
}

.song-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.theme-dark .song-item {
  border-bottom-color: #4a4a6a;
}

.song-item:hover {
  background: #f5f0ff;
}

.theme-dark .song-item:hover {
  background: #4a4a6a;
}

.song-item.selected {
  background: #CDB4F3;
  color: white;
}

.theme-dark .song-item.selected {
  background: #6a5a9a;
}

.song-info {
  display: flex;
  gap: 12px;
  flex: 1;
  align-items: center;
}

.song-cover {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #CDB4F3, #B7AEE2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-placeholder {
  font-size: 20px;
}

.song-details {
  flex: 1;
}

.song-title {
  font-weight: 600;
  font-size: 14px;
}

.song-artist {
  font-size: 12px;
  opacity: 0.7;
}

.selected-song {
  margin-top: 12px;
  padding: 12px;
  background: #CDB4F3;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.theme-dark .selected-song {
  background: #6a5a9a;
}

.selected-song-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selected-icon {
  font-size: 20px;
}

.clear-song-btn {
  background: rgba(255,255,255,0.3);
  border: none;
  border-radius: 20px;
  padding: 4px 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-song-btn:hover {
  background: rgba(255,255,255,0.5);
}

.no-song {
  margin-top: 12px;
  padding: 12px;
  background: #f5f0ff;
  border-radius: 12px;
  text-align: center;
  font-size: 13px;
  color: #5a4a8c;
}

.theme-dark .no-song {
  background: #3a3a5a;
  color: #CDB4F3;
}

.editor-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.save-btn {
  background: #B7AEE2;
  border: none;
  padding: 10px 24px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.save-btn:hover {
  background: #CDB4F3;
  transform: translateY(-2px);
}

.cancel-btn {
  background: #f0f0f0;
  border: none;
  padding: 10px 24px;
  border-radius: 30px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.theme-dark .cancel-btn {
  background: #3a3a5a;
  color: #fff;
}

.cancel-btn:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
}

.theme-dark .cancel-btn:hover {
  background: #4a4a6a;
}

.song-list::-webkit-scrollbar {
  width: 6px;
}

.song-list::-webkit-scrollbar-track {
  background: #f0f0f0;
}

.song-list::-webkit-scrollbar-thumb {
  background: #CDB4F3;
  border-radius: 3px;
}

.theme-dark .song-list::-webkit-scrollbar-track {
  background: #2d2d4a;
}
</style>