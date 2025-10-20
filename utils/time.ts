export const parseAmPmTime = (timeStr: string, referenceDate: Date = new Date()): Date | null => {
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!timeMatch) return null;

    let [_, hours, minutes, ampm] = timeMatch;
    let hours24 = parseInt(hours, 10);

    if (ampm.toLowerCase() === 'pm' && hours24 < 12) {
        hours24 += 12;
    } else if (ampm.toLowerCase() === 'am' && hours24 === 12) {
        hours24 = 0;
    }

    const newDate = new Date(referenceDate);
    newDate.setHours(hours24, parseInt(minutes, 10), 0, 0);
    return newDate;
};

export const parseTaskStartTime = (timeStr: string, referenceDate: Date = new Date()): Date | null => {
    const startTimeStr = timeStr.split('–')[0].trim();
    return parseAmPmTime(startTimeStr, referenceDate);
};

export const formatDateToAmPm = (date: Date): string => {
    if (!date) return '';
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = String(minutes).padStart(2, '0');
    return `${String(hours).padStart(2, '0')}:${minutesStr} ${ampm}`;
};

export const addMinutesToDate = (date: Date, minutes: number): Date => {
    return new Date(date.getTime() + minutes * 60000);
};

export const createTimeRangeString = (startDate: Date, durationMinutes: number): string => {
    const endDate = addMinutesToDate(startDate, durationMinutes);
    return `${formatDateToAmPm(startDate)} – ${formatDateToAmPm(endDate)}`;
};


export const parseTimeRange = (timeStr: string, date: Date): { start: Date, end: Date } | null => {
    const parts = timeStr.split('–').map(p => p.trim());
    const startStr = parts[0];
    const endStr = parts.length > 1 ? parts[1] : startStr;

    const parseSingleTime = (tStr: string): Date | null => {
        return parseAmPmTime(tStr, date);
    };

    const start = parseSingleTime(startStr);
    const end = parseSingleTime(endStr);

    if (!start || !end) return null;

    // Handle overnight ranges like 10:00 PM - 06:00 AM
    if (end < start) {
        end.setDate(end.getDate() + 1);
    }
    
    return { start, end };
};

export const calculateDurationInMinutes = (timeStr: string): number => {
    const range = parseTimeRange(timeStr, new Date());
    if (!range) return 0;
    
    const durationMs = range.end.getTime() - range.start.getTime();
    return Math.round(durationMs / 60000);
};
