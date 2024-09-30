<script setup>
    import { ref, computed, defineEmits, defineProps } from 'vue';

    const currentDate = ref(new Date());
    const dragging = ref(false);
    const atLimit = ref(false);
    const startX = ref(0);
    const buttonPos = ref(0);
    const maxDays = 9;
    const buttonWidth = ref('40%');
    const dateVisible = ref(true);
    const props = defineProps(['isPartnerNoteVisible']);
    const emit = defineEmits();

    const formattedDate = computed(() => {
        return currentDate.value.toLocaleDateString();
    });

    async function noteForDate(date) {
        const token = localStorage.getItem('token');   
        console.log(`Fetching notes for date: ${date.toISOString()}`);
        const endpoint = props.isPartnerNoteVisible ? `https://duo-duomemos.up.railway.app/api/note/partner/date?date=${date.toISOString()}` : `https://duo-duomemos.up.railway.app/api/note/date?date=${date.toISOString()}`;    

        const res = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Something went wrong');
        }

        return await res.json();
    }

    const startDrag = (event) => {
        dragging.value = true;
        buttonWidth.value = '15%';
        dateVisible.value = false;
        startX.value = event.touches[0].clientX;

        document.addEventListener('touchmove', moveDrag);
        document.addEventListener('touchend', endDrag);
    }

    const moveDrag = (event) => {
        if (!dragging.value) return;

        const currentX = event.touches[0].clientX;
        const deltaX = currentX - startX.value;

        buttonPos.value = Math.min(Math.max(buttonPos.value + deltaX, -130), 130);
        startX.value = currentX;
    }

    const endDrag = () => {
        dragging.value = false;
        dateVisible.value = true;

        if (buttonPos.value > 100 && !atLimit.value) changeDate(1);
        else if (buttonPos.value < -100 && !atLimit.value) changeDate(-1);

        resetButton();
        document.removeEventListener('touchmove', startDrag);
        document.removeEventListener('touchend', endDrag);
    }

    const resetButton = () => {
        setTimeout(() => {
            buttonPos.value = 0;
        }, 10);
        buttonWidth.value = '40%';
    }

    const changeDate = async (direction) => {
        const newDate = new Date(currentDate.value);
        newDate.setDate(newDate.getDate() + direction);

        const today = new Date();
        const minDate = new Date();
        minDate.setDate(today.getDate() - maxDays);

        if (newDate <= today && newDate >= minDate) {
            currentDate.value = newDate;
            atLimit.value = false;

            try {
                const note = await noteForDate(newDate);
                emit('note-content-updated', note.content);
                emit('selected-date-updated', newDate);
            } catch (err) {
                console.error(err);
            }
        } else {
            atLimit.value = true;
            setTimeout(() => {
                atLimit.value = false;
            }, 500);
        }
    }
</script>

<template>
    <div class="date-switcher">
        <div
            class="button-container"
            @touchstart="startDrag"
            :class="{ 'is-dragging': dragging }, { 'shake': atLimit }"
            :style="{ width: buttonWidth, transform: `translateX(${buttonPos}px)`, transition: dragging ? 'none' : 'all 0.3s ease' }"
        >
            <div 
                class="date-button" 
                ref="dateButton"
                :style="{ display: dateVisible ? 'block' : 'none' }"
            >{{ formattedDate }}</div>
        </div>
    </div>
</template>

<style scoped>
    .date-switcher {
        position: relative;
        width: 90%;
        height: 10%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 15px;
        box-shadow: 0 0 25px rgba(0, 0, 0, 0.4);
        opacity: 0.7;
        font-family: sans-serif;
        font-size: 20px;
        text-align: center;
    }

    .button-container {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40%;
        height: 70%;
        border: 1px solid rgba(0, 0, 0, 0.1);
        box-shadow: 0 0 20px whitesmoke;
        border-radius: 20px;
        background-color: whitesmoke;
        transition: all 0.3s ease;
    }

    .button-container.is-dragging {
        width: 20%;
        border-radius: 50%;
    }

    .button-container.shake {
        animation: shake 0.5s;
    }

    .date-button {
        text-shadow: 0 0 15px #1f2029;
        transition: opacity 0.3s ease;
    }

    @keyframes shake {
        0% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        50% { transform: translateX(5px); }
        75% { transform: translateX(-5px); }
        100% { transform: translateX(0px); }
    }
</style>