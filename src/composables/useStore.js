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

// Функции для заметок
function addNote(noteData) {
  const newNote = {
    id: Date.now(),
    title: noteData.title || 'Без названия',
    content: noteData.content,
    mood: noteData.mood || 'happy',
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
      date: notes.value[index].date
    }
    saveNotes()
  }
}

function deleteNote(id) {
  notes.value = notes.value.filter(n => n.id !== id)
  saveNotes()
}

// Функции для оценок альбомов
function addRating(ratingData) {
  const newRating = {
    id: Date.now(),
    album: ratingData.album,
    artist: ratingData.artist,
    score: ratingData.score,
    comment: ratingData.comment,
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

// Сохранение и загрузка
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
  if (savedNotes) notes.value = JSON.parse(savedNotes)
  
  const savedRatings = localStorage.getItem(STORAGE_KEYS.RATINGS)
  if (savedRatings) ratings.value = JSON.parse(savedRatings)
  
  const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
  if (savedSettings) {
    const settings = JSON.parse(savedSettings)
    darkMode.value = settings.darkMode
    applyDarkMode()
  }
}

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