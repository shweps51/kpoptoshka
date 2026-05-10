<template>
  <div class="statistics">
    <h2>📊 Статистика</h2>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-number">{{ notes.length }}</div>
        <div class="stat-label">Всего записей</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-number">{{ ratings.length }}</div>
        <div class="stat-label">Оценённых альбомов</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">😊</div>
        <div class="stat-number">{{ topMood.emoji }} {{ topMood.count }}</div>
        <div class="stat-label">Самое частое настроение</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎵</div>
        <div class="stat-number">{{ avgRating.toFixed(1) }}</div>
        <div class="stat-label">Средний рейтинг</div>
      </div>
    </div>

    <div class="mood-stats">
      <h3>Распределение настроений</h3>
      <div class="mood-bars">
        <div v-for="mood in moodList" :key="mood.value" class="mood-bar-item">
          <div class="mood-label">{{ mood.emoji }} {{ mood.label }}</div>
          <div class="bar-container">
            <div class="bar-fill" :style="{ width: getMoodPercent(mood.value) + '%' }"></div>
            <span class="bar-count">{{ getMoodCount(mood.value) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  notes: {
    type: Array,
    default: () => []
  },
  ratings: {
    type: Array,
    default: () => []
  }
})

const moodList = [
  { value: 'happy', emoji: '😊', label: 'Счастлив' },
  { value: 'excited', emoji: '🤩', label: 'Восторг' },
  { value: 'calm', emoji: '😌', label: 'Спокоен' },
  { value: 'sad', emoji: '😢', label: 'Грусть' },
  { value: 'inspired', emoji: '💜', label: 'Вдохновлён' }
]

const moodCounts = computed(() => {
  const counts = { happy: 0, excited: 0, calm: 0, sad: 0, inspired: 0 }
  props.notes.forEach(note => {
    if (counts[note.mood] !== undefined) counts[note.mood]++
  })
  return counts
})

const getMoodCount = (mood) => moodCounts.value[mood] || 0

const totalNotes = computed(() => props.notes.length)

const getMoodPercent = (mood) => {
  if (totalNotes.value === 0) return 0
  return (moodCounts.value[mood] / totalNotes.value) * 100
}

const topMood = computed(() => {
  let maxMood = { value: 'happy', count: 0, emoji: '😊' }
  for (const mood of moodList) {
    const count = moodCounts.value[mood.value]
    if (count > maxMood.count) {
      maxMood = { value: mood.value, count, emoji: mood.emoji }
    }
  }
  return maxMood
})

const avgRating = computed(() => {
  if (props.ratings.length === 0) return 0
  const sum = props.ratings.reduce((acc, r) => acc + r.score, 0)
  return sum / props.ratings.length
})
</script>

<style scoped>
.statistics h2 {
  font-size: 24px;
  color: #5a4a8c;
  margin-bottom: 24px;
}

.theme-dark .statistics h2 {
  color: #CDB4F3;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.theme-dark .stat-card {
  background: #2d2d4a;
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #5a4a8c;
  margin-bottom: 4px;
}

.theme-dark .stat-number {
  color: #CDB4F3;
}

.stat-label {
  font-size: 13px;
  color: #999;
}

.mood-stats h3 {
  font-size: 18px;
  color: #5a4a8c;
  margin-bottom: 16px;
}

.theme-dark .mood-stats h3 {
  color: #D6CEF7;
}

.mood-bars {
  background: white;
  border-radius: 20px;
  padding: 20px;
}

.theme-dark .mood-bars {
  background: #2d2d4a;
}

.mood-bar-item {
  margin-bottom: 16px;
}

.mood-label {
  font-size: 14px;
  margin-bottom: 6px;
  color: #333;
}

.theme-dark .mood-label {
  color: #D6CEF7;
}

.bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f0f0f0;
  border-radius: 10px;
  height: 28px;
  position: relative;
  overflow: hidden;
}

.theme-dark .bar-container {
  background: #3a3a5a;
}

.bar-fill {
  background: #CDB4F3;
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s;
}

.bar-count {
  position: absolute;
  right: 12px;
  font-size: 12px;
  font-weight: bold;
  color: #333;
  z-index: 1;
}

.theme-dark .bar-count {
  color: #fff;
}
</style>