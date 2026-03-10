document.addEventListener('DOMContentLoaded', () => {
    fetchUVIndex();

    fetch('/api/get_all_skin_mortality_data')
        .then(response => response.json())
        .then(data => {
            if (!data || data.length === 0) {
                console.error("No data received from API.");
                return;
            }
            renderChart(data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
});

async function fetchUVIndex() {
    try {
        const res = await fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=-37.814&longitude=144.9633&daily=uv_index_max&forecast_days=1&timezone=Australia%2FMelbourne'
        );
        const data = await res.json();
        const uv = data.daily.uv_index_max[0];
        displayUVIndex(uv);
    } catch (err) {
        console.error('Error fetching UV index:', err);
        displayUVIndex(null);
    }
}

function displayUVIndex(uv) {
    const uvNumber = document.getElementById('uv-index');
    const uvBadge  = document.getElementById('uv-label');
    const uvAdvice = document.getElementById('uv-advice');
    if (!uvNumber) return;

    if (uv === null) {
        uvNumber.textContent = '—';
        if (uvBadge)  uvBadge.textContent = 'Unavailable';
        if (uvAdvice) uvAdvice.textContent = 'Could not fetch UV data.';
        return;
    }

    uvNumber.textContent = uv.toFixed(1);

    let level, color, bg, advice;

    if (uv <= 2) {
        level  = 'Low';
        color  = '#16A34A';
        bg     = '#DCFCE7';
        advice = 'No protection needed. You can safely stay outside.';
    } else if (uv <= 5) {
        level  = 'Moderate';
        color  = '#B45309';
        bg     = '#FEF9C3';
        advice = 'Some protection required. Wear SPF 30+ and a hat if outside for extended periods.';
    } else if (uv <= 7) {
        level  = 'High';
        color  = '#C2410C';
        bg     = '#FFEDD5';
        advice = 'Protection essential. Apply SPF 50+, wear protective clothing and seek shade 10am–4pm.';
    } else if (uv <= 10) {
        level  = 'Very High';
        color  = '#B91C1C';
        bg     = '#FEE2E2';
        advice = 'Extra protection required. Minimise sun exposure, SPF 50+ every 2 hrs, hat and sunglasses mandatory.';
    } else {
        level  = 'Extreme';
        color  = '#7E22CE';
        bg     = '#F3E8FF';
        advice = 'Maximum protection needed. Avoid being outside during midday hours — unprotected skin can burn in minutes.';
    }

    uvNumber.style.color = color;
    if (uvBadge) {
        uvBadge.textContent      = level;
        uvBadge.style.background = bg;
        uvBadge.style.color      = color;
    }
    if (uvAdvice) uvAdvice.textContent = advice;
}

function renderChart(data) {
    const aggregatedData = data.reduce((acc, curr) => {
        const year = curr.year;
        const deaths = curr.deaths;
        if (!acc[year]) acc[year] = 0;
        acc[year] += deaths;
        return acc;
    }, {});

    const years       = Object.keys(aggregatedData);
    const deathCounts = Object.values(aggregatedData);

    const ctx = document.getElementById('sunSafetyChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Total Deaths from Melanoma',
                data: deathCounts,
                borderColor: '#F97316',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#F97316',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { grid: { display: false }, title: { display: true, text: 'Year', color: '#78716C' }, ticks: { color: '#78716C' } },
                y: { grid: { color: 'rgba(0,0,0,0.05)' }, title: { display: true, text: 'Number of Deaths', color: '#78716C' }, ticks: { color: '#78716C' }, beginAtZero: false }
            },
            plugins: {
                legend: { display: false },
                tooltip: { backgroundColor: '#1C1917', titleColor: '#FFF', bodyColor: '#D6D3D1', padding: 10, cornerRadius: 8 }
            }
        }
    });
}
