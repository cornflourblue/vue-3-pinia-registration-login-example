import { Layout, Login, Register } from '@/views/account';

export default {
    path: '/account',
    component: Layout,
    children: [
        { path: 'login', component: Login },
        { path: 'register', component: Register }
    ]
};
