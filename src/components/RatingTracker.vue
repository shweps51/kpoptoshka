<script setup>
import { ref } from 'vue'

const props = defineProps({
  ratings: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['add', 'delete'])

// Полный плейлист для выбора треков
const fullPlaylist = ref([
  { title: 'Its Me', artist: 'ILLIT' },
  { title: 'ALL FOR YOU', artist: 'ILLIT' },
  { title: 'Billyeoon Goyangi (Do the Dance)', artist: 'ILLIT' },
  { title: '20cm', artist: 'TOMORROW X TOGETHER' },
  { title: '21st Century Romance', artist: 'TOMORROW X TOGETHER' },
  { title: 'Dirty Work', artist: 'aespa' },
  { title: 'New World', artist: 'ateez' },
  { title: 'Pretty Boy', artist: 'P1Harmony' },
  { title: 'Ash', artist: 'ateez' },
  { title: 'Stunner', artist: 'TEN' }
])

const showForm = ref(false)
const availableSongs = ref([])

const newRating = ref({
  artist: '',
  favoriteSong: '',
  score: 3,
  impressions: '',
  bestMoment: ''
})

const errors = ref({
  artist: '',
  favoriteSong: '',
  impressions: ''
})

// Обновление списка песен при выборе группы
function updateSongsByArtist() {
  if (newRating.value.artist) {
    availableSongs.value = fullPlaylist.value.filter(
      song => song.artist === newRating.value.artist
    )
    newRating.value.favoriteSong = ''
  } else {
    availableSongs.value = []
  }
}

// Валидация и отправка
function submitRating() {
  // Очищаем ошибки
  errors.value = { artist: '', favoriteSong: '', impressions: '' }
  let hasError = false

  if (!newRating.value.artist) {
    errors.value.artist = 'Выберите группу или артиста'
    hasError = true
  }
  
  if (!newRating.value.favoriteSong) {
    errors.value.favoriteSong = 'Выберите любимый трек'
    hasError = true
  }
  
  if (!newRating.value.impressions.trim()) {
    errors.value.impressions = 'Напишите свои впечатления'
    hasError = true
  }
  
  if (hasError) return
  
  // Отправляем данные
  emit('add', { 
    artist: newRating.value.artist,
    favoriteSong: newRating.value.favoriteSong,
    score: newRating.value.score,
    impressions: newRating.value.impressions,
    bestMoment: newRating.value.bestMoment
  })
  
  // Сбрасываем форму
  newRating.value = {
    artist: '',
    favoriteSong: '',
    score: 3,
    impressions: '',
    bestMoment: ''
  }
  availableSongs.value = []
  showForm.value = false
}
</script>

<template>
  <div class="rating-tracker">
    <div class="tracker-header">
      <h2>💭 Мои впечатления</h2>
      <button @click="showForm = !showForm" class="add-rating-btn">
        {{ showForm ? '− Отмена' : '+ Добавить впечатление' }}
      </button>
    </div>

    <!-- Форма добавления -->
    <div v-if="showForm" class="rating-form">
      <div class="form-field">
        <label>🎤 Группа / Артист *</label>
        <select v-model="newRating.artist" class="artist-select" @change="updateSongsByArtist">
          <option value="" disabled>Выберите группу</option>
          <option value="ILLIT">ILLIT</option>
          <option value="TOMORROW X TOGETHER">TOMORROW X TOGETHER</option>
          <option value="aespa">aespa</option>
          <option value="ateez">ateez</option>
          <option value="P1Harmony">P1Harmony</option>
          <option value="TEN">TEN</option>
        </select>
        <div v-if="errors.artist" class="error-text">{{ errors.artist }}</div>
      </div>
      
      <div class="form-field">
        <label>🎵 Любимый трек *</label>
        <select v-model="newRating.favoriteSong" class="song-select" :disabled="!newRating.artist">
          <option value="" disabled>Выберите трек</option>
          <option v-for="song in availableSongs" :key="song.title" :value="song.title">
            🎵 {{ song.title }}
          </option>
        </select>
        <div v-if="errors.favoriteSong" class="error-text">{{ errors.favoriteSong }}</div>
      </div>
      
      <div class="form-field">
        <label>⭐ Моя оценка</label>
        <div class="star-rating">
          <span 
            v-for="star in 5" 
            :key="star"
            @click="newRating.score = star"
            :class="['star', { active: star <= newRating.score }]"
          >★</span>
        </div>
      </div>
      
      <div class="form-field">
        <label>📝 Мои впечатления *</label>
        <textarea 
          v-model="newRating.impressions" 
          placeholder="Что понравилось? Какие моменты запомнились? Что хочется отметить?..." 
          rows="4"
        ></textarea>
        <div v-if="errors.impressions" class="error-text">{{ errors.impressions }}</div>
      </div>
      
      <div class="form-field">
        <label>🔥 Лучший момент</label>
        <input v-model="newRating.bestMoment" placeholder="Например: припев, бридж, вступление..." />
      </div>
      
      <button @click="submitRating" class="submit-rating">💾 Сохранить впечатление</button>
    </div>

    <!-- Список впечатлений -->
    <div v-if="ratings.length === 0" class="empty-ratings">
      <span>💜</span>
      <p>Пока нет впечатлений</p>
      <p class="hint">Поделись своими мыслями о прослушанном!</p>
    </div>

    <div v-else class="ratings-list">
      <div v-for="rating in ratings" :key="rating.id" class="rating-card">
        <div class="rating-header">
          <div class="artist-info">
            <span class="artist-icon">🎤</span>
            <span class="artist-name">{{ rating.artist }}</span>
          </div>
          <div class="rating-score">
            <span v-for="star in 5" :key="star" class="star small" :class="{ active: star <= rating.score }">★</span>
          </div>
          <button @click="$emit('delete', rating.id)" class="delete-rating">🗑️</button>
        </div>
        
        <div class="favorite-song" v-if="rating.favoriteSong">
          <span class="favorite-icon">🎵</span>
          <span>Любимый трек: <strong>{{ rating.favoriteSong }}</strong></span>
        </div>
        
        <div class="impressions-section">
          <div class="impressions-icon">📝</div>
          <div class="impressions-text">{{ rating.impressions || 'Нет описания' }}</div>
        </div>
        
        <div class="best-moment" v-if="rating.bestMoment">
          <span class="moment-icon">🔥</span>
          <span>Лучший момент: {{ rating.bestMoment }}</span>
        </div>
        
        <div class="rating-footer">
          <div class="rating-date">{{ rating.date }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rating-tracker {
  width: 100%;
}

.tracker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.tracker-header h2 {
  font-size: 24px;
  color: #5a4a8c;
  margin: 0;
}

.theme-dark .tracker-header h2 {
  color: #CDB4F3;
}

.add-rating-btn {
  background: #B7AEE2;
  border: none;
  padding: 8px 20px;
  border-radius: 30px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.add-rating-btn:hover {
  background: #CDB4F3;
  transform: translateY(-2px);
}

.rating-form {
  background: #E7E0FC;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 24px;
}

.theme-dark .rating-form {
  background: #2d2d4a;
}

.form-field {
  margin-bottom: 16px;
}

.form-field label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #5a4a8c;
  margin-bottom: 6px;
}

.theme-dark .form-field label {
  color: #CDB4F3;
}

.form-field input,
.form-field textarea,
.artist-select,
.song-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #D3D3FB;
  border-radius: 16px;
  font-family: inherit;
  background: white;
  font-size: 14px;
}

.song-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.theme-dark .form-field input,
.theme-dark .form-field textarea,
.theme-dark .artist-select,
.theme-dark .song-select {
  background: #3a3a5a;
  border-color: #4a4a6a;
  color: #fff;
}

.artist-select,
.song-select {
  cursor: pointer;
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

.star-rating {
  display: flex;
  gap: 8px;
}

.star {
  font-size: 32px;
  color: #ddd;
  cursor: pointer;
  transition: all 0.3s;
}

.star.active {
  color: #FFD700;
}

.submit-rating {
  background: #B7AEE2;
  border: none;
  padding: 10px 24px;
  border-radius: 30px;
  color: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.submit-rating:hover {
  background: #CDB4F3;
  transform: translateY(-2px);
}

.empty-ratings {
  text-align: center;
  padding: 60px 40px;
  background: white;
  border-radius: 24px;
  color: #B0A8D9;
}

.theme-dark .empty-ratings {
  background: #2d2d4a;
}

.empty-ratings span {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

.hint {
  font-size: 14px;
  opacity: 0.7;
  margin-top: 8px;
}

.ratings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rating-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.3s;
}

.rating-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
}

.theme-dark .rating-card {
  background: #2d2d4a;
}

.rating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
}

.artist-info {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #E7E0FC;
  padding: 6px 14px;
  border-radius: 30px;
}

.theme-dark .artist-info {
  background: #3a3a5a;
}

.artist-icon {
  font-size: 14px;
}

.artist-name {
  font-size: 14px;
  font-weight: 600;
  color: #5a4a8c;
}

.theme-dark .artist-name {
  color: #CDB4F3;
}

.rating-score .star {
  font-size: 18px;
  color: #ddd;
}

.rating-score .star.active {
  color: #FFD700;
}

.delete-rating {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.3s;
  padding: 4px 8px;
}

.delete-rating:hover {
  opacity: 1;
  transform: scale(1.1);
}

.favorite-song {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(205, 180, 243, 0.15);
  padding: 8px 12px;
  border-radius: 12px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #5a4a8c;
}

.theme-dark .favorite-song {
  color: #CDB4F3;
}

.favorite-icon {
  font-size: 14px;
}

.impressions-section {
  display: flex;
  gap: 12px;
  background: #F5F0FF;
  padding: 14px;
  border-radius: 16px;
  margin-bottom: 12px;
}

.theme-dark .impressions-section {
  background: #3a3a5a;
}

.impressions-icon {
  font-size: 20px;
  min-width: 32px;
}

.impressions-text {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  color: #555;
}

.theme-dark .impressions-text {
  color: #ccc;
}

.best-moment {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #B7AEE2;
  margin-bottom: 12px;
  padding: 6px 0;
}

.moment-icon {
  font-size: 14px;
}

.rating-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.theme-dark .rating-footer {
  border-top-color: #3a3a5a;
}

.rating-date {
  font-size: 11px;
  color: #999;
}

.theme-dark .rating-date {
  color: #888;
}
</style>