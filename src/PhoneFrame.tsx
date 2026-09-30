export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#f6f7f8',
    }}>
      <div style={{
        width: '390px',
        height: '844px',
        background: '#000',
        borderRadius: '50px',
        boxShadow: '0 0 0 2px #333, 0 0 0 4px #222, 0 30px 80px rgba(0,0,0,0.4)',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute',
          top: '14px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '126px',
          height: '37px',
          background: '#000',
          borderRadius: '20px',
          zIndex: 100,
        }} />
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          borderRadius: '50px',
          overflow: 'hidden',
          background: '#ffffff', 
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}