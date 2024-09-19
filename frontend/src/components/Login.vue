<script setup>
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';

    const router = useRouter();
    const email = ref('');
    const password = ref('');
    const error = ref('');

    async function login(email, password) {
        const res = await fetch('http://192.168.1.228:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (res.ok) {
            const { accessToken, refreshToken } = await res.json();
            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            return true;
        } else {
            const err = await res.json();
            console.error('Login failed: ', err.message);
            return false;
        }
    }

    async function fetchProtectedData() {
        const token = localStorage.getItem('token');

        const res = await fetch('http://192.168.1.228:3000/api/auth/protected', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Something went wrong');
        }

        const data = await res.json();
        console.log(data);
        
    }

    async function handleLogin() {        
        error.value = '';
        try {
            await login(email.value, password.value);
            await fetchProtectedData();
            router.push('/main');
        } catch (err) {
            error.value = err.message || 'Something went wrong';
            console.error(err);
        }
    }
</script>

<template>
    <div class="login">
        <h2>Login</h2>
        <form class="login-form" @submit.prevent="handleLogin">
            <input v-model="email" type="email" placeholder="Enter email" required/>
            <input v-model="password" type="password" placeholder="Enter password" required/>
            <p v-if="error" class="error-message">{{  error  }}</p>
            <button type="submit">Submit</button>
            <p>Don't have account? <router-link class="custom-link" to="/register">Register</router-link></p>
        </form>
    </div>
</template>

<style scoped>
    .login {
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

    .login h2 {
        margin: -10px 0 30px 0;
        text-align: center;
        
    }

    .login-form {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        gap: 20px;
    }

    .login-form input {
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

    .login-form button {
        cursor: pointer;
        position: relative;
        display: inline-block;
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

    .login-form button:hover {
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