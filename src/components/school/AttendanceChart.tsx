import React from 'react';
import type { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';

interface AttendanceDataPoint {
  date: string;
  Present: number;
  Absent: number;
  Late: number;
}

interface AttendanceChartProps {
  data: AttendanceDataPoint[];
}

export const AttendanceChart: React.FC<AttendanceChartProps> = ({ data }) => {
  const categories = data.length > 0 ? data.map((d) => d.date) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const presentSeries = data.length > 0 ? data.map((d) => d.Present) : [18, 19, 17, 20, 19];
  const lateSeries = data.length > 0 ? data.map((d) => d.Late) : [1, 1, 2, 0, 1];
  const absentSeries = data.length > 0 ? data.map((d) => d.Absent) : [1, 0, 1, 0, 0];

  const series = [
    { name: 'Present', data: presentSeries },
    { name: 'Late', data: lateSeries },
    { name: 'Absent', data: absentSeries },
  ];

  const options: ApexOptions = {
    colors: ['#12b76a', '#f79009', '#f04438'], // success-500, warning-500, error-500
    chart: {
      fontFamily: 'Outfit, sans-serif',
      type: 'bar',
      stacked: true,
      height: 310,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '40%',
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: false },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: '#667085', fontSize: '12px' },
      },
    },
    yaxis: {
      labels: {
        style: { colors: '#667085', fontSize: '12px' },
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontFamily: 'Outfit, sans-serif',
      markers: { size: 6, strokeWidth: 0 },
    },
    grid: {
      borderColor: '#f2f4f7',
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      theme: 'dark',
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Attendance Trends
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Daily student presence over the last recorded sessions
          </p>
        </div>
      </div>
      <div className="custom-scrollbar overflow-x-auto">
        <div className="min-w-[420px]">
          <Chart options={options} series={series} type="bar" height={310} />
        </div>
      </div>
    </div>
  );
};

export default AttendanceChart;
