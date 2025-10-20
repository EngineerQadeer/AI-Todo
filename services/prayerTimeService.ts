import type { PrayerTimes, PrayerSettings } from '../types';

function convertToAmPm(time: string): string {
    if (!time || !time.includes(':')) return ''; // Guard against invalid time format
    const [hours, minutes] = time.split(':');
    const hoursNum = parseInt(hours, 10);
    const ampm = hoursNum >= 12 ? 'PM' : 'AM';
    let hours12 = hoursNum % 12;
    if (hours12 === 0) {
        hours12 = 12; // 12 AM or 12 PM
    }
    return `${String(hours12).padStart(2, '0')}:${minutes} ${ampm}`;
}

const juristicMap: { [key in PrayerSettings['juristic']]: number } = {
    'Standard': 0,
    'Hanafi': 1,
};

const highLatMap: { [key in PrayerSettings['highLatitudeMethod']]: number } = {
    'AngleBased': 3,
    'MiddleOfTheNight': 1,
    'OneSeventh': 2,
};

export async function fetchPrayerTimes(settings: PrayerSettings): Promise<PrayerTimes | null> {
    const { city, country, juristic, highLatitudeMethod } = settings;
    
    const school = juristicMap[juristic];
    const latitudeAdjustmentMethod = highLatMap[highLatitudeMethod];
    
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const day = today.getDate();
    
    // Switched to calendarByCity endpoint to resolve potential CORS or network issues with timingsByCity.
    const url = `https://api.aladhan.com/v1/calendarByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2&school=${school}&latitudeAdjustmentMethod=${latitudeAdjustmentMethod}&month=${month}&year=${year}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        const data = await response.json();

        // Find today's timings from the monthly calendar data.
        if (data.code === 200 && data.data && data.data.length >= day) {
            // The API returns an array of days for the month. Find today's entry.
            // The day is 1-based, array is 0-based.
            const todaysData = data.data[day - 1]; 
            if (todaysData && todaysData.timings) {
                const { Fajr, Dhuhr, Asr, Maghrib, Isha } = todaysData.timings;
                
                // The times from this endpoint include a timezone string, e.g., "04:52 (BST)". We need to strip that.
                const stripTimezone = (time: string) => time.split(' ')[0];

                return {
                    Fajr: convertToAmPm(stripTimezone(Fajr)),
                    Dhuhr: convertToAmPm(stripTimezone(Dhuhr)),
                    Asr: convertToAmPm(stripTimezone(Asr)),
                    Maghrib: convertToAmPm(stripTimezone(Maghrib)),
                    Isha: convertToAmPm(stripTimezone(Isha)),
                };
            } else {
                 console.error("Today's prayer times not found in calendar response for day:", day);
                 return null;
            }
        } else {
            console.error("API returned an error or invalid data structure:", data.status);
            return null;
        }
    } catch (error) {
        console.error("Error fetching prayer times:", error);
        return null;
    }
}
