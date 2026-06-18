import { updateSummary } from './summary.js';
import { saveWorkouts, currentDate, getWorkouts } from './data-store.js';
import { updateWeeklyGoal } from './weekly-goal.js';

export function initWorkoutList() {
    const workoutList = document.getElementById("workoutList");
    new Sortable(workoutList, {
        handle: ".drag-handle",
        animation: 150,
        ghostClass: "sortable-ghost",
    });

    // Selection state logic
    workoutList.addEventListener("click", (e) => {
        // Ignore clicks on buttons/inputs
        if (
            e.target.tagName === "BUTTON" ||
            e.target.tagName === "INPUT" ||
            e.target.tagName === "TEXTAREA" ||
            e.target.closest("button")
        )
            return;

        const block = e.target.closest(".exercise-block");
        if (block) {
            document
                .querySelectorAll(".exercise-block")
                .forEach((b) => b.classList.remove("selected"));
            block.classList.add("selected");
        }
    });

    // Attach to save button
    document.querySelector('.bottom-sticky .save-cta').addEventListener('click', saveCurrentWorkout);
}

// Expose global methods
globalThis.toggleSet = function (btn) {
    const row = btn.closest(".set-row");
    const inputs = row.querySelectorAll(".log-input");
    if (row.classList.contains("completed")) {
        row.classList.remove("completed");
        inputs.forEach((input) => (input.disabled = false));
    } else {
        row.classList.add("completed");
        inputs.forEach((input) => (input.disabled = true));
    }
    updateSummary();
};

globalThis.removeSet = function(btn) {
    const setList = btn.closest(".set-list");
    btn.closest(".set-row").remove();
    // Re-number remaining sets
    const rows = setList.querySelectorAll(".set-row:not(.header-row)");
    rows.forEach((row, idx) => {
        row.querySelector(".set-number").textContent = idx + 1;
    });
    updateSummary();
};

globalThis.toggleNote = function(btn) {
    const noteSection = btn.closest('.exercise-controls').querySelector('.exercise-note');
    noteSection.classList.toggle('hidden');
    if (!noteSection.classList.contains('hidden')) {
        noteSection.querySelector('.note-input').focus();
    }
};

globalThis.addSet = function (btn) {
    const block = btn.closest(".exercise-block");
    const style = block.dataset.style || 'weight_reps';
    const setList = btn.closest(".exercise-controls").querySelector(".set-list");
    const rows = setList.querySelectorAll(".set-row:not(.header-row)");
    const newSetNum = rows.length + 1;
    
    let inputsHTML = '';
    
    if (rows.length > 0) {
        const lastRow = rows[rows.length - 1];
        const inputs = lastRow.querySelectorAll(".log-input");
        if (style === 'duration') {
            inputsHTML = `<input type="number" class="log-input" placeholder="sec" value="${inputs[0].value}" style="flex:2">`;
        } else if (style === 'bodyweight_reps') {
            inputsHTML = `<input type="number" class="log-input" placeholder="reps" value="${inputs[0].value}" style="flex:2">`;
        } else {
            inputsHTML = `
                <input type="number" class="log-input" placeholder="kg" value="${inputs[0].value}">
                <input type="number" class="log-input" placeholder="reps" value="${inputs[1].value}">
            `;
        }
    } else {
        // Fallback if no sets exist
        if (style === 'duration') {
            inputsHTML = `<input type="number" class="log-input" placeholder="sec" value="60" style="flex:2">`;
        } else if (style === 'bodyweight_reps') {
            inputsHTML = `<input type="number" class="log-input" placeholder="reps" value="10" style="flex:2">`;
        } else {
            inputsHTML = `
                <input type="number" class="log-input" placeholder="kg" value="20">
                <input type="number" class="log-input" placeholder="reps" value="10">
            `;
        }
    }

    const newRow = document.createElement("div");
    newRow.className = "set-row";
    newRow.innerHTML = `
        <div class="set-number">${newSetNum}</div>
        ${inputsHTML}
        <div style="display:flex; gap: 4px;">
            <button class="check-btn" onclick="toggleSet(this)"><i class="ph ph-check"></i></button>
            <button class="delete-set-btn" onclick="removeSet(this)"><i class="ph ph-x"></i></button>
        </div>
    `;
    setList.appendChild(newRow);
};

globalThis.removeExercise = function(btn) {
    btn.closest('.exercise-block').remove();
    updateSummary();
};

