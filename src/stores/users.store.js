import { defineStore } from 'pinia';

import { fetchWrapper } from '@/helpers';
import { router } from '@/router';
import { useAuthStore } from '@/stores';

const baseUrl = `${import.meta.env.VITE_API_URL}/users`;

export const useUsersStore = defineStore({
    id: 'users',
    state: () => ({
        users: {},
        user: {}
    }),
    actions: {
        async register(user) {
            await fetchWrapper.post(`${baseUrl}/register`, user);
        },
        async getAll() {
            this.users = { loading: true };
            await fetchWrapper.get(baseUrl)
                .then(users => this.users = users)
                .catch(error => this.users = { error });
        },
        async getById(id) {
            this.user = { loading: true };
            await fetchWrapper.get(`${baseUrl}/${id}`)
                .then(user => this.user = user)
                .catch(error => this.user = { error });
        },
        async update(id, params) {
            await fetchWrapper.put(`${baseUrl}/${id}`, params)
                .then(x => {
                    // update stored user if the logged in user updated their own record
                    const authStore = useAuthStore();
                    if (id === authStore.user.id) {
                        // update local storage
                        const user = { ...authStore.user, ...params };
                        localStorage.setItem('user', JSON.stringify(user));

                        // update auth user in pinia state
                        authStore.user = user;
                    }
                    return x;
                });
        },
        async delete(id) {
            // add isDeleting prop to user being deleted
            this.users.find(x => x.id === id).isDeleting = true;
            await fetchWrapper.delete(`${baseUrl}/${id}`)
                .then(() => {
                    // remove user from list after deleting
                    this.users = this.users.filter(x => x.id !== id);

                    // auto logout if the logged in user deleted their own record
                    const authStore = useAuthStore();
                    if (id === authStore.user.id) {
                        authStore.logout();
                    }
                });
        }
    }
});
