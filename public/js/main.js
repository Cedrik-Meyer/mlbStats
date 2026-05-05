import { fetchStandingsData } from './api.js';
import { renderStandings } from './renderers.js';
import { setupModalEvents, openModal, loadAndRenderTab } from './ui.js';

let currentTeamId = null;

document.addEventListener('DOMContentLoaded', () => {
    populateYearDropdown();
    setupModalEvents(handleTabChange);
    loadStandings();
});

function populateYearDropdown() {
    const select = document.getElementById('year-select');
    const currentYear = new Date().getFullYear();

    for (let y = currentYear; y >= 1876; y--) {
        const option = document.createElement('option');
        option.value = y;
        option.textContent = y;
        select.appendChild(option);
    }
    select.addEventListener('change', loadStandings);
}

async function loadStandings() {
    const loadingElement = document.getElementById('loading');
    const containerElement = document.getElementById('standings-container');
    const selectedYear = document.getElementById('year-select').value;

    loadingElement.classList.remove('hidden');
    containerElement.classList.add('hidden');

    try {
        const data = await fetchStandingsData(selectedYear);
        const records = data.records || data;

        if (!records || records.length === 0) {
            loadingElement.textContent = `No data found for the ${selectedYear} season.`;
            return;
        }

        renderStandings(records, containerElement, handleTeamClick);
        loadingElement.classList.add('hidden');
        containerElement.classList.remove('hidden');
    } catch (error) {
        loadingElement.textContent = 'Error loading standings.';
    }
}

function handleTeamClick(teamId, teamName) {
    currentTeamId = teamId;
    openModal(teamName);
    const selectedYear = document.getElementById('year-select').value;
    loadAndRenderTab('schedule', currentTeamId, selectedYear);
}

function handleTabChange(tabName) {
    const selectedYear = document.getElementById('year-select').value;
    loadAndRenderTab(tabName, currentTeamId, selectedYear);
}