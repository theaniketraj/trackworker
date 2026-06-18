import { updateSummary } from './summary.js';

export function initSearch() {
    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");

    // Load custom exercises
    const customEx = JSON.parse(localStorage.getItem('customExercises') || '[]');
    customEx.forEach(ex => {
        addSearchResultItem(ex.name, ex.target, ex.style, true);
    });

    searchInput.addEventListener("focus", () => {
        searchResults.classList.add("active");
    });

    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target) && !e.target.closest('#btnCustomEx')) {
            searchResults.classList.remove("active");
        }
    });

    // Custom exercise modal
    const customModal = document.getElementById('customExModal');
    document.getElementById('btnCustomEx').addEventListener('click', () => {
        customModal.classList.add('active');
        searchResults.classList.remove('active');
    });

    customModal.addEventListener('click', (e) => {
        if (e.target === customModal || e.target.closest('.close-modal')) {
            customModal.classList.remove('active');
        }
    });

    document.getElementById('customExForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('ceName').value;
        const target = document.getElementById('ceTarget').value;
        const style = document.getElementById('ceStyle').value;

        // Save to local storage custom DB
        const savedEx = JSON.parse(localStorage.getItem('customExercises') || '[]');
        savedEx.push({ name, target, style });
        localStorage.setItem('customExercises', JSON.stringify(savedEx));

        // Append to search results
        addSearchResultItem(name, target, style, true);

        // Add directly to workout list
        if (globalThis.addExerciseToDOM) {
            globalThis.addExerciseToDOM(name, target, style);
        }

        customModal.classList.remove('active');
        e.target.reset();
        searchInput.value = "";
    });

    // Handle clicks on static search items
    searchResults.querySelectorAll(".search-item:not(.custom)").forEach((item) => {
        item.addEventListener("click", () => {
            const name = item.dataset.name;
            const target = item.dataset.target;
            if (globalThis.addExerciseToDOM) {
                globalThis.addExerciseToDOM(name, target, 'weight_reps');
            }
            searchResults.classList.remove("active");
            searchInput.value = "";
        });
    });

    function addSearchResultItem(name, target, style, isCustom) {
        const div = document.createElement('div');
        div.className = 'search-item custom';
        div.innerHTML = `
            <div class="search-item-info">
              <h4>${name}</h4>
              <span>${target} ${isCustom ? '• Custom' : ''}</span>
            </div>
            <button class="add-btn"><i class="ph ph-plus"></i></button>
        `;
        div.addEventListener('click', () => {
            if (globalThis.addExerciseToDOM) {
                globalThis.addExerciseToDOM(name, target, style);
            }
            searchResults.classList.remove("active");
            searchInput.value = "";
        });
        searchResults.appendChild(div);
    }
}
