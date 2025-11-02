/* --- Palet Warna Tema --- */
const THEME_PRIMARY_COLOR = '#2563EB';
const COLORSCALE_DIVERGING = 'RdYlGn';
const FONT_COLOR_LIGHT_MODE = '#1F2937';
const COLORSCALE_PIE = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];

/* --- Warna untuk Anotasi --- */
const ANNOTATION_GREEN_COLOR = '#10B981';
const ANNOTATION_RED_COLOR = '#EF4444';

// Layout global untuk SEMUA chart
const GLOBAL_LAYOUT_SETTINGS = {
    margin: { t: 30, b: 40, l: 40, r: 20 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { 
        color: FONT_COLOR_LIGHT_MODE,
        family: 'Inter, sans-serif' 
    }
};

// Menunggu seluruh halaman web dimuat
window.onload = function() {
    loadKpiMetrics();
    loadInsightMetrics();
    createLineChart();
    createCategoryBarChart(); 
    createPieChart();
    createProductsBarChart();
};

// 1. Fungsi untuk memuat Insight Boxes
function loadInsightMetrics() {
    Plotly.d3.csv("insight_metrics.csv", function(error, data) {
        if (error) { console.error("Error memuat insight_metrics.csv:", error); return; }
        document.getElementById('insight-sales-value').textContent = data[0].value;
        document.getElementById('insight-sales-narrative').textContent = data[0].narrative;
        document.getElementById('insight-cod-value').textContent = data[1].value;
        document.getElementById('insight-cod-narrative').textContent = data[1].narrative;
        document.getElementById('insight-product-value').textContent = data[2].value;
        document.getElementById('insight-product-narrative').textContent = data[2].narrative;
    });
}

// 2. Fungsi untuk memuat KPI Cards
function loadKpiMetrics() {
    Plotly.d3.csv("kpi_metrics.csv", function(error, data) {
        if (error) { console.error("Error memuat kpi_metrics.csv:", error); return; }
        document.getElementById('kpi-sales-value').textContent = data[0].value;
        document.getElementById('kpi-transactions-value').textContent = data[1].value;
        document.getElementById('kpi-aov-value').textContent = data[2].value;
        document.getElementById('kpi-top-category-value').textContent = data[3].value;
    });
}

// 3. Line Chart dengan Anotasi Berwarna
function createLineChart() {
    Plotly.d3.csv("tren_penjualan_bulanan.csv", function(error, data) {
        if (error) { console.error("Error memuat tren_penjualan_bulanan.csv:", error); return; }
        
        let annotations = [];
        data.forEach(row => {
            if (row.annotation) {
                let annotationColor = FONT_COLOR_LIGHT_MODE; 
                if (row.annotation === 'Puncak Penjualan') {
                    annotationColor = ANNOTATION_GREEN_COLOR;
                } else if (row.annotation === 'Penurunan Terendah') {
                    annotationColor = ANNOTATION_RED_COLOR;
                }
                annotations.push({
                    x: row.month_year, y: +row.total_sales,
                    text: row.annotation, showarrow: true, arrowhead: 7, ax: 0, ay: -40,
                    arrowcolor: annotationColor, 
                    font: { color: annotationColor, size: 13 }
                });
            }
        });
        
        let trace = {
            x: data.map(row => row.month_year),
            y: data.map(row => +row.total_sales),
            type: 'scatter', mode: 'lines+markers',
            marker: { color: THEME_PRIMARY_COLOR, size: 6 },
            line: { color: THEME_PRIMARY_COLOR, width: 3 },
            text: data.map(row => `Perubahan: ${parseFloat(row.pct_change).toFixed(1)}%`),
            hoverinfo: 'x+y+text'
        };
        
        let layout = { ...GLOBAL_LAYOUT_SETTINGS };
        layout.yaxis = { title: 'Total Penjualan (IDR)', gridcolor: '#E5E7EB' };
        layout.xaxis = { 
            title: 'Bulan-Tahun',
            gridcolor: '#E5E7EB',
            tickmode: 'array',
            tickvals: data.map(row => row.month_year),
            ticktext: data.map(row => row.month_year),
            tickangle: 45
        };
        layout.margin = { l: 100, b: 100, t: 30, r: 40 };
        layout.annotations = annotations; 
        
        Plotly.newPlot('lineChart', [trace], layout, {responsive: true});
    });
}

// 4. (PERBAIKAN) Kategori Bar Chart
function createCategoryBarChart() {
    Plotly.d3.csv("top_10_kategori_barchart.csv", function(error, data) {
        if (error) { console.error("Error memuat top_10_kategori_barchart.csv:", error); return; }
        
        // (FIX) Ambil data sales ke variabel
        let salesData = data.map(row => +row.total_sales);
        
        let trace = {
            x: salesData,
            y: data.map(row => row.category),
            type: 'bar',
            orientation: 'h',
            marker: {
                color: salesData,
                colorscale: [
                    [0, '#EF4444'],
                    [0.5, '#F59E0B'],
                    [1, '#00f455ff']
                ],
                cmin: Math.min(...salesData),
                cmax: Math.max(...salesData)
            }
        };
        let layout = { ...GLOBAL_LAYOUT_SETTINGS };
        layout.xaxis = { title: 'Total Penjualan (IDR)', tickformat: '.2s', gridcolor: '#E5E7EB' };
        layout.yaxis = { gridcolor: '#E5E7EB' };
        layout.margin.l = 150;
        Plotly.newPlot('categoryBarChart', [trace], layout, {responsive: true});
    });
}

// 5. Pie Chart
function createPieChart() {
    Plotly.d3.csv("pie_chart_payment.csv", function(error, data) {
        if (error) { console.error("Error memuat pie_chart_payment.csv:", error); return; }
        
        let trace = {
            labels: data.map(row => row.payment_method),
            values: data.map(row => +row.count),
            type: 'pie',
            hole: .4,
            textinfo: 'percent', 
            textposition: 'inside',
            marker: { colors: COLORSCALE_PIE },
            textfont: { color: '#FFFFFF', size: 14 }
        };
        let layout = { ...GLOBAL_LAYOUT_SETTINGS };
        layout.showlegend = true; 
        layout.margin = { t: 10, b: 10, l: 10, r: 10 };
        Plotly.newPlot('pieChart', [trace], layout, {responsive: true});
    });
    // Isi detail "Lainnya"
    Plotly.d3.csv("pie_chart_payment_others.csv", function(error, data) {
        if (error) { console.error("Error memuat pie_chart_payment_others.csv:", error); return; }
        
        let othersList = data.map(row => row.metode_lainnya).join(', ');
        let detailsElement = document.getElementById('pie-chart-details');
        if (othersList) {
            detailsElement.textContent = `*) "Lainnya" termasuk: ${othersList}.`;
        } else {
            detailsElement.textContent = '';
        }
    });
}

// 6. Products Bar Chart
function createProductsBarChart() {
    Plotly.d3.json("top_15_products.json", function(error, data) {
        if (error) { console.error("Error memuat top_15_products.json:", error); return; }

        // (FIX) Ambil data sales ke variabel
        let salesData = data.map(row => +row.total_sales);

        let trace = {
            x: salesData,
            y: data.map(row => row.sku_name_short + "..."), 
            text: data.map(row => `Peringkat: #${row.rank}`),
            hoverinfo: 'x+text',
            type: 'bar',
            orientation: 'h',
            marker: {
                color: salesData,
                colorscale: [
                    [0, '#EF4444'],
                    [0.5, '#F59E0B'],
                    [1, '#00f455ff']
                ],
                cmin: Math.min(...salesData),
                cmax: Math.max(...salesData)
            }
        };
        
        let layout = { ...GLOBAL_LAYOUT_SETTINGS };
        layout.xaxis = { title: 'Total Penjualan (IDR)', tickformat: '.2s', gridcolor: '#E5E7EB' };
        layout.yaxis = { gridcolor: '#E5E7EB' }; 
        layout.margin = { l: 300, b: 50, t: 30, r: 40 };
        Plotly.newPlot('productsBarChart', [trace], layout, {responsive: true});
    });
}