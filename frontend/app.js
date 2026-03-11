document.addEventListener('DOMContentLoaded', () => {
    fetchUVIndex();
    fetchMelanomaDataAndRenderChart();
});

async function fetchUVIndex() {
    try {
        // Fetch location first
        if (!navigator.geolocation) {
            throw new Error("Geolocation not supported");
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Call the local dev server UV mapping
            const res = await fetch(`/uv/api/uv?lat=${lat}&lng=${lng}`);
            const data = await res.json();
            displayUVIndex(data.uv);
        }, (err) => {
            // Fallback for demo
            console.warn("Geolocation warning/timeout:", err);
            displayUVIndex(3.6);
        }, { timeout: 3000 });

    } catch (err) {
        console.error('Error fetching UV index:', err);
        displayUVIndex(null);
    }
}

async function fetchMelanomaDataAndRenderChart() {
    try {
        // Fetch from local dev server's mounted RDS lambda
        const res = await fetch('/rds/api/get_all_skin_mortality_data');
        const data = await res.json();

        if (!data || data.length === 0) return;

        // Group by year for charting
        const grouped = {};
        for (const row of data) {
            grouped[row.year] = (grouped[row.year] || 0) + row.deaths;
        }

        const years = Object.keys(grouped).sort();
        const deaths = years.map(y => grouped[y]);

        const trace = {
            x: years,
            y: deaths,
            mode: 'lines+markers',
            line: { color: '#F97316', width: 2 },
            marker: { color: '#F97316', size: 6 },
            fill: 'tozeroy',
            fillcolor: 'rgba(249, 115, 22, 0.1)',
            type: 'scatter'
        };

        const layout = {
            margin: { t: 10, r: 10, b: 40, l: 40 },
            xaxis: { title: 'Year', gridcolor: 'rgba(0,0,0,0.05)', tickcolor: '#78716C', titlefont: { color: '#78716C' }, tickfont: { color: '#78716C' } },
            yaxis: { title: '', gridcolor: 'rgba(0,0,0,0.05)', tickcolor: '#78716C', titlefont: { color: '#78716C' }, tickfont: { color: '#78716C' } },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            hovermode: 'x unified',
            showlegend: false
        };

        const config = { responsive: true, displayModeBar: false };

        // Ensure Plotly is loaded (since it's an external CDN) before rendering
        if (typeof Plotly !== 'undefined') {
            Plotly.newPlot('plotlyChart', [trace], layout, config);
        } else {
            console.error("Plotly library not loaded yet.");
        }

    } catch (err) {
        console.error('Error fetching Melanoma Data:', err);
    }
}

function displayUVIndex(uv) {
    const uvNumber = document.getElementById('uv-index');
    const uvBadge = document.getElementById('uv-label');
    const uvAdvice = document.getElementById('uv-advice');
    if (!uvNumber) return;

    if (uv === null) {
        uvNumber.textContent = '—';
        if (uvBadge) uvBadge.textContent = 'Unavailable';
        if (uvAdvice) uvAdvice.textContent = 'Could not fetch UV data.';
        return;
    }

    uvNumber.textContent = uv.toFixed(1);

    let level, color, bg, advice;

    if (uv <= 2) {
        level = 'Low';
        color = '#16A34A';
        bg = '#DCFCE7';
        advice = 'No protection needed. You can safely stay outside.';
    } else if (uv <= 5) {
        level = 'Moderate';
        color = '#B45309';
        bg = '#FEF9C3';
        advice = 'Some protection required. Wear SPF 30+ and a hat if outside for extended periods.';
    } else if (uv <= 7) {
        level = 'High';
        color = '#C2410C';
        bg = '#FFEDD5';
        advice = 'Protection essential. Apply SPF 50+, wear protective clothing and seek shade 10am–4pm.';
    } else if (uv <= 10) {
        level = 'Very High';
        color = '#B91C1C';
        bg = '#FEE2E2';
        advice = 'Extra protection required. Minimise sun exposure, SPF 50+ every 2 hrs, hat and sunglasses mandatory.';
    } else {
        level = 'Extreme';
        color = '#7E22CE';
        bg = '#F3E8FF';
        advice = 'Maximum protection needed. Avoid being outside during midday hours — unprotected skin can burn in minutes.';
    }

    uvNumber.style.color = color;
    if (uvBadge) {
        uvBadge.textContent = level;
        uvBadge.style.background = bg;
        uvBadge.style.color = color;
    }
    if (uvAdvice) uvAdvice.textContent = advice;
}

