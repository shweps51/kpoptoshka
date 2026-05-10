<template>
  <div class="note-editor">
    <h3>{{ note?.id ? '✏️ Редактировать' : '➕ Новая запись' }}</h3>
    
    <div class="editor-field">
      <label>Заголовок</label>
      <input v-model="form.title" type="text" placeholder="О чём эта запись?" />
    </div>

    <div class="editor-field">
      <label>Текст заметки</label>
      <textarea v-model="form.content" rows="6" placeholder="Поделись своими мыслями..."></textarea>
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

    <div class="editor-actions">
      <button @click="$emit('save', form)" class="save-btn">💾 Сохранить</button>
      <button @click="$emit('cancel')" class="cancel-btn">❌ Отмена</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

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

const form = reactive({
  title: '',
  content: '',
  mood: 'happy'
})

watch(() => props.note, (newNote) => {
  if (newNote) {
    form.title = newNote.title || ''
    form.content = newNote.content || ''
    form.mood = newNote.mood || 'happy'
  } else {
    form.title = ''
    form.content = ''
    form.mood = 'happy'
  }
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

.editor-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
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
</style>