<script setup>
    import Header from './Header.vue';
    import NoteField from './NoteField.vue';
    import DateSwitcher from './DateSwitcher.vue';
    import { onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import { jwtDecode } from "jwt-decode";

    const router = useRouter();

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
        <Header />
        <NoteField />
        <DateSwitcher />
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
</style>