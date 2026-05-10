import { ref, computed } from 'vue'

const STORAGE_KEYS = {
  NOTES: 'kpop_notes',
  RATINGS: 'kpop_ratings',
  SETTINGS: 'kpop_settings'
}

// Реактивные данные
const notes = ref([])
const ratings = ref([])
const darkMode = ref(false)

// Вычисляемые свойства
const notesCount = computed(() => notes.value.length)
const totalMoodDistribution = computed(() => {
  const distribution = { happy: 0, excited: 0, calm: 0, sad: 0, inspired: 0 }
  notes.value.forEach(note => {
    if (distribution[note.mood] !== undefined) distribution[note.mood]++
  })
  return distribution
})

// ========== ФУНКЦИИ ДЛЯ ЗАМЕТОК ==========

function addNote(noteData) {
  const newNote = {
    id: Date.now(),
    title: noteData.title || 'Без названия',
    content: noteData.content || '',
    mood: noteData.mood || 'happy',
    selectedSong: noteData.selectedSong || null,
    date: new Date().toLocaleDateString('ru-RU'),
    timestamp: Date.now()
  }
  notes.value.unshift(newNote)
  saveNotes()
  return newNote
}

function updateNote(id, updatedData) {
  const index = notes.value.findIndex(n => n.id === id)
  if (index !== -1) {
    notes.value[index] = { 
      ...notes.value[index], 
      ...updatedData,
      selectedSong: updatedData.selectedSong !== undefined ? updatedData.selectedSong : notes.value[index].selectedSong,
      date: notes.value[index].date
    }
    saveNotes()
  }
}

function deleteNote(id) {
  notes.value = notes.value.filter(n => n.id !== id)
  saveNotes()
}

// ========== ФУНКЦИИ ДЛЯ ВПЕЧАТЛЕНИЙ ==========

function addRating(ratingData) {
  const newRating = {
    id: Date.now(),
    artist: ratingData.artist || '',
    favoriteSong: ratingData.favoriteSong || '',
    score: ratingData.score || 3,
    impressions: ratingData.impressions || '',
    bestMoment: ratingData.bestMoment || '',
    date: new Date().toLocaleDateString('ru-RU')
  }
  ratings.value.unshift(newRating)
  saveRatings()
  return newRating
}

function deleteRating(id) {
  ratings.value = ratings.value.filter(r => r.id !== id)
  saveRatings()
}

// ========== СОХРАНЕНИЕ И ЗАГРУЗКА ==========

function saveNotes() {
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes.value))
}

function saveRatings() {
  localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(ratings.value))
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ darkMode: darkMode.value }))
}

function loadData() {
  const savedNotes = localStorage.getItem(STORAGE_KEYS.NOTES)
  if (savedNotes) {
    const parsedNotes = JSON.parse(savedNotes)
    // Для старых заметок, у которых нет поля selectedSong, добавляем null
    notes.value = parsedNotes.map(note => ({
      ...note,
      selectedSong: note.selectedSong || null
    }))
  }
  
  const savedRatings = localStorage.getItem(STORAGE_KEYS.RATINGS)
  if (savedRatings) {
    ratings.value = JSON.parse(savedRatings)
  }
  
  const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
  if (savedSettings) {
    const settings = JSON.parse(savedSettings)
    darkMode.value = settings.darkMode
    applyDarkMode()
  }
}

// ========== ТЁМНАЯ ТЕМА ==========

function applyDarkMode() {
  if (darkMode.value) {
    document.body.classList.add('theme-dark')
  } else {
    document.body.classList.remove('theme-dark')
  }
}

function toggleDarkMode() {
  darkMode.value = !darkMode.value
  applyDarkMode()
  saveSettings()
}

// ========== ЭКСПОРТ ==========

export function useStore() {
  return {
    notes,
    ratings,
    darkMode,
    notesCount,
    totalMoodDistribution,
    addNote,
    updateNote,
    deleteNote,
    addRating,
    deleteRating,
    loadData,
    saveSettings,
    toggleDarkMode
  }
}