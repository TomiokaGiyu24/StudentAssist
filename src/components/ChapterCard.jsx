import { useNavigate } from 'react-router-dom';

function ChapterCard({ chapter, subjectId }) {
    const navigate = useNavigate();

    const difficultyClasses = {
        Easy: 'bg-green-100 text-green-700',
        Medium: 'bg-yellow-100 text-yellow-700',
        Hard: 'bg-red-100 text-red-700'
    };

    return (
        <div
            onClick={() => navigate(`/subjects/${subjectId}/chapters/${chapter.id}`)}
            className="
        bg-white rounded-lg p-4
        border border-gray-200
        cursor-pointer
        transition-all duration-200
        hover:border-blue-300 hover:bg-blue-50/30
        hover:shadow-sm
        active:scale-[0.99]
      "
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-gray-900 mb-1">
                        {chapter.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {chapter.weightage}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`
            px-3 py-1 rounded-full
            text-xs font-medium
            ${difficultyClasses[chapter.difficulty]}
          `}>
                        {chapter.difficulty}
                    </span>

                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </div>
    );
}

export default ChapterCard;