globalThis.addExerciseToDOM = function(name, target, style = 'weight_reps') {
    const list = document.getElementById("workoutList");
    const newBlock = document.createElement("div");
    newBlock.className = "exercise-block";
    newBlock.dataset.style = style;
    
    let headerHTML = '';
    let rowHTML = '';
    
    if (style === 'duration') {
        headerHTML = `
            <span class="set-num-label">Set</span>
            <span class="set-weight-label" style="flex:2; text-align:center;">Duration (s)</span>
            <div style="width: 68px;"></div>
        `;
        rowHTML = `
            <div class="set-row">
                <div class="set-number">1</div>
                <input type="number" class="log-input" placeholder="sec" value="60" style="flex:2">
                <div style="display:flex; gap: 4px;">
                    <button class="check-btn" onclick="toggleSet(this)"><i class="ph ph-check"></i></button>
                    <button class="delete-set-btn" onclick="removeSet(this)"><i class="ph ph-x"></i></button>
                </div>
            </div>
        `;
    } else if (style === 'bodyweight_reps') {
        headerHTML = `
            <span class="set-num-label">Set</span>
            <span class="set-reps-label" style="flex:2; text-align:center;">Reps</span>
            <div style="width: 68px;"></div>
        `;
        rowHTML = `
            <div class="set-row">
                <div class="set-number">1</div>
                <input type="number" class="log-input" placeholder="reps" value="10" style="flex:2">
                <div style="display:flex; gap: 4px;">
                    <button class="check-btn" onclick="toggleSet(this)"><i class="ph ph-check"></i></button>
                    <button class="delete-set-btn" onclick="removeSet(this)"><i class="ph ph-x"></i></button>
                </div>
            </div>
        `;
    } else {
        headerHTML = `
            <span class="set-num-label">Set</span>
            <span class="set-weight-label">kg</span>
            <span class="set-reps-label">Reps</span>
            <div style="width: 68px;"></div>
        `;
        rowHTML = `
            <div class="set-row">
                <div class="set-number">1</div>
                <input type="number" class="log-input" placeholder="kg" value="20">
                <input type="number" class="log-input" placeholder="reps" value="10">
                <div style="display:flex; gap: 4px;">
                    <button class="check-btn" onclick="toggleSet(this)"><i class="ph ph-check"></i></button>
                    <button class="delete-set-btn" onclick="removeSet(this)"><i class="ph ph-x"></i></button>
                </div>
            </div>
        `;
    }

    newBlock.innerHTML = `
        <div class="drag-handle"><i class="ph ph-dots-six-vertical"></i></div>
        <div class="exercise-content">
            <div class="exercise-header">
                <div>
                    <div class="exercise-name">${name}</div>
                    <div class="exercise-target">${target}</div>
                </div>
                <button class="remove-btn" onclick="removeExercise(this)"><i class="ph ph-trash"></i></button>
            </div>
            
            <div class="exercise-controls">
                <div class="set-list">
                    <div class="set-row header-row">
                        ${headerHTML}
                    </div>
                    ${rowHTML}
                </div>
                <div class="exercise-note hidden">
                    <textarea class="note-input" placeholder="Add a note..."></textarea>
                </div>
                <div class="exercise-actions">
                    <button class="action-btn" onclick="addSet(this)">+ Add Set</button>
                    <button class="action-btn" onclick="toggleNote(this)"><i class="ph ph-chat-text"></i> Note</button>
                </div>
            </div>

            <div class="rest-timer-chip">
                <i class="ph ph-timer"></i> <span>60s rest</span>
            </div>
        </div>
    `;

    list.appendChild(newBlock);
    updateSummary();
};

export function saveCurrentWorkout() {
    const list = document.getElementById("workoutList");
    const blocks = list.querySelectorAll('.exercise-block');
    const workoutData = [];

    blocks.forEach(block => {
        const name = block.querySelector('.exercise-name').textContent;
        const target = block.querySelector('.exercise-target').textContent;
        const style = block.dataset.style || 'weight_reps';
        
        const noteInput = block.querySelector('.note-input');
        const note = noteInput ? noteInput.value.trim() : '';

        const sets = [];
        block.querySelectorAll('.set-row:not(.header-row)').forEach(row => {
            const inputs = row.querySelectorAll('.log-input');
            const setObj = { completed: row.classList.contains('completed') };
            
            if (style === 'duration') {
                setObj.duration = inputs[0].value;
            } else if (style === 'bodyweight_reps') {
                setObj.reps = inputs[0].value;
            } else {
                setObj.weight = inputs[0].value;
                setObj.reps = inputs[1].value;
            }
            
            sets.push(setObj);
        });

        workoutData.push({ name, target, style, sets, note });
    });

    saveWorkouts(currentDate, workoutData);
    updateWeeklyGoal();
    updateSummary();
    
    // Show a quick visual feedback (optional)
    const btn = document.querySelector('.bottom-sticky .save-cta');
    const origHtml = btn.innerHTML;
    btn.innerHTML = '<i class="ph ph-check"></i> Saved!';
    setTimeout(() => btn.innerHTML = origHtml, 1500);
}
globalThis.saveCurrentWorkout = saveCurrentWorkout;

