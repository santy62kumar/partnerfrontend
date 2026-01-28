import React from 'react';
import Card from '@components/common/Card';
import { formatters } from '@utils/formatters';
import { 
  IoCheckmarkCircleOutline, 
  IoTimeOutline, 
  IoCashOutline,
  IoTrophyOutline 
} from 'react-icons/io5';

/**
 * Stats Cards Component
 * Shows 4 key metrics: Completed Jobs, In-Progress Jobs, Earnings, Incentives
 */
const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Completed Jobs',
      value: stats.completedJobs,
      icon: IoCheckmarkCircleOutline,
      color: 'text-[#3D1D1C]',
      bgColor: 'bg-[#3D1D1C]/10',
    },
    {
      title: 'In-Progress Jobs',
      value: stats.inProgressJobs,
      icon: IoTimeOutline,
      color: 'text-[#3D1D1C]',
      bgColor: 'bg-[#3D1D1C]/10',
    },
    {
      title: 'Total Earnings',
      value: formatters.currency(stats.totalEarnings),
      icon: IoCashOutline,
      color: 'text-[#3D1D1C]',
      bgColor: 'bg-[#3D1D1C]/10',
    },
    {
      title: 'Total Incentives',
      value: formatters.currency(stats.totalIncentives),
      icon: IoTrophyOutline,
      color: 'text-[#3D1D1C]',
      bgColor: 'bg-[#3D1D1C]/10'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {cards.map((card, index) => (
              <Card key={index} padding="p-0" className="overflow-hidden">
                  <div className="p-6 h-full flex flex-col justify-between">
                
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${card.bgColor}`}>
                        <card.icon size={24} className={card.color} />
                      </div>
                      <p className="text-sm text-primary-grey-600">
                        {card.title}
                      </p>
                    </div>

                    <h3 className="mt-auto text-center text-2xl font-bold font-montserrat text-primary-grey-900">
                      {card.value}
                    </h3>


                  </div>
              </Card>
          ))}
    </div>
  );
};

export default StatsCards;