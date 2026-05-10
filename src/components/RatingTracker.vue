<template>
  <div class="rating-tracker">
    <div class="tracker-header">
      <h2>⭐ Оценка альбомов</h2>
      <button @click="showForm = !showForm" class="add-rating-btn">
        {{ showForm ? '− Отмена' : '+ Добавить оценку' }}
      </button>
    </div>

    <!-- Форма добавления -->
    <div v-if="showForm" class="rating-form">
      <div class="form-field">
        <input v-model="newRating.album" placeholder="Название альбома" />
      </div>
      <div class="form-field">
        <input v-model="newRating.artist" placeholder="Группа / Исполнитель" />
      </div>
      <div class="form-field">
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
        <textarea v-model="newRating.comment" placeholder="Короткий отзыв..." rows="2"></textarea>
      </div>
      <button @click="submitRating" class="submit-rating">💾 Сохранить</button>
    </div>

    <!-- Список оценок -->
    <div v-if="ratings.length === 0" class="empty-ratings">
      <span>🎵</span>
      <p>Пока нет оценок</p>
      <p class="hint">Добавь первый альбом!</p>
    </div>

    <div v-else class="ratings-list">
      <div v-for="rating in ratings" :key="rating.id" class="rating-card">
        <div class="rating-header">
          <div class="rating-score">
            <span v-for="star in 5" :key="star" class="star small" :class="{ active: star <= rating.score }">★</span>
          </div>
          <button @click="$emit('delete', rating.id)" class="delete-rating">🗑️</button>
        </div>
        <h3>{{ rating.album }}</h3>
        <p class="artist">{{ rating.artist }}</p>
        <p class="comment">{{ rating.comment }}</p>
        <div class="rating-date">{{ rating.date }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  ratings: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['add', 'delete'])

const showForm = ref(false)
const newRating = ref({
  album: '',
  artist: '',
  score: 3,
  comment: ''
})

function submitRating() {
  if (!newRating.value.album.trim()) {
    alert('Введите название альбома')
    return
  }
  emit('add', { ...newRating.value })
  newRating.value = { album: '', artist: '', score: 3, comment: '' }
  showForm.value = false
}
</script>

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

.form-field input,
.form-field textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #D3D3FB;
  border-radius: 16px;
  font-family: inherit;
  background: white;
}

.theme-dark .form-field input,
.theme-dark .form-field textarea {
  background: #3a3a5a;
  border-color: #4a4a6a;
  color: #fff;
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
}

.empty-ratings {
  text-align: center;
  padding: 40px;
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
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.theme-dark .rating-card {
  background: #2d2d4a;
}

.rating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
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
}

.delete-rating:hover {
  opacity: 1;
  transform: scale(1.1);
}

.rating-card h3 {
  font-size: 18px;
  margin-bottom: 4px;
  color: #333;
}

.theme-dark .rating-card h3 {
  color: #fff;
}

.artist {
  font-size: 13px;
  color: #B0A8D9;
  margin-bottom: 8px;
}

.comment {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 8px;
}

.theme-dark .comment {
  color: #aaa;
}

.rating-date {
  font-size: 11px;
  color: #999;
}
</style>