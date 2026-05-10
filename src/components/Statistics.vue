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
        <div class="stat-icon">💭</div>
        <div class="stat-number">{{ ratings.length }}</div>
        <div class="stat-label">Впечатлений</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎵</div>
        <div class="stat-number">{{ totalSongsInNotes }}</div>
        <div class="stat-label">Песен в заметках</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">{{ topMood.emoji }}</div>
        <div class="stat-number">{{ topMood.label }}</div>
        <div class="stat-label">Самое частое настроение</div>
      </div>
    </div>

    <div class="stats-row">
      <!-- Распределение настроений -->
      <div class="mood-stats">
        <h3>😊 Распределение настроений</h3>
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

      <!-- Топ исполнителей по впечатлениям -->
      <div class="top-artists">
        <h3>🌟 Топ исполнителей</h3>
        <div class="artists-list">
          <div v-for="artist in topArtists" :key="artist.name" class="artist-item">
            <div class="artist-rank">{{ artist.rank }}</div>
            <div class="artist-name">{{ artist.name }}</div>
            <div class="artist-count">{{ artist.count }} 💭</div>
          </div>
          <div v-if="topArtists.length === 0" class="no-data">
            Нет данных об исполнителях
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
  { value: 'sad', emoji: '😢', label: 'Грустен' },
  { value: 'inspired', emoji: '💜', label: 'Вдохновлён' },
  { value: 'romantic', emoji: '💕', label: 'Романтичный' },
  { value: 'energetic', emoji: '🔥', label: 'Энергичный' },
  { value: 'melancholic', emoji: '🌙', label: 'Меланхоличный' },
  { value: 'confident', emoji: '✨', label: 'Уверенный' },
  { value: 'nostalgic', emoji: '💭', label: 'Ностальгичный' }
]

// Подсчёт количества заметок по настроениям
const moodCounts = computed(() => {
  const counts = {}
  moodList.forEach(mood => { counts[mood.value] = 0 })
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

// Самое частое настроение
const topMood = computed(() => {
  let maxMood = { value: 'happy', count: 0, emoji: '😊', label: 'Счастлив' }
  for (const mood of moodList) {
    const count = moodCounts.value[mood.value]
    if (count > maxMood.count) {
      maxMood = { value: mood.value, count, emoji: mood.emoji, label: mood.label }
    }
  }
  return maxMood
})

// Общее количество уникальных песен в заметках
const totalSongsInNotes = computed(() => {
  const songs = new Set()
  props.notes.forEach(note => {
    if (note.selectedSong?.title) {
      songs.add(note.selectedSong.title + '|' + note.selectedSong.artist)
    }
  })
  return songs.size
})

// Топ исполнителей из впечатлений
const topArtists = computed(() => {
  const artistCount = {}
  props.ratings.forEach(rating => {
    if (rating.artist) {
      artistCount[rating.artist] = (artistCount[rating.artist] || 0) + 1
    }
  })
  
  return Object.entries(artistCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((item, index) => ({ ...item, rank: index + 1 }))
})
</script>

<style scoped>
.statistics {
  width: 100%;
}

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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
}

.theme-dark .stat-card {
  background: #2d2d4a;
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.stat-number {
  font-size: 24px;
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

.theme-dark .stat-label {
  color: #aaa;
}

.stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
}

/* Распределение настроений */
.mood-stats {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.theme-dark .mood-stats {
  background: #2d2d4a;
}

.mood-stats h3 {
  font-size: 18px;
  color: #5a4a8c;
  margin-bottom: 16px;
}

.theme-dark .mood-stats h3 {
  color: #CDB4F3;
}

.mood-bars {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mood-bar-item {
  width: 100%;
}

.mood-label {
  font-size: 13px;
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
  transition: width 0.5s ease;
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

/* Топ исполнителей */
.top-artists {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.theme-dark .top-artists {
  background: #2d2d4a;
}

.top-artists h3 {
  font-size: 18px;
  color: #5a4a8c;
  margin-bottom: 16px;
}

.theme-dark .top-artists h3 {
  color: #CDB4F3;
}

.artists-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.artist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #F5F0FF;
  border-radius: 12px;
  transition: all 0.3s;
}

.theme-dark .artist-item {
  background: #3a3a5a;
}

.artist-item:hover {
  transform: translateX(5px);
}

.artist-rank {
  font-size: 18px;
  font-weight: bold;
  color: #CDB4F3;
  min-width: 40px;
}

.artist-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.theme-dark .artist-name {
  color: #fff;
}

.artist-count {
  font-size: 13px;
  color: #B7AEE2;
}

.no-data {
  text-align: center;
  padding: 30px;
  color: #B0A8D9;
  font-size: 14px;
}
</style>