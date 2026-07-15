"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { formatCurrency } from "@/lib/data-store";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartCardProps {
  title: string;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }[];
  };
  emptyMessage?: string;
}

export default function BarChartCard({ title, data, emptyMessage }: BarChartCardProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'hsl(var(--foreground))',
        },
      },
      title: {
        display: false,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y, 'INR');
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'hsl(var(--muted-foreground))',
        },
        grid: {
          color: 'hsl(var(--border))',
        },
      },
      y: {
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          callback: function(value: any) {
            return formatCurrency(value, 'INR');
          }
        },
        grid: {
          color: 'hsl(var(--border))',
        },
      },
    },
  };

  const hasData = data.datasets.some(dataset => dataset.data.some(val => val > 0));

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-[250px] w-full">
            <Bar data={data} options={options} />
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
