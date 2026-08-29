'use client';

export function SessionLoader({ message = 'Checking session...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl transition-all duration-300">
      {/* Animated Glow Background Effect */}
      <div className="absolute h-56 w-56 rounded-full bg-primary/10 blur-3xl animate-pulse" />

      <div className="relative flex flex-col items-center gap-5 p-8 text-center">
        {/* Brand Icon with Pulsing Glow & Spinner */}
        <div className="relative flex items-center justify-center">
          {/* Outer Animated Glow Ring */}
          <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-primary/30 via-primary/10 to-primary/30 blur-sm animate-pulse" />

          {/* Main Logo Card */}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl   shadow-lg backdrop-blur-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 192 176"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="size-8 text-foreground"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="
      M148 27
      L144 25
      L139 25
      L137 27
      L137 30
      L139 32
      L143 32
      L146 35
      L146 42
      L138 60
      L126 78
      L116 90
      L91 115
      L69 132
      L49 143
      L46 143
      L43 145
      L36 145
      L33 142
      L33 135
      L39 121
      L41 120
      L48 128
      L52 127
      L53 125
      L52 122
      L45 113
      L39 96
      L39 81
      L41 77
      L41 73
      L49 58
      L58 49
      L68 42
      L68 39
      L66 37
      L63 37
      L54 43
      L44 53
      L36 66
      L36 69
      L34 72
      L34 76
      L32 80
      L32 97
      L34 101
      L34 105
      L36 108
      L36 112
      L28 127
      L28 130
      L26 134
      L26 143
      L31 150
      L35 152
      L44 152
      L48 150
      L51 150
      L65 142
      L70 142
      L73 144
      L77 144
      L82 146
      L97 146
      L112 142
      L121 137
      L131 129
      L138 120
      L143 111
      L147 96
      L147 81
      L145 76
      L145 72
      L143 69
      L143 65
      L149 54
      L149 52
      L151 50
      L151 47
      L153 43
      L153 34
      Z

      M137 76
      L140 81
      L140 96
      L136 109
      L130 119
      L120 129
      L105 137
      L101 137
      L97 139
      L82 139
      L79 138
      L77 135
      L94 122
      L107 110
      L123 93
      L133 79
      Z
    "
              />

              <path
                stroke="currentColor"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
                d="
      M103 25
      L100 29
      L100 32
      L98 36
      L87 41
      L86 45
      L90 48
      L93 48
      L97 50
      L102 61
      L106 62
      L109 58
      L109 55
      L111 51
      L122 46
      L123 42
      L119 39
      L116 39
      L112 37
      L107 26
      Z
    "
              />
            </svg>
            {/* <HugeiconsIcon icon={Message02Icon} size={28} className="text-primary animate-pulse" /> */}
          </div>

          {/* Corner Spinning Indicator */}
        </div>

        {/* Animated Text & Pulsing Dots */}
        <div className="flex flex-col items-center gap-2 font-sora">
          <h3 className="text-xs font-medium tracking-tight text-muted-foreground/90">{message}</h3>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1 rounded-full bg-primary animate-bounce [animation-delay:-0.32s]" />
            <span className="h-1.5 w-1 rounded-full bg-primary animate-bounce [animation-delay:-0.16s]" />
            <span className="h-1.5 w-1 rounded-full bg-primary animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}
