<script setup>
import { ref, onMounted, watch } from 'vue'
import NotesList from './components/NotesList.vue'
import NoteEditor from './components/NoteEditor.vue'
import MusicPlayer from './components/MusicPlayer.vue'
import RatingTracker from './components/RatingTracker.vue'
import Statistics from './components/Statistics.vue'
import { useStore } from './composables/useStore'

const { 
  notes, 
  ratings, 
  darkMode, 
  addNote, 
  updateNote, 
  deleteNote, 
  addRating, 
  deleteRating,
  loadData,
  saveSettings
} = useStore()

const activeTab = ref('notes')
const sidebarOpen = ref(false)
const showEditor = ref(false)  // ← управляет видимостью формы
const editingNote = ref(null)

const moods = [
  { value: 'happy', emoji: '😊', label: 'Счастлив' },
  { value: 'excited', emoji: '🤩', label: 'Восторг' },
  { value: 'calm', emoji: '😌', label: 'Спокоен' },
  { value: 'sad', emoji: '😢', label: 'Грустен' },
  { value: 'inspired', emoji: '💜', label: 'Вдохновлён' }
]

function createNewNote() {
  editingNote.value = {
    id: null,
    title: '',
    content: '',
    mood: 'happy',
    selectedSong: null
  }
  showEditor.value = true
}

function editNote(note) {
  editingNote.value = { ...note }
  showEditor.value = true
}

function saveNote(noteData) {
  if (editingNote.value?.id) {
    updateNote(editingNote.value.id, noteData)
  } else {
    addNote(noteData)
  }
  cancelEdit()
}

function cancelEdit() {
  editingNote.value = null
  showEditor.value = false
}

watch(darkMode, () => {
  saveSettings()
})

onMounted(() => {
  loadData()
})
</script>
<template>
  <div class="app" :class="{ 'theme-dark': darkMode }">
    <!-- Верхняя панель -->
    <header class="app-header">
      <div class="header-left">
        <button class="menu-btn" @click="sidebarOpen = !sidebarOpen">☰</button>
        <h1>💜 Bias Journal</h1>
      </div>
      <div class="header-right">
        <button @click="darkMode = !darkMode" class="icon-btn">
          {{ darkMode ? '☀️' : '🌙' }}
        </button>
      </div>
    </header>

    <div class="app-main">
      <aside class="sidebar" :class="{ open: sidebarOpen }">
        <nav class="sidebar-nav">
          <button @click="activeTab = 'notes'; sidebarOpen = false" class="nav-item" :class="{ active: activeTab === 'notes' }">
            <span class="nav-icon">📝</span>
            <span>Дневник</span>
          </button>
          <button @click="activeTab = 'player'; sidebarOpen = false" class="nav-item" :class="{ active: activeTab === 'player' }">
            <span class="nav-icon">🎵</span>
            <span>Плеер</span>
          </button>
          <button @click="activeTab = 'tracker'; sidebarOpen = false" class="nav-item" :class="{ active: activeTab === 'tracker' }">
            <span class="nav-icon">⭐</span>
            <span>Трекер</span>
          </button>
          <button @click="activeTab = 'stats'; sidebarOpen = false" class="nav-item" :class="{ active: activeTab === 'stats' }">
            <span class="nav-icon">📊</span>
            <span>Статистика</span>
          </button>
        </nav>
      </aside>

      <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>

      <main class="main-content">
        <!-- Вкладка дневника -->
        <div v-if="activeTab === 'notes'" class="tab-content">
          <NotesList 
            :notes="notes" 
            @edit="editNote" 
            @delete="deleteNote"
          />
          
          <!-- Кнопка "Добавить запись" -->
          <button v-if="!showEditor && !editingNote" class="fab-add" @click="createNewNote">
            ＋ Добавить запись
          </button>
          
          <!-- Форма редактора (показывается только при создании/редактировании) -->
          <div v-if="showEditor || editingNote" class="editor-wrapper">
            <NoteEditor 
              :note="editingNote"
              :moods="moods"
              @save="saveNote"
              @cancel="cancelEdit"
            />
          </div>
        </div>

        <!-- Вкладка плеера -->
        <div v-if="activeTab === 'player'" class="tab-content">
          <MusicPlayer />
        </div>

        <!-- Вкладка трекера -->
        <div v-if="activeTab === 'tracker'" class="tab-content">
          <RatingTracker 
            :ratings="ratings"
            @add="addRating"
            @delete="deleteRating"
          />
        </div>

        <!-- Вкладка статистики -->
        <div v-if="activeTab === 'stats'" class="tab-content">
          <Statistics :notes="notes" :ratings="ratings" />
        </div>
      </main>
    </div>

    <!-- Нижняя панель для мобильных -->
    <footer class="bottom-nav">
      <button @click="activeTab = 'notes'" class="bottom-nav-item" :class="{ active: activeTab === 'notes' }">📝</button>
      <button @click="activeTab = 'player'" class="bottom-nav-item" :class="{ active: activeTab === 'player' }">🎵</button>
      <button @click="activeTab = 'tracker'" class="bottom-nav-item" :class="{ active: activeTab === 'tracker' }">⭐</button>
      <button @click="activeTab = 'stats'" class="bottom-nav-item" :class="{ active: activeTab === 'stats' }">📊</button>
    </footer>
  </div>
