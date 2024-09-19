<script setup>
    import { ref, onMounted } from 'vue';
    import { useRouter } from 'vue-router';

    const router = useRouter();
    const noteContent = ref('');
    const token = localStorage.getItem('token');
    
    async function loadNote() {
        const res = await fetch('http://192.168.1.228:3000/api/note/today', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (res.ok) {
            const data = await res.json();
            noteContent.value = data.content;
        } else if (res.status === 401) {
            await refreshToken();
            await loadNote();
        }
    }

    async function saveNote() {
        const res = await fetch('http://192.168.1.228:3000/api/note/save', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: noteContent.value })
        });

        if (res.ok) {
            const { newAccessToken, newRefreshToken } = await res.json();
            localStorage.setItem('token', newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
        } else if (res.status === 401) {
            await refreshToken();
            await saveNote();
        }
    }

    async function refreshToken() {
        const res = await fetch('http://192.168.1.228:3000/api/auth/token/refresh', {
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
        } else {
            console.error('Failed to refresh token');
        }
    }

    onMounted(() => {
        loadNote();
    });
</script>

<template>
    <div class="noteField">
        <textarea v-model="noteContent" class="note" @input="saveNote" placeholder="Enter a note"></textarea>
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