import { useParams } from 'react-router-dom';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import DayBubble from '../components/DayBubble';

interface DayResult {
  date: string;
  activities: number;
  state: 'COMPLETED' | 'INCOMPLETE' | 'AT_RISK' | 'SAVED';
}

interface StreakResponse {
  activitiesToday: number;
  total: number;
  days: DayResult[];
}

export default function Streak() {
  const { caseId } = useParams();
  const [data, setData] = useState<StreakResponse | null>(null);

  useEffect(() => {
    axios
      .get<StreakResponse>(`http://localhost:3000/streaks/${caseId}`)
      .then(res => setData(res.data))
      .catch(err => console.error('Failed to fetch streak data', err));
  }, [caseId]);

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const today = dayjs().format('YYYY-MM-DD');

  const reversedDays = [...(data?.days || [])].reverse();
  const todayPos = reversedDays.findIndex(day => day.date === today);

  const dayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const underlineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (
        underlineRef.current &&
        todayPos !== -1 &&
        dayRefs.current[todayPos]
      ) {
        const dayEl = dayRefs.current[todayPos];
        const container = underlineRef.current.parentElement;
        const paddingLeft = parseFloat(getComputedStyle(container!).paddingLeft || '0');

        const extraWidth = 16;
        underlineRef.current.style.left = `${dayEl.offsetLeft + paddingLeft - extraWidth / 2}px`;
        underlineRef.current.style.width = `${dayEl.offsetWidth + extraWidth}px`;
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [todayPos, data]);

  if (!data) return <div className="text-center pt-20">Loading...</div>;

  return (
    <div className="relative min-h-screen bg-no-repeat bg-bottom bg-cover flex flex-col overflow-hidden"
      style={{ backgroundImage: 'url("/BG.svg")' }}
    >
      <header className="text-center pt-4 z-10">
        <h1 className="text-[#7C3AED] text-2xl font-[700] font-gilroy tracking-tight">ahead</h1>
      </header>

      <main className="flex flex-col justify-center items-center flex-1">
        <h2 className="text-5xl font-medium text-black text-center mb-9 z-10">
          Your streak is <span>{data.total} days</span>
        </h2>

        <div className="relative rounded-2xl bg-white py-6 px-8 border-2 border-[#E9E9E9]">
          <div className="absolute bottom-4 left-6 right-6 h-px bg-gray-200"/>

          <div
            ref={underlineRef}
            className="absolute bottom-4 h-[1px] bg-[#7C3AED] transition-all duration-300"
          />

          <div className="flex gap-6 relative z-10">
            {reversedDays.map((day, idx) => (
              <div
                key={day.date}
                ref={(el) => {
                  dayRefs.current[idx] = el;
                }}
              >
                <DayBubble
                  dayName={weekDays[dayjs(day.date).day()]}
                  state={day.state}
                  isToday={day.date === today}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
