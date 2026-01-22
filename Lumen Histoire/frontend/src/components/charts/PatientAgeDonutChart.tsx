// src/components/charts/PatientAgeDonutChart.tsx

import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';

interface RingDataItem {
  label: string;
  color: string;
  value: number;
  percent: number;
  age_group: 'Child' | 'Adult' | 'Elderly';
  data: { name: string; value: number }[];
}

interface PatientAgeDonutChartProps {
  ringData: RingDataItem[];
}

const AGE_COLORS_FADED = {
  Child: '#8b5cf640',
  Adult: '#a3e63540',
  Elderly: '#facc1540',
};

const PatientAgeDonutChart: React.FC<PatientAgeDonutChartProps> = ({ ringData }) => {
  const total = ringData.reduce((sum, r) => sum + r.value, 0);

  return (
    <div>
      <div className="text-lg font-bold mb-2">
        Phân loại độ tuổi khách hàng (tháng này)
      </div>
      <div className="text-sm mb-4">Tổng: {total} khách hàng</div>

      <div className="flex justify-center">
        <PieChart width={200} height={200}>
          {ringData.map((ring, i) => (
            <Pie
              key={ring.label}
              data={ring.data}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={40 + i * 12}
              outerRadius={50 + i * 12}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              <Cell fill={ring.color} />
              <Cell fill={AGE_COLORS_FADED[ring.age_group]} />
            </Pie>
          ))}
        </PieChart>
      </div>

      <ul className="mt-6 space-y-4 text-sm">
        {ringData.map((item) => (
          <li key={item.label} className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-gray-700">{item.label}</span>
            </div>
            <span className="font-medium text-gray-800">
              {item.value} ({item.percent}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PatientAgeDonutChart;
