// components/LoadingOverlay.tsx
import loadingVideo from '../assets/loading.mp4';
import './Loading.css';

const Loading = () => {
  return (
    <div className="loading-overlay">
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="loading-video"
      >
        <source src={loadingVideo} type="video/mp4" />
      </video>
    </div>
  );
};

export default Loading;
