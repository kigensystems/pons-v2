/** Filled footprints sit beneath the transparent artwork, in its coordinates. */
export default function ImageGrounding() {
  return (
    <svg className="image-grounding" viewBox="0 0 1536 1024" aria-hidden="true">
      <defs>
        <filter id="ground-cast" x="-30%" y="-80%" width="180%" height="280%">
          <feGaussianBlur stdDeviation="28" />
        </filter>
        <filter id="ground-soft-contact" x="-20%" y="-70%" width="150%" height="240%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter id="ground-contact" x="-15%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* The tall case casts farther right; the low peripherals stay close to the desk. */}
      <g fill="#0b0d0c" filter="url(#ground-cast)" opacity=".5">
        <path d="M540 676 L1118 629 L1280 718 L1070 826 L600 746 Z" />
        <path d="M105 824 L808 951 L955 800 L998 851 L842 1005 L119 872 Z" />
        <path d="M994 933 L1105 964 L1217 873 L1260 910 L1136 1010 L1002 974 Z" />
      </g>
      <g fill="#080a09" filter="url(#ground-soft-contact)" opacity=".78">
        <path d="M520 664 L1145 626 L1161 653 L987 771 L528 700 Z" />
        <path d="M96 811 L300 674 L952 780 L960 837 L812 985 L98 856 Z" />
        <path d="M982 923 L1090 835 L1228 864 L1235 892 L1110 995 L982 963 Z" />
      </g>
      {/* Overlap the silhouettes so blur cannot leave a detached outline. */}
      <g fill="#060807" filter="url(#ground-contact)" opacity=".85">
        <path d="M530 675 L1148 636 L1151 649 L992 762 L532 694 Z" />
        <path d="M96 825 L300 680 L952 787 L954 835 L816 975 Q807 982 794 980 L97 851 Z" />
        <path d="M982 934 L1090 842 L1227 868 L1230 890 L1118 985 Q1109 994 1098 990 L983 959 Z" />
      </g>
    </svg>
  )
}
