function unixToRelativeTime(timestamp: number): string {
    // Check if the timestamp is in miliseconds or not
    const isMiliseconds = timestamp > 10000000000;
    // Conver The Timestamp in Seconds
    const timestampInSeconds = isMiliseconds ? Math.floor(timestamp / 1000) : Math.floor(timestamp);

    // Get Current Time in seconds.
    const nowInSeconds = Math.floor(Date.now() / 1000);

    // Get Difference in Seconds 
    const diffInSeconds = nowInSeconds - timestampInSeconds;

    // Check if the timestamp is in future
    if (diffInSeconds < 0) {
        return 'in the future'
    };

    // Define Interval of Time
    const intervals = {
        year: 31536000,
        month: 2592000,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
    };


    // If else logic
    if (diffInSeconds < intervals.minute) {

        return diffInSeconds === 0 ? "just now" : `${diffInSeconds} second${diffInSeconds === 1 ? "" : "s"} ago`;

    } else if (diffInSeconds < intervals.hour) {

        const minutes = Math.floor(diffInSeconds / intervals.minute);
        return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

    } else if (diffInSeconds < intervals.day) {

        const hours = Math.floor(diffInSeconds / intervals.hour);
        return `${hours} hour${hours === 1 ? "" : "s"} ago`;

    } else if (diffInSeconds < intervals.month) {

        const days = Math.floor(diffInSeconds / intervals.day);
        return `${days} day${days === 1 ? "" : "s"} ago`;

    } else if (diffInSeconds < intervals.year) {

        const months = Math.floor(diffInSeconds / intervals.month);
        return `${months} month${months === 1 ? "" : "s"} ago`;

    } else {

        const years = Math.floor(diffInSeconds / intervals.year);
        return `${years} year${years === 1 ? "" : "s"} ago`;

    }



}

export default unixToRelativeTime;