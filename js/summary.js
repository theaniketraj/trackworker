import { workoutsData } from './data-store.js';

export function updateSummary() {
    const workoutList = document.getElementById("workoutList");
    const emptyState = document.getElementById("emptyState");
    const count = workoutList.children.length;
    document.getElementById("exCount").textContent = count;
    document.getElementById("estTime").textContent = count * 12 + "m"; // Rough estimate

    // Calculate Today's Volume
    let todayVolume = 0;
    workoutList.querySelectorAll('.exercise-block').forEach(block => {
        const style = block.dataset.style;
        if (style === 'weight_reps' || !style) {
            block.querySelectorAll('.set-row.completed').forEach(row => {
                const inputs = row.querySelectorAll('.log-input');
                if (inputs.length >= 2) {
                    const weight = parseFloat(inputs[0].value) || 0;
                    const reps = parseInt(inputs[1].value) || 0;
                    todayVolume += (weight * reps);
                }
            });
        }
    });
    
    document.getElementById("volCount").textContent = todayVolume > 0 ? `${todayVolume}kg` : "0kg";

    if (count === 0) {
        emptyState.classList.add("active");
    } else {
        emptyState.classList.remove("active");
    }

    updateDashboardStats();
}

function updateDashboardStats() {
    let totalWorkouts = 0;
    let totalVolume = 0;
    const exerciseCounts = {};
    
    // Calculate total volume and workouts from localStorage (workoutsData)
    for (const date in workoutsData) {
        const dayWorkouts = workoutsData[date];
        if (dayWorkouts && dayWorkouts.length > 0) {
            totalWorkouts++;
            
            dayWorkouts.forEach(ex => {
                // Count exercises for top exercise
                exerciseCounts[ex.name] = (exerciseCounts[ex.name] || 0) + 1;
                
                // Add to total volume
                if (ex.sets && (ex.style === 'weight_reps' || !ex.style)) {
                    ex.sets.forEach(set => {
                        if (set.completed && set.weight && set.reps) {
                            totalVolume += (parseFloat(set.weight) * parseInt(set.reps));
                        }
                    });
                }
            });
        }
    }

    // Determine Top Exercise
    let topEx = "-";
    let maxCount = 0;
    for (const ex in exerciseCounts) {
        if (exerciseCounts[ex] > maxCount) {
            maxCount = exerciseCounts[ex];
            topEx = ex;
        }
    }

    // Determine Current Streak
    let streak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        if (workoutsData[dateStr] && workoutsData[dateStr].length > 0) {
            streak++;
        } else if (i !== 0) {
            break;
        }
    }

    if (document.getElementById("dashTotalWorkouts")) {
        document.getElementById("dashTotalWorkouts").textContent = totalWorkouts;
        document.getElementById("dashTotalVolume").textContent = `${totalVolume} kg`;
        document.getElementById("dashStreak").textContent = `${streak} Days`;
        document.getElementById("dashTopEx").textContent = topEx.length > 10 ? topEx.substring(0, 10) + '...' : topEx;
    }
}

// Make globally available for inline onclick handlers
globalThis.updateSummary = updateSummary;

// Setup expand/collapse toggle
export function initDashboardPanel() {
    const expandBtn = document.getElementById('expandStatsBtn');
    const panel = document.getElementById('dashboardPanel');
    const header = document.getElementById('stickyHeader');
    
    if (!expandBtn || !panel) return;
    
    const togglePanel = () => {
        expandBtn.classList.toggle('active');
        panel.classList.toggle('expanded');
    };
    
    expandBtn.addEventListener('click', togglePanel);
    header.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            togglePanel();
        }
    });
}
