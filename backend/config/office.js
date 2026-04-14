module.exports = {
  OFFICE_LOCATION: {
    latitude: parseFloat(process.env.OFFICE_LATITUDE) || 23.2310465,
    longitude: parseFloat(process.env.OFFICE_LONGITUDE) || 77.442858,
    allowedRadiusMeters: parseInt(process.env.OFFICE_RADIUS_METERS) || 200,
  },
  OFFICE_TIMING: {
    // Mon–Fri: late if checked in after 10:45 AM IST (15-minute grace period)
    weekdayStartHour: 10,
    weekdayStartMinute: 45,
    // Saturday: late if checked in after 11:15 AM IST
    saturdayStartHour: 11,
    saturdayStartMinute: 15,
    reminderHour: 10,
    reminderMinute: 30,
  },
};