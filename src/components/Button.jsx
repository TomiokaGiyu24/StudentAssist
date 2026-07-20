import { Link } from 'react-router-dom';

function Button({
    children,
    variant = 'primary',
    fullWidth = false,
    onClick,
    to,
    type = 'button',
    disabled = false
}) {
    const baseClasses = `
    inline-flex items-center justify-center
    px-6 py-3
    text-base font-medium
    rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

    const variants = {
        primary: `
      bg-blue-600 text-white
      hover:bg-blue-700
      focus:ring-blue-500
      active:bg-blue-800
    `,
        secondary: `
      bg-white text-gray-700
      border-2 border-gray-200
      hover:bg-gray-50 hover:border-gray-300
      focus:ring-gray-300
    `,
        success: `
      bg-green-600 text-white
      hover:bg-green-700
      focus:ring-green-500
    `,
        outline: `
      bg-transparent text-blue-600
      border-2 border-blue-600
      hover:bg-blue-50
      focus:ring-blue-500
    `
    };

    const classes = `${baseClasses} ${variants[variant]}`;

    if (to) {
        return (
            <Link to={to} className={classes}>
                {children}
            </Link>
        );
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={classes}
        >
            {children}
        </button>
    );
}

export default Button;
