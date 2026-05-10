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
      <div class="mood-filters">
        <button 
          v-for="mood in moods" 
          :key="mood.value"
          @click="setMoodFilter(mood.value)"
          :class="['mood-chip', { active: moodFilter === mood.value }]"
        >
          {{ mood.emoji }} {{ mood.label }}
        </button>
        <button 
          @click="clearMoodFilter"
          :class="['mood-chip', { active: moodFilter === 'all' }]"
        >
          Все 📋
        </button>
      </div>
    </div>

    <div v-if="filteredNotes.length === 0" class="empty-state">
      <span class="empty-emoji">📭</span>
      <p>Пока нет записей</p>
      <p class="empty-hint">Нажмите ＋, чтобы создать первую заметку</p>
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
        <div class="note-footer">
          <span class="note-stats">📄 {{ note.content?.length || 0 }} символов</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  notes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['edit', 'delete', 'search'])

const searchTerm = ref('')
const moodFilter = ref('all')

const moods = [
  { value: 'happy', emoji: '😊', label: 'Счастлив' },
  { value: 'excited', emoji: '🤩', label: 'Восторг' },
  { value: 'calm', emoji: '😌', label: 'Спокоен' },
  { value: 'sad', emoji: '😢', label: 'Грусть' },
  { value: 'inspired', emoji: '💜', label: 'Вдохновлён' }
]

const getMoodEmoji = (mood) => {
  const found = moods.find(m => m.value === mood)
  return found ? found.emoji : '📝'
}

const filteredNotes = computed(() => {
  let result = [...props.notes]
  
  if (searchTerm.value.trim()) {
    const term = searchTerm.value.toLowerCase()
    result = result.filter(note => 
      note.title?.toLowerCase().includes(term) || 
      note.content?.toLowerCase().includes(term)
    )
  }
  
  if (moodFilter.value !== 'all') {
    result = result.filter(note => note.mood === moodFilter.value)
  }
  
  return result.sort((a, b) => b.timestamp - a.timestamp)
})

function setMoodFilter(mood) {
  moodFilter.value = mood
}

function clearMoodFilter() {
  moodFilter.value = 'all'
}
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
  margin-bottom: 16px;
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

.mood-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.mood-chip {
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid #D3D3FB;
  background: white;
  font-size: 13px;
  color: #5a4a8c;
  cursor: pointer;
  transition: all 0.3s;
}

.theme-dark .mood-chip {
  background: #2d2d4a;
  border-color: #3a3a5a;
  color: #D6CEF7;
}

.mood-chip.active {
  background: #CDB4F3;
  color: white;
  border-color: #CDB4F3;
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

.notes-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.note-card {
  background: white;
  border-radius: 20px;
  padding: 16px;
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

.note-footer {
  font-size: 12px;
  color: #999;
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
}

.theme-dark .note-footer {
  border-top-color: #3a3a5a;
  color: #888;
}
</style>