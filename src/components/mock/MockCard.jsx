/**
 * MockCard - Academic-styled card for mock test type selection
 * Clean, minimal design - no gradients, no emojis, exam-like feel
 */
function MockCard({ title, description, features, buttonText, onClick, variant = 'primary' }) {
    const variantStyles = {
        primary: {
            border: 'border-gray-300',
            accent: 'text-gray-900',
            button: 'bg-gray-900 text-white hover:bg-gray-800'
        },
        secondary: {
            border: 'border-gray-200',
            accent: 'text-gray-800',
            button: 'bg-gray-800 text-white hover:bg-gray-700'
        },
        tertiary: {
            border: 'border-gray-200',
            accent: 'text-gray-700',
            button: 'bg-gray-700 text-white hover:bg-gray-600'
        }
    };

    const style = variantStyles[variant] || variantStyles.primary;

    return (
        <div className={`bg-white border ${style.border} rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}>
            {/* Title */}
            <h3 className={`text-lg font-semibold ${style.accent} mb-3`}>
                {title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {description}
            </p>

            {/* Features List */}
            {features && features.length > 0 && (
                <ul className="space-y-2 mb-6">
                    {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-gray-400 mt-0.5">•</span>
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            )}

            {/* Action Button */}
            <button
                onClick={onClick}
                className={`w-full py-2.5 px-4 rounded font-medium text-sm transition-colors ${style.button}`}
            >
                {buttonText}
            </button>
        </div>
    );
}

export default MockCard;
