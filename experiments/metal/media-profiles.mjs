// Per-film delivery metadata. Both variants preserve the supplied camera journey.
export const BASELINE=Object.freeze({id:'avc-balanced',media:'/media/journey-balanced-4b593baa7f9b.mp4',fallbackMedia:'/media/journey-balanced-progressive.mp4',codec:'avc1.64002a',width:1920,height:1080,fps:60,frames:660,durationSeconds:11,bytes:11212401});
export const DETAIL=Object.freeze({id:'hevc-detail',media:'/media/journey-detail-418d38ed04f5.mp4',fallbackMedia:'/media/journey-detail-418d38ed04f5.mp4',codec:'hvc1.1.6.L123.90',width:1920,height:1080,fps:60,frames:660,durationSeconds:11,bytes:7630378});
export async function selectMotionProfile({desktop=false,mseSupported,decodingInfo,timeoutMs=250}={}){
  if(!desktop||typeof decodingInfo!=='function'||typeof mseSupported!=='function')return BASELINE;
  let timer;
  try{
    const contentType=`video/mp4; codecs="${DETAIL.codec}"`;
    if(!mseSupported(contentType))return BASELINE;
    const capability=await Promise.race([decodingInfo({type:'media-source',video:{contentType,width:DETAIL.width,height:DETAIL.height,bitrate:Math.ceil(DETAIL.bytes*8/DETAIL.durationSeconds),framerate:DETAIL.fps}}),new Promise(resolve=>{timer=setTimeout(()=>resolve(null),timeoutMs)})]);
    return capability?.supported&&capability?.smooth&&capability?.powerEfficient?DETAIL:BASELINE;
  }catch{return BASELINE;}finally{clearTimeout(timer);}
}
