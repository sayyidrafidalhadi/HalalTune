import { usePlayer } from '../store/PlayerContext';

export default function Toast() {
  const { toastMsg, toastVisible } = usePlayer();

  return (
    <div className={`dl-toast${toastVisible ? ' dl-toast-show' : ''}`} style={{ display: toastMsg ? 'flex' : 'none' }}>
      {toastMsg}
    </div>
  );
}
