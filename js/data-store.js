export const currentDate = new Date().toISOString().split('T')[0];
export const workoutsData = JSON.parse(localStorage.getItem('workoutsData')) || {};

export function getWorkouts(date) {
    return workoutsData[date] || [];
}

export function saveWorkouts(date, workoutJSON) {
    workoutsData[date] = workoutJSON;
    localStorage.setItem('workoutsData', JSON.stringify(workoutsData));
}

export function setCurrentDate(dateStr) {
    currentDate = dateStr;
}
