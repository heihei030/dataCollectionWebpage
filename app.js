let chart;
let currentSensorId = null;
let currentTimeRange = 'day';

async function fetchSensors() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('https://gt6x80p5dg.execute-api.ap-northeast-1.amazonaws.com/sensors', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch sensors');
        
        const sensors = await response.json();
        const sensorSelect = document.getElementById('sensorSelect');
        sensorSelect.innerHTML = sensors.map(sensor => 
            `<option value="${sensor.id}">Sensor ${sensor.id} - ${sensor.location}</option>`
        ).join('');
        
        // Select first sensor by default
        if (sensors.length > 0) {
            currentSensorId = sensors[0].id;
            await fetchData();
        }
    } catch (error) {
        console.error('Error fetching sensors:', error);
    }
}

async function fetchData() {
    if (!currentSensorId) return;
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`https://gt6x80p5dg.execute-api.ap-northeast-1.amazonaws.com/environmental-monitor-data/${currentSensorId}?timeRange=${currentTimeRange}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const data = await response.json();
        updateDashboard(data);
        updateChart(data.history);
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

function updateChart(historyData) {
    const ctx = document.getElementById('historyChart').getContext('2d');
    
    if (chart) {
        chart.destroy();
    }
    
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
                },
                x: {
                    type: 'time',
                    time: {
                        unit: currentTimeRange === 'day' ? 'hour' : 
                              currentTimeRange === 'week' ? 'day' : 
                              currentTimeRange === 'month' ? 'week' : 'month'
                    }
                }
            }
        }
    });
}

function updateDashboard(data) {
    if (!data) return;

    document.getElementById('rain-value').textContent = data.current.rain.toFixed(1);
    document.getElementById('solar-value').textContent = data.current.solar.toFixed(0);
    document.getElementById('humidity-value').textContent = data.current.humidity.toFixed(1);
}

async function initDashboard() {
    await fetchSensors();
    
    // Add event listeners
    document.getElementById('sensorSelect').addEventListener('change', (e) => {
        currentSensorId = e.target.value;
        fetchData();
    });
    
    document.getElementById('timeRange').addEventListener('change', (e) => {
        currentTimeRange = e.target.value;
        fetchData();
    });
    
    // Update every 5 minutes
    setInterval(fetchData, 5 * 60 * 1000);
}

// Check if user is already logged in
if (localStorage.getItem('token')) {
    document.getElementById('login-section').classList.add('d-none');
    document.getElementById('dashboard').classList.remove('d-none');
    initDashboard();
} 
