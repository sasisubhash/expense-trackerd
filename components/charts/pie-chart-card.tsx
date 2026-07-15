"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartCardProps {
  title: string;
  data: number[];
  labels: string[];
  colors: string[];
  emptyMessage?: string;
}

export default function PieChartCard({ title, data, labels, colors, emptyMessage }: PieChartCardProps) {
  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: colors,
        borderColor: colors.map(color => color + 'CC'), // Slightly transparent border
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'hsl(var(--foreground))', // Use Tailwind foreground color
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed);
            }
            return label;
          }
        }
      }
    },
  };

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="h-[250px] w-full">
            <Pie data={chartData} options={options} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            {emptyMessage || "No data to display."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
