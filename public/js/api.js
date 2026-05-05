export async function fetchStandingsData(year) {
    const response = await fetch(`/api/standings?year=${year}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
}

export async function fetchTeamData(endpoint, teamId, year) {
    const response = await fetch(`/api/team/${endpoint}?teamId=${teamId}&year=${year}`);
    if (!response.ok) throw new Error('Fetch failed');
    return await response.json();
}