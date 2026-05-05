import { fetchTeamData } from './api.js';
import { renderSchedule, renderHittingStats, renderPitchingStats } from './renderers.js';

export function setupModalEvents(onTabChange) {
    document.getElementById('close-modal-btn').addEventListener('click', closeModal);
    document.getElementById('team-modal').addEventListener('click', (e) => {
        if (e.target.id === 'team-modal') closeModal();
    });

    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            ['schedule', 'stats-hitting', 'stats-pitching'].forEach(tab => {
                document.getElementById(`${tab}-content`).classList.add('hidden');
            });

            const tabName = e.target.getAttribute('data-tab');
            document.getElementById(`${tabName}-content`).classList.remove('hidden');

            onTabChange(tabName);
        });
    });
}

function closeModal() {
    document.getElementById('team-modal').classList.add('hidden');
}

export function openModal(teamName) {
    document.getElementById('team-modal').classList.remove('hidden');
    document.getElementById('team-title').textContent = teamName;

    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-tab="schedule"]').classList.add('active');

    ['schedule', 'stats-hitting', 'stats-pitching'].forEach(tab => {
        document.getElementById(`${tab}-content`).classList.add('hidden');
    });
    document.getElementById('schedule-content').classList.remove('hidden');
}

export async function loadAndRenderTab(tab, teamId, year) {
    const loading = document.getElementById('team-loading');
    const contentDiv = document.getElementById(`${tab}-content`);

    contentDiv.innerHTML = '';
    loading.classList.remove('hidden');

    try {
        const apiEndpoint = tab === 'schedule' ? 'schedule' : 'stats';
        const data = await fetchTeamData(apiEndpoint, teamId, year);

        if (tab === 'schedule') renderSchedule(data, contentDiv, teamId);
        else if (tab === 'stats-hitting') renderHittingStats(data, contentDiv);
        else if (tab === 'stats-pitching') renderPitchingStats(data, contentDiv);
    } catch (error) {
        contentDiv.innerHTML = '<p>Error loading data.</p>';
    } finally {
        loading.classList.add('hidden');
    }
}