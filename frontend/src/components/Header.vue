<script setup>
    import { ref, onMounted, defineEmits } from 'vue';
    import { useRouter } from 'vue-router';
    import PartnerInvitation from './PartnerInvitation.vue';

    const router = useRouter();
    const isModalOpen = ref(false);
    const showPartnerModal = ref(false);
    const hasPartner = ref(false);
    const emit = defineEmits();

    function openModal() {
        isModalOpen.value = true;
    }

    function closeModal() {
        isModalOpen.value = false;
        showPartnerModal.value = false;
    }

    function showAddPartner() {
        isModalOpen.value = false;
        showPartnerModal.value = true;
    }

    async function logout() {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
            router.push('/');
            return;
        }

        const res = await fetch('http://192.168.1.228:3000/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        });

        if (!res.ok) {
            const err = await res.json();
            router.push('/');
            throw new Error(err.message || 'Something went wrong');
        }

        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return await res.json();
    }

    async function handleLogout() {
        try {
            await logout();
            closeModal();
            router.push('/');
        } catch (err) {
            console.error(err);
        }
    }

    async function checkPartnerStatus() {
        const token = localStorage.getItem('token');
        const res = await fetch('http://192.168.1.228:3000/api/auth/check-partner', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (res.ok) {
            const data = await res.json();
            hasPartner.value = data.hasPartner;
        }
    }

    async function viewPartnerNote() {
       emit('isPartnerNoteVisible');
       closeModal();
    }

    function toggleHasPartner() {
        hasPartner.value = true;
    }

    onMounted(() => {
        checkPartnerStatus();
    });
</script>

<template>
    <header>
        <h1>DuoMemos</h1>
        <div class="menu-button" @click="openModal">
            <span></span>
            <span></span>
        </div>
        <div v-show="isModalOpen" class="modal" @click.self="closeModal">
            <div class="modal-content">
                <button v-if="!hasPartner" @click="showAddPartner">Add Partner</button>
                <button v-else @click="viewPartnerNote">Partner Note</button>
                <button @click="handleLogout">Logout</button>
            </div>
        </div>

        <PartnerInvitation v-if="showPartnerModal" @close-modal="closeModal" @has-partner="toggleHasPartner" @click.self="closeModal"/>
    </header>
</template>

<style scoped>
    header {
        position: relative;
        font-family: sans-serif;
        display: flex;
        width: 90%;
        background-color: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 15px;
        box-shadow: 0 0 25px rgba(0, 0, 0, 0.4);
        opacity: 0.7;
        color: whitesmoke;
        justify-content: center;
        align-items: center;
    }

    header h1 {
        text-shadow: 0 0 25px whitesmoke;
    }

    .menu-button {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 8px;
        position: absolute;
        right: 1%;
        margin-right: 10px;
        max-width: 10%;
        min-width: 5%;
        height: 40%;
    }

    .menu-button span {
        max-width: 50px;
        min-width: 30px;
        max-height: 10px;
        min-height: 5px;
        background-color: whitesmoke;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        box-shadow: 0 0 25px whitesmoke;
        cursor: pointer;
    }

    .modal {
        display: flex;
        justify-content: center;
        align-items: center;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.4);
        z-index: 1000;
    }

    .modal-content {
        background-color: #1f2029;
        border-radius: 10px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        box-shadow: 0 0 25px rgba(0, 0, 0, 0.4);
        width: 250px;
        height: 150px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        gap: 15px;
    }

    .modal-content button {
        font-family: sans-serif;
        font-size: 18px;
        width: 90%;
        height: 30%;
        background-color: transparent;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 15px;
        box-shadow: 0 5px 25px rgba(0, 0, 0, 0.4);
        color: whitesmoke;
        text-align: center;
        text-shadow: 0 0 10px whitesmoke;
    }
</style>