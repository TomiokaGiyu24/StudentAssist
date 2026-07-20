/**
 * MockTimer - Countdown timer component for mock tests
 * Fixed position in top bar, shows hours:minutes:seconds
 */
function MockTimer({ timeRemaining }) {
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const isLowTime = timeRemaining < 600; // Less than 10 minutes
    const isCriticalTime = timeRemaining < 300; // Less than 5 minutes

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded ${isCriticalTime
                ? 'bg-red-100 text-red-700'
                : isLowTime
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-700'
            }`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono font-medium text-sm">
                {formatTime(timeRemaining)}
            </span>
        </div>
    );
}

export default MockTimer;
