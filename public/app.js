document.addEventListener('DOMContentLoaded', () => {
    fetchStandings();
});

async function fetchStandings() {
    const loadingElement = document.getElementById('loading');
    const containerElement = document.getElementById('standings-container');

    try {
        const response = await fetch('/api/standings');

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log("MLB API Data:", data);

        const records = data.records || data;

        if (!records || records.length === 0) {
            loadingElement.textContent = 'No data found. Check your API parameters or console.';
            loadingElement.classList.remove('hidden');
            return;
        }

        renderStandings(records, containerElement);

        loadingElement.classList.add('hidden');
        containerElement.classList.remove('hidden');
    } catch (error) {
        console.error("Fetch error:", error);
        loadingElement.textContent = 'Error loading standings. Please check the browser console (F12).';
        loadingElement.classList.remove('hidden');
    }
}

function renderStandings(records, container) {
    container.innerHTML = '';

    records.forEach(division => {
        const divisionCard = document.createElement('div');
        divisionCard.className = 'division-card';

        let shortName = division.division.name;
        shortName = shortName.replace('American League', 'AL').replace('National League', 'NL');

        const divisionHeader = document.createElement('div');
        divisionHeader.className = 'division-name';
        divisionHeader.textContent = shortName;
        divisionCard.appendChild(divisionHeader);

        const table = document.createElement('table');
        table.className = 'standings-table';

        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Team</th>
                <th>W</th>
                <th>L</th>
                <th>PCT</th>
                <th>GB</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        division.teamRecords.forEach(teamRecord => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="team-name">${teamRecord.team.name}</td>
                <td>${teamRecord.wins}</td>
                <td>${teamRecord.losses}</td>
                <td>${teamRecord.winningPercentage}</td>
                <td>${teamRecord.gamesBack}</td>
            `;
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        divisionCard.appendChild(table);
        container.appendChild(divisionCard);
    });
}