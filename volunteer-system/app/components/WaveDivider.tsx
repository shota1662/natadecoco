interface WaveDividerProps {
  fromColor: string
  toColor: string
  flip?: boolean
}

export default function WaveDivider({ fromColor, toColor, flip = false }: WaveDividerProps) {
  return (
    <div className="wave-divider" style={{ backgroundColor: fromColor }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        style={flip ? { transform: 'scaleX(-1)' } : {}}
      >
        <path
          fill={toColor}
          fillOpacity="0.3"
          d="M0,36 C240,10 480,63 720,36 C960,10 1200,63 1440,36 L1440,80 L0,80 Z"
        />
        <path
          fill={toColor}
          fillOpacity="0.6"
          d="M0,46 C200,20 440,70 680,46 C920,22 1160,66 1440,46 L1440,80 L0,80 Z"
        />
        <path
          fill={toColor}
          d="M0,56 C160,36 380,72 600,54 C820,36 1040,70 1260,53 C1360,44 1410,60 1440,56 L1440,80 L0,80 Z"
        />
      </svg>
    </div>
  )
}
