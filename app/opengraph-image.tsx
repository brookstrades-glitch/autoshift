import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '80px',
        background: 'linear-gradient(135deg, #0d1526 0%, #162033 100%)',
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', top: '48px', left: '80px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: '900' }}>A</div>
        <span style={{ color: 'white', fontSize: '22px', fontWeight: '700' }}>AutoShift Houston</span>
      </div>
      <div style={{ color: '#2563eb', fontSize: '15px', fontWeight: '600', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '20px', display: 'flex' }}>
        Houston, TX
      </div>
      <div style={{ color: 'white', fontSize: '88px', fontWeight: '900', lineHeight: '0.88', marginBottom: '28px', display: 'flex', flexDirection: 'column' }}>
        <span>Car Note</span>
        <span>Takeovers.</span>
      </div>
      <div style={{ color: '#94a3b8', fontSize: '26px', display: 'flex' }}>
        Take over someone&apos;s car payments — verified deals, no financing required.
      </div>
    </div>,
    { ...size }
  );
}