</template>
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
  background: #C3CEF8;
  transition: all 0.3s;
}
</style>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #C3CEF8;
  transition: all 0.3s;
}

.app.theme-dark {
  background: #2d2d4a;
  color: #D6CEF7;
}

.app-header {
  background: #B0A8D9;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.theme-dark .app-header {
  background: #1a1a2e;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #fff;
  display: none;
}

@media (max-width: 768px) {
  .menu-btn {
    display: block;
  }
}

.app-header h1 {
  font-size: 20px;
  color: white;
  font-weight: 600;
}

.icon-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s;
}

.icon-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.05);
}

.app-main {
  display: flex;
  flex: 1;
  position: relative;
}

.sidebar {
  width: 250px;
  background: #D6CEF7;
  min-height: calc(100vh - 70px);
  transition: transform 0.3s ease;
  position: sticky;
  top: 70px;
  height: calc(100vh - 70px);
  overflow-y: auto;
}

.theme-dark .sidebar {
  background: #25253a;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 20;
    transform: translateX(-100%);
    width: 280px;
  }
  .sidebar.open {
    transform: translateX(0);
  }
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 14px 24px;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
}

.theme-dark .nav-item {
  color: #D6CEF7;
}

.nav-item:hover {
  background: rgba(203, 78, 166, 0.1);
}

.nav-item.active {
  background: #B7AEE2;
  color: white;
  border-left: 4px solid #CDB4F3;
}

.theme-dark .nav-item.active {
  background: #3a3a5a;
}

.nav-icon {
  font-size: 24px;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 15;
  display: none;
}

@media (max-width: 768px) {
  .sidebar-overlay {
    display: block;
  }
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.tab-content {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

/* Кнопка добавления записи (как в трекере) */
.fab-add {
  display: block;
  width: 100%;
  background: #B7AEE2;
  border: none;
  padding: 12px 20px;
  border-radius: 30px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 20px;
}

.fab-add:hover {
  background: #CDB4F3;
  transform: translateY(-2px);
}

.theme-dark .fab-add {
  background: #4a4a6a;
}

.theme-dark .fab-add:hover {
  background: #6a5a9a;
}

/* Обёртка для редактора */
.editor-wrapper {
  margin-top: 20px;
}

.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #B0A8D9;
  padding: 10px 20px;
  justify-content: space-around;
  z-index: 10;
}

.theme-dark .bottom-nav {
  background: #1a1a2e;
}

@media (max-width: 768px) {
  .bottom-nav {
    display: flex;
  }
}

.bottom-nav-item {
  background: none;
  border: none;
  font-size: 28px;
  padding: 8px;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s;
  color: #fff;
}

.bottom-nav-item.active {
  background: #CDB4F3;
  transform: translateY(-3px);
}

.theme-dark .bottom-nav-item.active {
  background: #a855f7;
}
</style>