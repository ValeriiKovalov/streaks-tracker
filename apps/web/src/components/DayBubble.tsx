import { Check } from 'lucide-react';
import { forwardRef } from 'react';

interface Props {
  dayName: string;
  state: 'COMPLETED' | 'INCOMPLETE' | 'AT_RISK' | 'SAVED';
  isToday: boolean;
}

const DayBubble = forwardRef<HTMLDivElement, Props>(
  ({ dayName, state, isToday }, ref) => {
    let size = 'w-5 h-5';
    let bg = 'bg-gray-200';
    let icon = null;

    if (state === 'COMPLETED') {
      bg = 'bg-[#E3DBF8]';
      icon = <Check className="h-3 w-3 text-white" strokeWidth={3}/>;
    } else if (state === 'SAVED') {
      bg = 'bg-[#FACC15]';
    } else if (state === 'AT_RISK') {
      bg = 'bg-green-400';
    }

    if (isToday) {
      bg = 'bg-[#7C3AED]';
      size = 'w-3 h-3 mt-1 mb-1';
      icon = null;
    }

    return (
      <div ref={ref} className="flex flex-col items-center gap-1">
        <div className={`${size} rounded-full flex items-center justify-center ${bg}`}>
          {icon}
        </div>
        <div
          className={`text-[10px] tracking-wide uppercase mt-1 ${
            isToday ? 'text-[#7C3AED] font-bold' : 'text-gray-500'
          }`}
        >
          {dayName}
        </div>
      </div>
    );
  },
);

export default DayBubble;
