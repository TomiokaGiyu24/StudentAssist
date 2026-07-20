import { Link } from 'react-router-dom';

function Header({ title, showBack = false, backTo }) {
    return (
        <header className="sticky top-0 z-50 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200">
            <div className="container-app">
                <div className="flex items-center h-14 gap-4">
                    {showBack && (
                        <Link
                            to={backTo || -1}
                            onClick={(e) => {
                                if (!backTo) {
                                    e.preventDefault();
                                    window.history.back();
                                }
                            }}
                            className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                    )}

                    <h1 className="text-base font-medium text-stone-900 truncate">
                        {title}
                    </h1>
                </div>
            </div>
        </header>
    );
}

export default Header;
