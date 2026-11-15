const JourneyInfo = ({ icon: Icon, title, value }) => {
    return (
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/70">
            <div className="mb-2 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Icon size={17} />
                <span className="text-sm">{title}</span>
            </div>

            <p className="break-words font-semibold text-slate-900 dark:text-white">
                {value || "Not available"}
            </p>
        </div>
    );
};

export default JourneyInfo;