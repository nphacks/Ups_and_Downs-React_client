// components/LoadingOverlay.tsx
import './Loading.css';

// Loading.jsx
const Loading = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner">
        <div className="spinner-inner"></div>
        <div className="spinner-outer"></div>
      </div>
    </div>
  );
};

export default Loading;
