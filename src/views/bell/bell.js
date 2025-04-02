// src/views/bell/bell.js
import Bell from './Bell.vue';

const bellRoutes = {
    path: '/bell',  // 可設為任何路徑，不會真的導航用
    name: 'bell',
    component: Bell,
    meta: { title: '通知鈴鐺' }
};

export default bellRoutes;
