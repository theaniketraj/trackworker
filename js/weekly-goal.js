import { workoutsData, currentDate } from './data-store.js';

export function updateWeeklyGoal() {
    const curr = new Date(currentDate);
    // Find Monday of the current week
    const day = curr.getDay() || 7; // Get current day number, converting Sun(0) to 7
    curr.setHours(-24 * (day - 1)); // Set to Monday
    
    let loggedDays = 0;
    
    for (let i = 0; i < 7; i++) {
        const dStr = curr.toISOString().split('T')[0];
        if (workoutsData[dStr] && workoutsData[dStr].length > 0) {
            loggedDays++;
        }
        curr.setHours(24); // Move to next day
    }
    
    // Update DOM
    const goalText = document.getElementById('weeklyGoalText');
    const goalFill = document.getElementById('weeklyGoalFill');
    
    if(goalText) goalText.textContent = `${loggedDays}/4`;
    if(goalFill) goalFill.style.width = `${Math.min((loggedDays / 4) * 100, 100)}%`;
}
