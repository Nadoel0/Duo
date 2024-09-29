<script setup>
    import { ref, onMounted, defineEmits } from 'vue';
    import { v4 as uuidv4} from 'uuid';

    const emit = defineEmits();
    const generatedInviteCode = ref('');
    const inputInviteCode = ref('');

    const generateInviteCode = () => {
        generatedInviteCode.value = uuidv4().slice(0, 16);
        saveGeneratedInviteCode();
    }

    async function saveGeneratedInviteCode() {
        const token = localStorage.getItem('token');
        const code = generatedInviteCode.value

        const res = await fetch('http://duo-duomemos.up.railway.app/api/invites/generate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        });

        if (res.ok) console.log('Invite code successfuly saved');
        else console.log('Failed to save invite code');    
    }

    const handleSubmitInviteCode = async () => {
        if (inputInviteCode.value) {
            try {
                const res = await verifyInviteCode();
                if (res.ok) {
                    emit('close-modal');
                    emit('has-partner');
                }
                else {
                    const err = await res.json();
                    console.error('Error: ', err);
                }
            } catch (err) {
                console.error(err);
            }
        }
    }

    async function verifyInviteCode() {
        const token = localStorage.getItem('token');
        const code = inputInviteCode.value;

        const res = await fetch('http://duo-duomemos.up.railway.app/api/invites/accept', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ code })
        });
        
        return res;
    }

    onMounted(() => {
        generateInviteCode();
    });
</script>

<template>
    <div class="partner-invitation">
        <div class="partner-invitation-content">
            <h2>Invitation code</h2>
            <div>
                <input type="text" v-model="generatedInviteCode" readonly />
                <p>Or</p>
                <input type="text" v-model="inputInviteCode" placeholder="Enter invitation code" @keydown.enter="handleSubmitInviteCode" />
            </div>
        </div>
    </div>
</template>

<style scoped>
    .partner-invitation {
        font-family: sans-serif;
        display: flex;
        flex-direction: column;
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

    .partner-invitation-content {
        background-color: #1f2029;
        border-radius: 10px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        box-shadow: 0 0 25px rgba(0, 0, 0, 0.4);
        width: 250px;
        height: 200px;
        padding: 10px 0px;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
    }

    .partner-invitation-content h2 {
        text-shadow: 0 0 20px whitesmoke;
    }

    .partner-invitation-content div {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 90%;
        height: 60%;
        position: relative;
    }

    .partner-invitation-content div input {
        width: 90%;
        height: 30%;
        font-size: 15px;
        background-color: transparent;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        box-shadow: 0 0 25px rgba(0, 0, 0, 0.4);
        color: whitesmoke;
        text-shadow: 0 0 2px whitesmoke;
        padding-left: 10px;
    }

    .partner-invitation-content div p {
        font-size: 18px;
        margin: 8px;
        text-shadow: 0 0 10px whitesmoke;
    }

</style>