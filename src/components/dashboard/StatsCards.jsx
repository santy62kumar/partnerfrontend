import React from 'react';
import { formatters } from '@utils/formatters';
import { CheckCircle2, Clock, IndianRupee, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';

const StatsCards = ({ stats, totalJobs = 0, completionRate = 0, isInternal = false }) => {
  const averageEarning = stats.completedJobs
    ? stats.totalEarnings / stats.completedJobs
    : 0;

  const backlogJobs = Math.max(totalJobs - stats.completedJobs - stats.inProgressJobs, 0);

  const baseCards = [
    {
      title: 'In Progress',
      value: stats.inProgressJobs,
      subtitle: `${backlogJobs} to start`,
      icon: Clock,
      iconColor: 'text-warning',
    },
    {
      title: 'Completed',
      value: stats.completedJobs,
      subtitle: `${completionRate}% done`,
      icon: CheckCircle2,
      iconColor: 'text-success',
    },
  ];

  // External partners are paid a rate, so they see Earnings and never Incentives.
  // Internal members are salaried, so they see Incentives and never Earnings.
  const financialCards = isInternal
    ? [
        {
          title: 'Incentives',
          value: formatters.currency(stats.totalIncentives),
          subtitle: 'Total pool',
          icon: Trophy,
          iconColor: 'text-primary',
        },
      ]
    : [
        {
          title: 'Earnings',
          value: formatters.currency(stats.totalEarnings),
          subtitle: `${formatters.currency(averageEarning)} avg`,
          icon: IndianRupee,
          iconColor: 'text-foreground',
        },
      ];

  const cards = [...baseCards, ...financialCards];

  // Three cards: two base + one financial. Phones stay 2-up (the header shortens
  // titles at that width) and the odd card fills its row instead of leaving a gap.
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="max-sm:last:col-span-2 hover:shadow-md transition-shadow border-border/80 bg-gradient-to-br from-card to-card/90 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground whitespace-nowrap hidden sm:block">
              {card.title}
            </CardTitle>
            <CardTitle className="text-xs font-semibold text-muted-foreground whitespace-nowrap sm:hidden">
              {card.title.split(' ')[0]}
            </CardTitle>
            <div className="p-1.5 sm:p-2 bg-secondary/50 rounded-lg shrink-0">
              <card.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${card.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold font-heading truncate">{card.value}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-medium truncate">
              {card.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
