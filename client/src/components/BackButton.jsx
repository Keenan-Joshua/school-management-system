import { useNavigate } from 'react-router-dom';

function BackButton() {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
            ← Back to Dashboard
        </button>
    );
}

export default BackButton;