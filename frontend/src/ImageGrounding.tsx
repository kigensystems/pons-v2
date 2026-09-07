/** Shadows share the artwork's coordinates and contain sizing with the television. */
export default function ImageGrounding() {
  return (
    <svg className="image-grounding" viewBox="0 0 1536 1024" aria-hidden="true">
      <defs>
        <filter id="ground-cast" x="-30%" y="-80%" width="180%" height="280%">
          <feGaussianBlur stdDeviation="23" />
        </filter>
        <filter id="ground-soft-contact" x="-20%" y="-70%" width="150%" height="240%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="ground-contact" x="-15%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>

      {/* The baked warm key is above-left; cast shadows soften toward the right. */}
      <g fill="#0b0d0c" filter="url(#ground-cast)" opacity=".46">
        <path d="M962 752 L1142 648 L1370 747 L1082 866 Z" />
        <path d="M105 850 L803 977 L949 837 L1072 915 L888 1042 L188 904 Z" />
        <path d="M983 952 L1106 986 L1226 889 L1322 944 L1182 1040 L1024 990 Z" />
      </g>
      <g fill="#090c0b" filter="url(#ground-soft-contact)" opacity=".64">
        <path d="M967 750 L1146 647 L1173 665 L988 775 Z" />
        <path d="M97 845 L803 976 L950 835 L960 855 L810 997 L103 862 Z" />
        <path d="M983 950 Q1035 972 1107 986 L1228 887 L1240 904 L1115 1003 Q1040 991 985 968 Z" />
      </g>
      <g fill="#080b09" filter="url(#ground-contact)" opacity=".7">
        <path d="M960 749 Q982 760 1001 744 L1000 756 Q980 768 963 757 Z" />
        <path d="M96 845 L794 975 Q809 978 820 967 L949 837 L949 844 L821 976 Q809 986 794 982 L97 851 Z" />
        <path d="M982 954 Q1032 976 1101 987 Q1109 990 1119 981 L1229 889 L1229 896 L1119 990 Q1110 997 1100 993 Q1035 986 983 961 Z" />
      </g>
    </svg>
  )
}
