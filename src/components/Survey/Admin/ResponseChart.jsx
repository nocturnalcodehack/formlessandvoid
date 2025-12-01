import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ResponseChart = ({ question, analytics }) => {
  // Debug logging
  console.log('ResponseChart - question:', question);
  console.log('ResponseChart - analytics:', analytics);
  
  if (!analytics || !analytics.distribution) {
    return <p className="text-muted">No data available for this question.</p>;
  }

  const { questionType } = question;
  const { distribution } = analytics;

  console.log('ResponseChart - questionType:', questionType);
  console.log('ResponseChart - distribution:', distribution);

  // Color palettes
  const pieColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
  const barColors = ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'];

  // Prepare data based on question type
  const prepareChartData = () => {
    const rawLabels = Object.keys(distribution);
    const data = Object.values(distribution);

    // For likert_5, map values to display text using question.options when available
    let labels = rawLabels;
    if (questionType === 'likert_5') {
      const options = question.options || [];
      const valueToText = {};
      options.forEach(opt => {
        if (typeof opt === 'object' && opt !== null) {
          const val = opt.value != null ? String(opt.value) : (opt.text != null ? String(opt.text) : String(opt));
          const txt = opt.text != null ? String(opt.text) : (opt.value != null ? String(opt.value) : String(opt));
          valueToText[val] = txt;
        } else {
          const s = String(opt);
          valueToText[s] = s;
        }
      });
      labels = rawLabels.map(v => valueToText[String(v)] || String(v));
    }

    if (questionType === 'yes_no') {
      return {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: pieColors.slice(0, labels.length),
          borderWidth: 2,
          borderColor: '#fff',
        }],
      };
    }

    if (questionType === 'likert_5' || questionType === 'multiple_choice' || questionType === 'multiple_choice_other' || questionType === 'multiselect') {
      return {
        labels: labels,
        datasets: [{
          label: questionType === 'multiselect' ? 'Selections' : 'Responses',
          data: data,
          backgroundColor: barColors.slice(0, labels.length),
          borderColor: barColors.slice(0, labels.length).map(color => color),
          borderWidth: 1,
        }],
      };
    }

    return null;
  };

  const chartData = prepareChartData();

  if (!chartData) {
    return <p className="text-muted">Chart not available for this question type.</p>;
  }

  // Chart options
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'white'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed.y * 100) / total).toFixed(1);
            const labelSuffix = questionType === 'multiselect' ? 'selections' : 'responses';
            return `${context.label}: ${context.parsed.y} ${labelSuffix} (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'white'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: 'white'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
    },
  };

  return (
    <div className="chart-container">
      <div style={{ height: '300px', position: 'relative' }}>
        {questionType === 'yes_no' ? (
          <Pie data={chartData} options={pieOptions} />
        ) : (
          <Bar data={chartData} options={barOptions} />
        )}
      </div>
      
      {/* Summary statistics */}
      <div className="mt-3">
        <div className="row">
          <div className="col-md-6">
            <small className="text-muted">
              <strong>Total Responses:</strong> {analytics.totalResponses}
            </small>
          </div>
          <div className="col-md-6">
            <small className="text-muted">
              <strong>Response Rate:</strong> {
                analytics.totalResponses > 0 
                  ? ((analytics.totalResponses / (analytics.totalPossibleResponses || analytics.totalResponses)) * 100).toFixed(1) + '%'
                  : '0%'
              }
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseChart;
