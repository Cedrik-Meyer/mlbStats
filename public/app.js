document.addEventListener('DOMContentLoaded', () => {
    populateYearDropdown();
    fetchStandings();
    setupEventListeners();
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

    select.addEventListener('change', fetchStandings);
}

function setupEventListeners() {
    document.getElementById('close-modal-btn').addEventListener('click', () => {
        document.getElementById('team-modal').classList.add('hidden');
    });

    document.getElementById('team-modal').addEventListener('click', (e) => {
        if (e.target.id === 'team-modal') {
            document.getElementById('team-modal').classList.add('hidden');
        }
    });

    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            document.getElementById('schedule-content').classList.add('hidden');
            document.getElementById('stats-hitting-content').classList.add('hidden');
            document.getElementById('stats-pitching-content').classList.add('hidden');

            const tabName = e.target.getAttribute('data-tab');
            document.getElementById(`${tabName}-content`).classList.remove('hidden');

            loadTeamData(tabName);
        });
    });
}

async function fetchStandings() {
    const loadingElement = document.getElementById('loading');
    const containerElement = document.getElementById('standings-container');
    const selectedYear = document.getElementById('year-select').value;

    loadingElement.classList.remove('hidden');
    containerElement.classList.add('hidden');

    try {
        const response = await fetch(`/api/standings?year=${selectedYear}`);
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        const records = data.records || data;

        if (!records || records.length === 0) {
            loadingElement.textContent = `No data found for the ${selectedYear} season.`;
            return;
        }

        renderStandings(records, containerElement);
        loadingElement.classList.add('hidden');
        containerElement.classList.remove('hidden');
    } catch (error) {
        loadingElement.textContent = 'Error loading standings.';
    }
}

