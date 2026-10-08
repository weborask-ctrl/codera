// Per-film delivery metadata. Both variants preserve the supplied camera journey.
export const BASELINE=Object.freeze({id:'avc-balanced',media:'/media/journey-balanced-4b593baa7f9b.mp4',fallbackMedia:'/media/journey-balanced-progressive.mp4',codec:'avc1.64002a',width:1920,height:1080,fps:60,frames:660,durationSeconds:11,bytes:11212401});
export const DETAIL=Object.freeze({id:'hevc-detail',media:'/media/journey-detail-418d38ed04f5.mp4',fallbackMedia:'/media/journey-detail-418d38ed04f5.mp4',codec:'hvc1.1.6.L123.90',width:1920,height:1080,fps:60,frames:660,durationSeconds:11,bytes:7630378});
// Capability flags describe playback support, not repeated random-seek cadence.
// HEVC regressed fully buffered scrolling in Chrome under CPU load despite all
// three flags being true. Keep it as a comparison asset, not an automatic choice.
// Reuse the existing 1080p60 AVC pixels; do not lower resolution to hide the issue.
export function selectMotionProfile(){return BASELINE;}
