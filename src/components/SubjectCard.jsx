import { useNavigate } from 'react-router-dom';

function SubjectCard({ subject }) {
    const navigate = useNavigate();

    const colorClasses = {
        blue: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50',
        green: 'border-green-200 hover:border-green-400 hover:bg-green-50',
        purple: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50',
        emerald: 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50'
    };

    const iconBgClasses = {
        blue: 'bg-blue-100',
        green: 'bg-green-100',
        purple: 'bg-purple-100',
        emerald: 'bg-emerald-100'
    };

    return (
        <div
            onClick={() => navigate(`/subjects/${subject.id}/chapters`)}
            className={`
        bg-white rounded-xl p-6
        border-2 ${colorClasses[subject.color] || colorClasses.blue}
        cursor-pointer
        transition-all duration-200
        hover:shadow-md
        active:scale-[0.98]
      `}
        >
            <div className="flex items-start gap-4">
                <div className={`
          w-14 h-14 rounded-xl
          flex items-center justify-center
          text-2xl
          ${iconBgClasses[subject.color] || iconBgClasses.blue}
        `}>
                    {subject.icon}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {subject.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {subject.tagline}
                    </p>
                </div>

                <div className="text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </div>
    );
}

export default SubjectCard;
