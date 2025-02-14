let chart;

async function fetchData() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('YOUR_API_GATEWAY_URL/data', {
            headers: {
                'Authorization': token
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

function updateDashboard(data) {
    if (!data) return;

    document.getElementById('rain-value').textContent = data.current.rain.toFixed(1);
    document.getElementById('solar-value').textContent = data.current.solar.toFixed(0);
    document.getElementById('humidity-value').textContent = data.current.humidity.toFixed(1);

    updateChart(data.history);
}

function updateChart(historyData) {
    if (chart) {
        chart.destroy();
    }

    const ctx = document.getElementById('historyChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: historyData.timestamps,
            datasets: [
                {
                    label: 'Rain',
                    data: historyData.rain,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    tension: 0.4
                },
                {
                    label: 'Solar Intensity',
                    data: historyData.solar,
                    borderColor: 'rgba(255, 206, 86, 1)',
                    tension: 0.4
                },
                {
                    label: 'Soil Humidity',
                    data: historyData.humidity,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function initDashboard() {
    const data = await fetchData();
    updateDashboard(data);
    
    // Update every 5 minutes
    setInterval(async () => {
        const newData = await fetchData();
        updateDashboard(newData);
    }, 5 * 60 * 1000);
}

// Check if user is already logged in
if (localStorage.getItem('token')) {
    document.getElementById('login-section').classList.add('d-none');
    document.getElementById('dashboard').classList.remove('d-none');
    initDashboard();
} 