<script setup>
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';

    const router = useRouter();
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const error = ref('');

    async function register(email, password) {
        const res = await fetch('http://192.168.1.228:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (res.ok) {
            const { accessToken, refreshToken } = await res.json();
            console.log(accessToken, refreshToken);
            
            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            return true;
        } else {
            const err = await res.json();
            console.error('Registration failed: ', err.message);
            return false;
        }
    }

    async function handleRegister() {
        error.value = '';

        if (password.value !== confirmPassword.value) {
            error.value = 'Passwords dont match';
            return;
        }
        
        try {
            await register(email.value, password.value);
            router.push('/main');
        } catch (err) {
            error.value = err.message || 'Something went wrong';
            console.error(err);
        }
    }
</script>

<template>
    <div class="register">
        <h2>Regsiter</h2>
        <form class="register-form" @submit.prevent="handleRegister">
            <input v-model="email" type="email" placeholder="Enter email" required/>
            <input v-model="password" type="password" placeholder="Enter password" required/>
            <input v-model="confirmPassword" type="password" placeholder="Confirm password" required/>
            <p v-if="error" class="error-message">{{  error  }}</p>
            <button type="submit">Submit</button>
            <p>Already have account? <router-link class="custom-link" to="/">Login</router-link></p>
        </form>
    </div>
</template>

<style scoped>
    .register {
        display: flex;
        flex-direction: column;
        padding: 30px 0 20px 0;
        background: rgba(0, 0, 0, 0.1);
        opacity: 0.7;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 15px;
        box-shadow: 0px 5px 25px 3px rgba(0, 0, 0, 0.4);
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        box-sizing: border-box;
        justify-content: center;
        align-items: center;
        color: whitesmoke
    }

    .register h2 {
        margin: -10px 0 30px 0;
        text-align: center;
        
    }

    .register-form {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        gap: 20px;
    }

    .register-form input {
        width: 250px;
        height: 30px;
        border-radius: 10px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        box-shadow: 0 5px 25px rgba(0, 0, 0, 0.4);
        background: transparent;
        font-size: 15px;
        padding-left: 10px;
        color: whitesmoke;
    }

    .register-form button {
        cursor: pointer;
        position: relative;
        display: inline-block;
        border: none;
        font-size: 15px;
        margin-top: 15px;
        padding: 15px 30px;
        color: whitesmoke;
        background: transparent;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 5px;
        box-shadow: 0 5px 25px rgba(0, 0, 0, 0.4);
        transition: 0.5s;
    }

    .register-form button:hover {
        color: #1f2029;
        background-color: whitesmoke;
        box-shadow: 
            inset 0 0 25px whitesmoke,
            0 0 25px whitesmoke;
    }

    .custom-link {
        cursor: pointer;
        color: #a77fcf;
        text-decoration: none;
    }
</style>