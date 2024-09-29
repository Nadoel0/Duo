<script setup>
    import Header from './Header.vue';
    import NoteField from './NoteField.vue';
    import DateSwitcher from './DateSwitcher.vue';
    import { onMounted, ref } from 'vue';
    import { useRouter } from 'vue-router';
    import { jwtDecode } from "jwt-decode";

    const router = useRouter();
    const userNoteContent = ref('');
    const selectedDate = ref('');
    const isPartnerNoteVisible = ref(false);

    function handleNoteContentUpdate(newNoteContent) {       
        userNoteContent.value = newNoteContent;        
    }

    function handleDateChange(newDate) {
        selectedDate.value = newDate;
    }

    function togglePartnerVisible() {
        isPartnerNoteVisible.value = true;
    }

    function checkToken() {
        const token = localStorage.getItem('token');

        if (!token) {
            router.push('/');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp < currentTime) {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                router.push('/')
            }
        } catch (err) {
            console.error('Token decoding error: ', err);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            router.push('/');
        }
    }

    onMounted(() => {
        checkToken();
    });
</script>

<template>
    <div class="main-page">
        <Header @isPartnerNoteVisible="togglePartnerVisible" />
        <NoteField 
            :noteContent="userNoteContent" 
            :noteDate="selectedDate" 
            :isPartnerNoteVisible="isPartnerNoteVisible"
        />
        <DateSwitcher 
            :isPartnerNoteVisible="isPartnerNoteVisible"
            @note-content-updated="handleNoteContentUpdate" 
            @selected-date-updated="handleDateChange" 
        />
    </div>
</template>

<style scoped>
    .main-page {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        align-items: center;
        justify-content: center;
        gap: 10px;
    }

    Header {
        position: relative;
        z-index: 1000;
    }
</style>