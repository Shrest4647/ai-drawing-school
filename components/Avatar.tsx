// Avatar parts components
export const AvatarShape = ({ shape, color }) => {
  const style = { fill: color };
  switch (shape) {
    case 'square':
      return <rect x="10" y="10" width="80" height="80" rx="15" style={style} />;
    case 'star':
      return (
        <path
          d="M50 10 L61.8 35.5 L88.2 38.2 L68.2 56.5 L73.6 82.3 L50 68.5 L26.4 82.3 L31.8 56.5 L11.8 38.2 L38.2 35.5 Z"
          style={style}
        />
      );
    case 'circle':
    default:
      return <circle cx="50" cy="50" r="45" style={style} />;
  }
};

export const AvatarFace = ({ face }) => {
  switch (face) {
    case 'happy':
      return (
        <>
          <circle cx="35" cy="40" r="5" fill="black" />
          <circle cx="65" cy="40" r="5" fill="black" />
          <path d="M30 65 Q50 80 70 65" stroke="black" strokeWidth="5" fill="none" strokeLinecap="round" />
        </>
      );
    case 'excited':
      return (
        <>
          <path d="M25 45 L45 35" stroke="black" strokeWidth="5" strokeLinecap="round" />
          <path d="M55 35 L75 45" stroke="black" strokeWidth="5" strokeLinecap="round" />
          <path d="M30 60 Q50 75 70 60" stroke="black" strokeWidth="5" fill="none" strokeLinecap="round" />
        </>
      );
    case 'smile':
    default:
      return (
        <>
          <circle cx="35" cy="40" r="4" fill="black" />
          <circle cx="65" cy="40" r="4" fill="black" />
          <path d="M35 60 Q50 70 65 60" stroke="black" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      );
  }
};

export const AvatarPreview = ({ avatar }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <AvatarShape shape={avatar.shape} color={avatar.color} />
    <AvatarFace face={avatar.face} />
  </svg>
);
