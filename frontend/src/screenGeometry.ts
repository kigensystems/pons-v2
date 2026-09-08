// The Macintosh artwork's screen, in its own 1536 × 1024 coordinates, shared by every page that lights it.
// The inside of the curved glass, and the transform that lays a 640 × 480 picture onto it.
export const GLASS_PATH = 'M 596 138 C 691 137 824 146 912 154 Q 929 156 929 178 L 920 428 Q 919 445 901 446 C 801 446 655 434 588 423 Q 570 420 567 399 C 557 311 562 213 574 161 Q 578 138 596 138 Z'
export const PICTURE_TRANSFORM = 'matrix(.585 .031 -.025 .638 570 129)'
// Explore's full glass-to-casing boundary, traced from macintosh-render.png. The bottom bows down
// toward the right; extending a rounded rectangle here paints over the lower-left bezel.
export const BEZEL_PATH = 'M 590 131 C 682 129 815 138 910 149 C 929 151 937 159 937 176 C 936 256 932 348 925 429 Q 924 450 903 452 C 811 457 653 440 586 421 Q 566 417 562 400 C 552 323 554 231 566 164 Q 570 132 590 131 Z'
export const BEZEL_PICTURE_TRANSFORM = 'matrix(.575 .031 -.023 .612 570 130)'
// The screen must be the brightest thing in the room: lift the picture and clip its top fifth to white before the halation blooms.
export const CRT_EXPOSURE = '0 .24 .48 .66 .8 .9 .96 .99 1 1 1'