export function loadWorkoutToDOM(dateStr) {
    const list = document.getElementById("workoutList");
    list.innerHTML = '';
    
    const data = getWorkouts(dateStr);
    
    data.forEach(exercise => {
        const newBlock = document.createElement("div");
        newBlock.className = "exercise-block";
        newBlock.dataset.style = exercise.style || 'weight_reps';
        
        let headerHTML = '';
        if (exercise.style === 'duration') {
            headerHTML = `
                <span class="set-num-label">Set</span>
                <span class="set-weight-label" style="flex:2; text-align:center;">Duration (s)</span>
                <div style="width: 68px;"></div>
            `;
        } else if (exercise.style === 'bodyweight_reps') {
            headerHTML = `
                <span class="set-num-label">Set</span>
                <span class="set-reps-label" style="flex:2; text-align:center;">Reps</span>
                <div style="width: 68px;"></div>
            `;
        } else {
            headerHTML = `
                <span class="set-num-label">Set</span>
                <span class="set-weight-label">kg</span>
                <span class="set-reps-label">Reps</span>
                <div style="width: 68px;"></div>
            `;
        }

        let setsHTML = '';
        exercise.sets.forEach((set, index) => {
            const num = index + 1;
            const completedClass = set.completed ? 'completed' : '';
            const disabledAttr = set.completed ? 'disabled' : '';
            
            let inputsHTML = '';
            if (exercise.style === 'duration') {
                inputsHTML = `<input type="number" class="log-input" placeholder="sec" value="${set.duration}" style="flex:2" ${disabledAttr}>`;
            } else if (exercise.style === 'bodyweight_reps') {
                inputsHTML = `<input type="number" class="log-input" placeholder="reps" value="${set.reps}" style="flex:2" ${disabledAttr}>`;
            } else {
                inputsHTML = `
                    <input type="number" class="log-input" placeholder="kg" value="${set.weight}" ${disabledAttr}>
                    <input type="number" class="log-input" placeholder="reps" value="${set.reps}" ${disabledAttr}>
                `;
            }

            setsHTML += `
                <div class="set-row ${completedClass}">
                    <div class="set-number">${num}</div>
                    ${inputsHTML}
                    <div style="display:flex; gap: 4px;">
                        <button class="check-btn" onclick="toggleSet(this)"><i class="ph ph-check"></i></button>
                        <button class="delete-set-btn" onclick="removeSet(this)"><i class="ph ph-x"></i></button>
                    </div>
                </div>
            `;
        });

        const noteHTML = exercise.note ? exercise.note : '';
        const noteClass = exercise.note ? '' : 'hidden';

        newBlock.innerHTML = `
            <div class="drag-handle"><i class="ph ph-dots-six-vertical"></i></div>
            <div class="exercise-content">
                <div class="exercise-header">
                    <div>
                        <div class="exercise-name">${exercise.name}</div>
                        <div class="exercise-target">${exercise.target}</div>
                    </div>
                    <button class="remove-btn" onclick="removeExercise(this)"><i class="ph ph-trash"></i></button>
                </div>
                
                <div class="exercise-controls">
                    <div class="set-list">
                        <div class="set-row header-row">
                            ${headerHTML}
                        </div>
                        ${setsHTML}
                    </div>
                    <div class="exercise-note ${noteClass}">
                        <textarea class="note-input" placeholder="Add a note...">${noteHTML}</textarea>
                    </div>
                    <div class="exercise-actions">
                        <button class="action-btn" onclick="addSet(this)">+ Add Set</button>
                        <button class="action-btn" onclick="toggleNote(this)"><i class="ph ph-chat-text"></i> Note</button>
                    </div>
                </div>

                <div class="rest-timer-chip">
                    <i class="ph ph-timer"></i> <span>60s rest</span>
                </div>
            </div>
        `;
        list.appendChild(newBlock);
    });
    
    updateSummary();
}
