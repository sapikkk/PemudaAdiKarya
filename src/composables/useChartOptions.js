import { ref } from 'vue';

/**
 * @description Composable untuk menyediakan konfigurasi dan data helper
 * untuk komponen Chart dari PrimeVue.
 */
export function useChartOptions() {

    /**
     * Opsi konfigurasi dasar untuk chart.
     * Dibuat reaktif agar bisa diubah jika diperlukan.
     */
    const chartOptions = ref({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#495057', // Warna teks untuk legenda
                    font: {
                        weight: 'normal'
                    }
                }
            }
        },
    });

    /**
     * Helper untuk memformat data agar sesuai dengan yang dibutuhkan Pie Chart.
     * Ini memisahkan logika styling (warna) dari logika data di komponen.
     * @param {object} data - Objek data mentah dengan format { labels: [], datasets: [{ data: [] }] }
     * @returns {object} - Objek data yang sudah diformat dengan warna.
     */
    const pieChartData = (data) => {
        if (!data || !data.labels || !data.datasets) {
            return { labels: [], datasets: [] };
        }

        return {
            labels: data.labels,
            datasets: data.datasets.map(dataset => ({
                ...dataset,
                backgroundColor: [
                    "#42A5F5",
                    "#66BB6A",
                    "#FFA726",
                    "#EF5350",
                    "#AB47BC",
                    "#78909C",
                    "#26C6DA",
                    "#FFCA28"
                ],
                hoverBackgroundColor: [
                    "#64B5F6",
                    "#81C784",
                    "#FFB74D",
                    "#FF8A65",
                    "#BA68C8",
                    "#90A4AE",
                    "#4DD0E1",
                    "#FFD54F"
                ]
            }))
        };
    };

    return { chartOptions, pieChartData };
}
