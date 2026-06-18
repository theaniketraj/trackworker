import { initWorkoutList } from './js/workout-list.js';
import { initSearch } from './js/search.js';
import { initTheme } from './js/theme.js';
import { initCalendar } from './js/calendar.js';
import { initAuth } from './js/auth.js';
import { initDashboardPanel } from './js/summary.js';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      console.log('SW registered:', reg.scope);
    }).catch(err => console.log('SW registration failed:', err));
  });
}

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initTheme();
    initCalendar();
    initWorkoutList();
    initSearch();
    initDashboardPanel();
});
