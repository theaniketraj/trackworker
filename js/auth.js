export function initAuth() {
    const onboardingScreen = document.getElementById('onboardingScreen');
    const mainDashboard = document.getElementById('mainDashboard');
    const form = document.getElementById('onboardingForm');
    const appTitle = document.getElementById('appTitle');

    const userProfile = localStorage.getItem('userProfile');

    if (userProfile) {
        // User exists, show dashboard
        showDashboard(JSON.parse(userProfile));
    } else {
        // Show onboarding
        onboardingScreen.classList.remove('hidden');
        mainDashboard.classList.add('hidden');
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('userName').value.trim();
        const age = document.getElementById('userAge').value;
        const weight = document.getElementById('userWeight').value;

        if (!name || !age || !weight) return;

        const profile = { name, age, weight };
        localStorage.setItem('userProfile', JSON.stringify(profile));

        showDashboard(profile);
    });

    function showDashboard(profile) {
        onboardingScreen.classList.add('hidden');
        mainDashboard.classList.remove('hidden');

        // Personalize dashboard
        if (appTitle) {
            appTitle.textContent = `Hi, ${profile.name.split(' ')[0]}`;
        }

        // Populate Profile Modal
        const profileNameDisplay = document.getElementById('profileNameDisplay');
        const profileAgeDisplay = document.getElementById('profileAgeDisplay');
        const profileWeightDisplay = document.getElementById('profileWeightDisplay');

        if (profileNameDisplay) profileNameDisplay.textContent = profile.name;
        if (profileAgeDisplay) profileAgeDisplay.textContent = profile.age + " Years";
        if (profileWeightDisplay) profileWeightDisplay.textContent = profile.weight + " kg";
    }

    // Profile Modal Logic
    const profileBtn = document.getElementById('profileBtn');
    const profileModal = document.getElementById('profileModal');

    if (profileBtn && profileModal) {
        profileBtn.addEventListener('click', () => {
            profileModal.classList.add('active');
        });

        profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal || e.target.closest('.close-modal')) {
                profileModal.classList.remove('active');
            }
        });

        document.getElementById('deleteAccountBtn').addEventListener('click', () => {
            if (confirm("Are you sure you want to delete your account and all data? This cannot be undone.")) {
                localStorage.clear();
                globalThis.location.reload();
            }
        });
    }
}
