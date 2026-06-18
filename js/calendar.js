import { currentDate, workoutsData, setCurrentDate } from './data-store.js';
import { loadWorkoutToDOM, saveCurrentWorkout } from './workout-list.js';
import { updateWeeklyGoal } from './weekly-goal.js';

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

export function initCalendar() {
    const modal = document.getElementById('calendarModal');
    const dateBadge = document.getElementById('dateBadge');

    dateBadge.addEventListener('click', () => {
        // Auto-save current state before changing date
        if (globalThis.saveCurrentWorkout) {
            globalThis.saveCurrentWorkout();
        }
        renderCalendar();
        modal.classList.add('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.closest('.close-modal')) {
            modal.classList.remove('active');
        }
    });

    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar();
    });

    // Initialize display string and initial load
    updateDateBadge();
    loadWorkoutToDOM(currentDate);
    updateWeeklyGoal();
}

function updateDateBadge() {
    const badge = document.getElementById('dateBadge');
    const today = new Date().toISOString().split('T')[0];
    if (currentDate === today) {
        badge.textContent = "Today";
    } else {
        const d = new Date(currentDate + "T00:00:00"); // Ensure local time zone parsing
        badge.textContent = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
}

export function renderCalendar() {
    const grid = document.getElementById('calendarDays');
    const title = document.getElementById('calendarTitle');
    grid.innerHTML = '';

    const date = new Date(currentYear, currentMonth, 1);
    const monthName = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    title.textContent = monthName;

    const firstDayIndex = date.getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const todayStr = new Date().toISOString().split('T')[0];

    // Padding for first day
    for (let i = 0; i < firstDayIndex; i++) {
        const div = document.createElement('div');
        div.className = 'calendar-day empty';
        grid.appendChild(div);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const div = document.createElement('button');
        div.className = 'calendar-day';
        div.textContent = i;

        // Correct for timezone offset issues by using string building
        const cellDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

        if (cellDateStr === todayStr) div.classList.add('today');
        if (cellDateStr === currentDate) div.classList.add('selected');
        if (workoutsData[cellDateStr] && workoutsData[cellDateStr].length > 0) {
            div.classList.add('has-workout');
        }

        div.addEventListener('click', () => {
            setCurrentDate(cellDateStr);
            updateDateBadge();
            document.getElementById('calendarModal').classList.remove('active');
            loadWorkoutToDOM(cellDateStr);
            updateWeeklyGoal();
        });

        grid.appendChild(div);
    }

    // Pad end of month to always have exactly 42 cells (6 full rows)
    // This prevents the modal from jumping in height between months
    const totalCells = firstDayIndex + daysInMonth;
    const paddingEnd = 42 - totalCells;
    for (let i = 0; i < paddingEnd; i++) {
        const div = document.createElement('div');
        div.className = 'calendar-day empty';
        grid.appendChild(div);
    }
}