function renderStandings(records, container) {
    container.innerHTML = '';

    records.forEach(group => {
        const divisionCard = document.createElement('div');
        divisionCard.className = 'division-card';

        let fullName = group.division ? group.division.name : group.league.name;
        let shortName = fullName.replace('American League', 'AL').replace('National League', 'NL');

        const divisionHeader = document.createElement('div');
        divisionHeader.className = 'division-name';
        divisionHeader.textContent = shortName;
        divisionCard.appendChild(divisionHeader);

        const table = document.createElement('table');
        table.className = 'standings-table';

        const thead = document.createElement('thead');
        thead.innerHTML = `<tr><th>Team</th><th>W</th><th>L</th><th>PCT</th><th>GB</th></tr>`;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        group.teamRecords.forEach(teamRecord => {
            const tr = document.createElement('tr');
            tr.className = 'clickable-row';
            tr.dataset.teamId = teamRecord.team.id;
            tr.dataset.teamName = teamRecord.team.name;

            tr.innerHTML = `
                <td class="team-name">${teamRecord.team.name}</td>
                <td>${teamRecord.wins}</td>
                <td>${teamRecord.losses}</td>
                <td>${teamRecord.winningPercentage}</td>
                <td>${teamRecord.gamesBack}</td>
            `;

            tr.addEventListener('click', () => {
                currentTeamId = teamRecord.team.id;
                currentTeamName = teamRecord.team.name;
                openTeamView();
            });

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        divisionCard.appendChild(table);
        container.appendChild(divisionCard);
    });
}

function openTeamView() {
    document.getElementById('team-modal').classList.remove('hidden');
    document.getElementById('team-title').textContent = currentTeamName;

    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-tab="schedule"]').classList.add('active');

    document.getElementById('schedule-content').classList.remove('hidden');
    document.getElementById('stats-hitting-content').classList.add('hidden');
    document.getElementById('stats-pitching-content').classList.add('hidden');

    loadTeamData('schedule');
}

async function loadTeamData(tab) {
    const loading = document.getElementById('team-loading');
    const contentDiv = document.getElementById(`${tab}-content`);
    const year = document.getElementById('year-select').value;

    contentDiv.innerHTML = '';
    loading.classList.remove('hidden');

    try {
        const apiEndpoint = tab === 'schedule' ? 'schedule' : 'stats';
        const response = await fetch(`/api/team/${apiEndpoint}?teamId=${currentTeamId}&year=${year}`);

        if (!response.ok) throw new Error('Fetch failed');
        const data = await response.json();

        if (tab === 'schedule') {
            renderSchedule(data, contentDiv);
        } else if (tab === 'stats-hitting') {
            renderHittingStats(data, contentDiv);
        } else if (tab === 'stats-pitching') {
            renderPitchingStats(data, contentDiv);
        }
    } catch (error) {
        contentDiv.innerHTML = '<p>Error loading data.</p>';
    } finally {
        loading.classList.add('hidden');
    }
}

function renderSchedule(dates, container) {
    if (!dates || dates.length === 0) {
        container.innerHTML = '<p>No schedule data available.</p>';
        return;
    }

    let html = '<table class="basic-table"><thead><tr><th>Date & Time</th><th>Opponent</th><th>Result</th><th>Status</th></tr></thead><tbody>';

    let currentPostseasonRound = '';
    const roundNames = {
        'F': 'Wild Card Series',
        'D': 'Division Series',
        'L': 'Championship Series',
        'W': 'World Series'
    };

    dates.forEach(dateObj => {
        dateObj.games.forEach(game => {
            const gType = game.gameType;

            if (['F', 'D', 'L', 'W'].includes(gType) && currentPostseasonRound !== gType) {
                currentPostseasonRound = gType;
                html += `<tr class="postseason-row"><td colspan="4">${roundNames[gType]}</td></tr>`;
            }

            const gameDate = new Date(game.gameDate);
            const dateStr = gameDate.toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' });
            const timeStr = gameDate.toLocaleTimeString('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit' });
            const dateTimeDisplay = `${dateStr} ${timeStr}`;

            const isHome = game.teams.home.team.id === currentTeamId;
            const opponentName = isHome ? game.teams.away.team.name : game.teams.home.team.name;
            const matchupLocation = isHome ? 'vs' : '@';
            const matchupDisplay = `${matchupLocation} ${opponentName}`;

            const status = game.status.detailedState;

            let resultDisplay = '-';
            if (status === 'Final' || status === 'Completed Early') {
                const homeScore = game.teams.home.score;
                const awayScore = game.teams.away.score;

                if (homeScore !== undefined && awayScore !== undefined) {
                    const teamScore = isHome ? homeScore : awayScore;
                    const oppScore = isHome ? awayScore : homeScore;
                    const winLoss = teamScore > oppScore ? 'W' : (teamScore < oppScore ? 'L' : 'T');
                    resultDisplay = `${winLoss} ${teamScore}-${oppScore}`;
                }
            }

            html += `<tr><td>${dateTimeDisplay}</td><td>${matchupDisplay}</td><td>${resultDisplay}</td><td>${status}</td></tr>`;
        });
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderHittingStats(roster, container) {
    if (!roster || roster.length === 0) {
        container.innerHTML = '<p>No stats data available.</p>';
        return;
    }

    let html = '<table class="basic-table"><thead><tr><th>Player</th><th>Pos</th><th>AVG</th><th>HR</th><th>RBI</th></tr></thead><tbody>';

    roster.forEach(player => {
        const name = player.person.fullName;
        const pos = player.position.abbreviation;

        if (pos === 'P') return;

        let statsObj = null;
        if (player.person.stats) {
            const hitGroup = player.person.stats.find(s => s.group.displayName === 'hitting');
            if (hitGroup && hitGroup.splits && hitGroup.splits.length > 0) {
                statsObj = hitGroup.splits[0].stat;
            }
        }

        const avg = statsObj?.avg || '-';
        const hr = statsObj?.homeRuns || '-';
        const rbi = statsObj?.rbi || '-';

        html += `<tr><td>${name}</td><td>${pos}</td><td>${avg}</td><td>${hr}</td><td>${rbi}</td></tr>`;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderPitchingStats(roster, container) {
    if (!roster || roster.length === 0) {
        container.innerHTML = '<p>No stats data available.</p>';
        return;
    }

    let html = '<table class="basic-table"><thead><tr><th>Player</th><th>W</th><th>L</th><th>ERA</th><th>SO</th></tr></thead><tbody>';

    roster.forEach(player => {
        const name = player.person.fullName;
        const pos = player.position.abbreviation;

        if (pos !== 'P' && pos !== 'TWP') return;

        let statsObj = null;
        if (player.person.stats) {
            const pitchGroup = player.person.stats.find(s => s.group.displayName === 'pitching');
            if (pitchGroup && pitchGroup.splits && pitchGroup.splits.length > 0) {
                statsObj = pitchGroup.splits[0].stat;
            }
        }

        const w = statsObj?.wins || '0';
        const l = statsObj?.losses || '0';
        const era = statsObj?.era || '-';
        const so = statsObj?.strikeOuts || '0';

        html += `<tr><td>${name}</td><td>${w}</td><td>${l}</td><td>${era}</td><td>${so}</td></tr>`;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}