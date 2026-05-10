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

    <!-- Основное содержимое с боковым меню -->
    <div class="app-main">
      <aside class="sidebar" :class="{ open: sidebarOpen }">
        <nav class="sidebar-nav">
          <button 
            @click="activeTab = 'notes'; sidebarOpen = false" 
            class="nav-item"
            :class="{ active: activeTab === 'notes' }"
          >
            <span class="nav-icon">📝</span>
            <span>Дневник</span>
          </button>
          <button 
            @click="activeTab = 'player'; sidebarOpen = false" 
            class="nav-item"
            :class="{ active: activeTab === 'player' }"
          >
            <span class="nav-icon">🎵</span>
            <span>Плеер</span>
          </button>
          <button 
            @click="activeTab = 'tracker'; sidebarOpen = false" 
            class="nav-item"
            :class="{ active: activeTab === 'tracker' }"
          >
            <span class="nav-icon">⭐</span>
            <span>Трекер</span>
          </button>
          <button 
            @click="activeTab = 'stats'; sidebarOpen = false" 
            class="nav-item"
            :class="{ active: activeTab === 'stats' }"
          >
            <span class="nav-icon">📊</span>
            <span>Статистика</span>
          </button>
        </nav>
      </aside>

      <!-- Затемнение фона при открытом меню на мобилке -->
      <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>

      <!-- Основной контент -->
      <main class="main-content">
        <!-- Вкладка дневника -->
        <div v-if="activeTab === 'notes'" class="tab-content">
          <NotesList 
            :notes="notes" 
            @edit="editNote" 
            @delete="deleteNote"
            @search="searchQuery = $event"
          />
          <NoteEditor 
            v-if="editingNote || !showEditor"
            :note="editingNote"
            :moods="moods"
            @save="saveNote"
            @cancel="cancelEdit"
          />
          <button v-if="!showEditor && !editingNote" class="fab" @click="createNewNote">
            ＋
          </button>
        </div>

        <!-- Вкладка плеера -->
        <div v-if="activeTab === 'player'" class="tab-content">
          <MusicPlayer />
        </div>

        <!-- Вкладка трекера альбомов -->
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

    <!-- Нижняя панель для мобильных устройств -->
    <footer class="bottom-nav">
      <button 
        @click="activeTab = 'notes'" 
        class="bottom-nav-item"
        :class="{ active: activeTab === 'notes' }"
      >
        📝
      </button>
      <button 
        @click="activeTab = 'player'" 
        class="bottom-nav-item"
        :class="{ active: activeTab === 'player' }"
      >
        🎵
      </button>
      <button 
        @click="activeTab = 'tracker'" 
        class="bottom-nav-item"
        :class="{ active: activeTab === 'tracker' }"
      >
        ⭐
      </button>
      <button 
        @click="activeTab = 'stats'" 
        class="bottom-nav-item"
        :class="{ active: activeTab === 'stats' }"
      >
        📊
      </button>
    </footer>
  </div>
</template>

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
const showEditor = ref(false)
const editingNote = ref(null)
const searchQuery = ref('')

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
    date: new Date().toLocaleDateString(),
    timestamp: Date.now()
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

function cancelDelete() {
  editingNote.value = null
}

watch(darkMode, () => {
  saveSettings()
})

onMounted(() => {
  loadData()
})
</script>

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

/* Шапка */
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

/* Основная область */
.app-main {
  display: flex;
  flex: 1;
  position: relative;
}

/* Боковое меню */
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

/* Затемнение */
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

/* Основной контент */
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

/* Плавающая кнопка */
.fab {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #CDB4F3;
  color: white;
  font-size: 28px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: all 0.3s;
  display: none;
}

.theme-dark .fab {
  background: #a855f7;
}

@media (max-width: 768px) {
  .fab {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.fab:hover {
  transform: scale(1.05);
  background: #B7AEE2;
}

/* Нижняя навигация для мобильных */
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