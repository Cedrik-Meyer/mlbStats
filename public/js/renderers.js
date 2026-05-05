export function renderStandings(records, container, onTeamClick) {
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
            tr.innerHTML = `
                <td class="team-name">${teamRecord.team.name}</td>
                <td>${teamRecord.wins}</td>
                <td>${teamRecord.losses}</td>
                <td>${teamRecord.winningPercentage}</td>
                <td>${teamRecord.gamesBack}</td>
            `;

            tr.addEventListener('click', () => {
                onTeamClick(teamRecord.team.id, teamRecord.team.name);
            });

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        divisionCard.appendChild(table);
        container.appendChild(divisionCard);
    });
}

export function renderSchedule(dates, container, teamId) {
    if (!dates || dates.length === 0) {
        container.innerHTML = '<p>No schedule data available.</p>';
        return;
    }

    let html = '<table class="basic-table"><thead><tr><th>Date & Time</th><th>Opponent</th><th>Result</th><th>Status</th></tr></thead><tbody>';

    let currentPostseasonRound = '';
    const roundNames = { 'F': 'Wild Card Series', 'D': 'Division Series', 'L': 'Championship Series', 'W': 'World Series' };

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

            const isHome = game.teams.home.team.id === teamId;
            const opponentName = isHome ? game.teams.away.team.name : game.teams.home.team.name;
            const matchupDisplay = `${isHome ? 'vs' : '@'} ${opponentName}`;
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

            html += `<tr><td>${dateStr} ${timeStr}</td><td>${matchupDisplay}</td><td>${resultDisplay}</td><td>${status}</td></tr>`;
        });
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

export function renderHittingStats(roster, container) {
    if (!roster || roster.length === 0) {
        container.innerHTML = '<p>No stats data available.</p>';
        return;
    }
    let html = '<table class="basic-table"><thead><tr><th>Player</th><th>Pos</th><th>AVG</th><th>HR</th><th>RBI</th></tr></thead><tbody>';
    roster.forEach(player => {
        const pos = player.position.abbreviation;
        if (pos === 'P') return;

        let statsObj = null;
        if (player.person.stats) {
            const hitGroup = player.person.stats.find(s => s.group.displayName === 'hitting');
            if (hitGroup && hitGroup.splits.length > 0) statsObj = hitGroup.splits[0].stat;
        }

        html += `<tr><td>${player.person.fullName}</td><td>${pos}</td><td>${statsObj?.avg || '-'}</td><td>${statsObj?.homeRuns || '-'}</td><td>${statsObj?.rbi || '-'}</td></tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

export function renderPitchingStats(roster, container) {
    if (!roster || roster.length === 0) {
        container.innerHTML = '<p>No stats data available.</p>';
        return;
    }
    let html = '<table class="basic-table"><thead><tr><th>Player</th><th>W</th><th>L</th><th>ERA</th><th>SO</th></tr></thead><tbody>';
    roster.forEach(player => {
        const pos = player.position.abbreviation;
        if (pos !== 'P' && pos !== 'TWP') return;

        let statsObj = null;
        if (player.person.stats) {
            const pitchGroup = player.person.stats.find(s => s.group.displayName === 'pitching');
            if (pitchGroup && pitchGroup.splits.length > 0) statsObj = pitchGroup.splits[0].stat;
        }

        html += `<tr><td>${player.person.fullName}</td><td>${statsObj?.wins || '0'}</td><td>${statsObj?.losses || '0'}</td><td>${statsObj?.era || '-'}</td><td>${statsObj?.strikeOuts || '0'}</td></tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}