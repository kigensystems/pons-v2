// The Macintosh artwork's screen, in its own 1536 × 1024 coordinates, shared by every page that lights it.
// The inside of the curved glass, and the transform that lays a 640 × 480 picture onto it.
export const GLASS_PATH = 'M 596 138 C 691 137 824 146 912 154 Q 929 156 929 178 L 920 428 Q 919 445 901 446 C 801 446 655 434 588 423 Q 570 420 567 399 C 557 311 562 213 574 161 Q 578 138 596 138 Z'
export const PICTURE_TRANSFORM = 'matrix(.585 .031 -.025 .638 570 129)'
// The glass right up to the bezel's lip on the right and below, for a page whose screen is a printed readout rather than footage.
export const BEZEL_PATH = 'M 596 136 C 691 135 824 144 912 152 Q 949 154 949 178 L 941 436 Q 940 456 920 456 C 821 458 660 452 592 448 Q 574 446 570 424 C 557 311 562 213 574 159 Q 578 136 596 136 Z'
export const BEZEL_PICTURE_TRANSFORM = 'matrix(.6 .031 -.025 .66 570 128)'
// The screen must be the brightest thing in the room: lift the picture and clip its top fifth to white before the halation blooms.
export const CRT_EXPOSURE = '0 .24 .48 .66 .8 .9 .96 .99 1 1 1'
