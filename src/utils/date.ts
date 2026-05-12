const WEEK_DAYS = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

export interface DayInfo {
    day: number;
    date: string;
    week: string;
    isWeekend: boolean;
    iso: string;
}

// Parse a YYYY-MM-DD string as a local date (avoids UTC timezone shift).
const parseLocal = (s: string): Date => {
    const [y, m, d] = s.split('-').map((n) => parseInt(n, 10));
    return new Date(y, (m || 1) - 1, d || 1);
};

export const generateDays = (startDateStr: string, duration: number): DayInfo[] => {
    const start = parseLocal(startDateStr);
    const days: DayInfo[] = [];
    for (let i = 0; i < Math.max(1, duration); i++) {
        const cur = new Date(start);
        cur.setDate(start.getDate() + i);
        const w = cur.getDay();
        days.push({
            day: i + 1,
            date: `${cur.getMonth() + 1}/${cur.getDate()}`,
            week: WEEK_DAYS[w],
            isWeekend: w === 0 || w === 6,
            iso: cur.toISOString().slice(0, 10),
        });
    }
    return days;
};
