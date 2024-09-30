<script setup>
import { ref, onMounted, defineProps, watch, computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps(['noteContent', 'noteDate', 'isPartnerNoteVisible']);
const router = useRouter();
const noteContent = ref(props.noteContent);

async function loadNote(retry = true) {
    const token = localStorage.getItem('token');
    const endpoint = props.isPartnerNoteVisible ? 'https://duo-duomemos.up.railway.app/api/note/partner/today' : 'https://duo-duomemos.up.railway.app/api/note/today';
    const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (res.ok) {
        const data = await res.json();
        noteContent.value = data.content;
    } else if (res.status === 401 && retry) {
        const tokenRefreshed = await refreshToken();
        if (tokenRefreshed) await loadNote(false);
    } else {
        console.error('Failed to refresh token');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        router.push('/');
    }
}

async function saveNote() {
    const token = localStorage.getItem('token');
    const res = await fetch('https://duo-duomemos.up.railway.app/api/note/save', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: noteContent.value })
    });

    if (res.ok) {
        const { newAccessToken, newRefreshToken } = await res.json();
        if (newAccessToken && newRefreshToken) {
            localStorage.setItem('token', newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
        }
    } else if (res.status === 401) {
        const tokenRefreshed = await refreshToken();
        if (tokenRefreshed) await saveNote();
    } else {
        console.error('Failed to refresh token');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        router.push('/');
    }
}

async function refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
        console.error('No refresh token available');
        return false;
    }

    const res = await fetch('https://duo-duomemos.up.railway.app/api/auth/token/refresh', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
    });

    if (res.ok) {
        const { accesToken, refreshToken: newRefreshToken } = await res.json();
        localStorage.setItem('token', accesToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        return true;
    } else {
        console.error('Failed to refresh token');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return false;
    }
}

const isEditable = computed(() => {
    if (!props.noteDate) return true;

    const today = new Date();
    const noteDate = new Date(props.noteDate);
    return today.toISOString().split('T')[0] === noteDate.toISOString().split('T')[0];
});

onMounted(() => {
    loadNote();
});

watch(() => props.noteContent, (newValue) => {
    noteContent.value = newValue;
});

watch(() => props.isPartnerNoteVisible, (newValue) => {
    loadNote();
});
</script>

<template>
    <div class="noteField">
        <textarea v-model="noteContent" class="note" @input="saveNote" placeholder="Enter a note"
            :readonly="!isEditable || props.isPartnerNoteVisible">
        </textarea>
    </div>
</template>

<style scoped>
.noteField {
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 15px;
    background-color: rgba(0, 0, 0, 0.4);
    box-shadow: 0 0 25px rgba(0, 0, 0, 0.4);
    opacity: 0.7;
    position: relative;
    font-family: sans-serif;
    display: flex;
    width: 90%;
    height: 70%;
    overflow: hidden;
    justify-content: center;
}

.note {
    width: 100%;
    height: 100%;
    padding: 20px 20px;
    font-size: 15px;
    color: whitesmoke;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 15px;
    box-shadow: 0 0 25px rgba(0, 0, 0, 0.4);
    background-color: rgba(0, 0, 0, 0.1);
    text-shadow: 0 0 20px whitesmoke;
}
</style>