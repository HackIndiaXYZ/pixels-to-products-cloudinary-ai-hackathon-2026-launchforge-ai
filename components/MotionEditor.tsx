'use client';

import { useEffect, useRef, useState } from 'react';
import { AudioLines, Clapperboard, Download, Film, LoaderCircle, Music2, Play, Scissors, Upload, Video, WandSparkles } from 'lucide-react';
import { uploadToCloudinary, type CloudAsset } from '../lib/cloudinary';

type Props = { videoAsset: CloudAsset | null; motionUrl: string; videoBusy: boolean; onUploadVideo: (file?: File) => void };
type Ratio = 'portrait' | 'square' | 'landscape';
const SIZES: Record<Ratio, {w:number;h:number;label:string}> = {
  portrait:{w:720,h:1280,label:'9:16 · Reels / Stories'},
  square:{w:1080,h:1080,label:'1:1 · Feed'},
  landscape:{w:1280,h:720,label:'16:9 · YouTube / Web'},
};

export default function MotionEditor({videoAsset,motionUrl,videoBusy,onUploadVideo}:Props){
  const videoRef=useRef<HTMLVideoElement>(null);
  const musicRef=useRef<HTMLInputElement>(null);
  const uploadRef=useRef<HTMLInputElement>(null);
  const [ratio,setRatio]=useState<Ratio>('portrait');
  const [headline,setHeadline]=useState('Make every moment move.');
  const [cta,setCta]=useState('Shop now');
  const [brand,setBrand]=useState('LaunchReady');
  const [accent,setAccent]=useState('#78e8f4');
  const [zoom,setZoom]=useState(1.16);
  const [motion,setMotion]=useState(true);
  const [start,setStart]=useState(0);
  const [end,setEnd]=useState(15);
  const [music,setMusic]=useState<File|null>(null);
  const [musicUrl,setMusicUrl]=useState('');
  const [musicVolume,setMusicVolume]=useState(0.22);
  const [exporting,setExporting]=useState(false);
  const [progress,setProgress]=useState('');
  const [exportUrl,setExportUrl]=useState('');
  const [exportError,setExportError]=useState('');

  useEffect(()=>{ if(videoAsset?.secure_url){setExportUrl('');} },[videoAsset?.secure_url]);
  useEffect(()=>()=>{if(musicUrl)URL.revokeObjectURL(musicUrl);},[musicUrl]);
  useEffect(()=>{const v=videoRef.current;if(!v)return;const onMeta=()=>{setEnd(Math.min(15,Math.floor(v.duration)||15));setStart(0);};v.addEventListener('loadedmetadata',onMeta);return()=>v.removeEventListener('loadedmetadata',onMeta);},[videoAsset?.secure_url]);
  const chooseMusic=(file?:File)=>{if(!file)return;if(!file.type.startsWith('audio/')){setExportError('Choose an audio file such as MP3, WAV or M4A.');return;}if(musicUrl)URL.revokeObjectURL(musicUrl);setMusic(file);setMusicUrl(URL.createObjectURL(file));setExportError('');};

  const exportVideo=async()=>{
    const source=videoRef.current;
    if(!source||!videoAsset){setExportError('Upload a product video first.');return;}
    if(!Number.isFinite(source.duration)||source.duration===0){setExportError('Wait until the video preview has loaded, then export.');return;}
    const duration=Math.max(1,Math.min(end,source.duration)-Math.max(0,start));
    if(duration<=0){setExportError('End time must be after start time.');return;}
    const {w,h}=SIZES[ratio];
    setExporting(true);setExportError('');setExportUrl('');setProgress('Preparing video canvas…');
    let audioContext:AudioContext|undefined;
    let musicElement:HTMLAudioElement|undefined;
    let animation=0;
    try{
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
      const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Your browser could not create the export canvas.');
      const stream=canvas.captureStream(30);
      // Keep the source video's original audio when the browser exposes captureStream.
      const sourceStream=(source as HTMLVideoElement & {captureStream?:()=>MediaStream; mozCaptureStream?:()=>MediaStream}).captureStream?.() || (source as HTMLVideoElement & {mozCaptureStream?:()=>MediaStream}).mozCaptureStream?.();
      sourceStream?.getAudioTracks().forEach(track=>stream.addTrack(track));
      if(musicUrl){
        audioContext=new AudioContext();
        musicElement=new Audio(musicUrl);musicElement.loop=true;musicElement.volume=1;
        const sourceNode=audioContext.createMediaElementSource(musicElement);
        const gain=audioContext.createGain();gain.gain.value=musicVolume;
        sourceNode.connect(gain);
        const audioDestination=audioContext.createMediaStreamDestination();gain.connect(audioDestination);
        audioDestination.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
      }
      const mime=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(x=>MediaRecorder.isTypeSupported(x));
      if(!mime)throw new Error('This browser does not support WebM recording. Please use the latest Chrome or Edge.');
      const chunks:BlobPart[]=[];const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:5_000_000});
      const recorded=new Promise<Blob>((resolve,reject)=>{recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onerror=()=>reject(new Error('The browser could not record this video.'));recorder.onstop=()=>resolve(new Blob(chunks,{type:mime}));});
      source.crossOrigin='anonymous';source.muted=false;source.pause();
      if(Math.abs(source.currentTime-Math.max(0,start))>.05){source.currentTime=Math.max(0,start);await new Promise<void>((resolve,reject)=>{const timer=window.setTimeout(()=>reject(new Error('Video seek timed out.')),8000);const done=()=>{clearTimeout(timer);resolve();};source.addEventListener('seeked',done,{once:true});source.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('Could not read the source video. Check Cloudinary CORS and video delivery.'));},{once:true});});}
      if(audioContext)await audioContext.resume();if(musicElement)await musicElement.play();
      const started=performance.now();const clipMs=duration*1000;let lastPct=-1;
      const draw=()=>{
        const elapsed=Math.min((performance.now()-started)/clipMs,1);const vw=source.videoWidth||w,vh=source.videoHeight||h;
        const scale= Math.max(w/vw,h/vh)*(motion?(1+(zoom-1)*elapsed):zoom);
        const dw=vw*scale,dh=vh*scale;const panX=motion?(w-dw)*elapsed*.22:(w-dw)/2;const panY=(h-dh)/2;
        ctx.fillStyle='#07111d';ctx.fillRect(0,0,w,h);
        try{ctx.drawImage(source,panX,panY,dw,dh);}catch{ /* surfaced after recorder stops if source is not CORS-enabled */ }
        const pad=Math.round(Math.min(w,h)*.075);const landscape=ratio==='landscape';const square=ratio==='square';
        const titleProgress=Math.max(0,Math.min(1,(elapsed-.12)/.32));
        const easeTitle=1-Math.pow(1-titleProgress,3);
        // Give copy its own panel instead of stacking it over the product.
        if(landscape||square){
          const panelW=Math.round(w*(landscape?.43:.46));
          const panel=ctx.createLinearGradient(0,0,panelW,0);panel.addColorStop(0,'rgba(5,12,24,.99)');panel.addColorStop(1,'rgba(5,12,24,.93)');
          ctx.fillStyle=panel;ctx.fillRect(0,0,panelW,h);
          const copyX=pad,copyW=panelW-pad*1.65;
          ctx.textAlign='left';ctx.globalAlpha=Math.min(1,easeTitle+.15);ctx.fillStyle=accent;ctx.font=`700 ${Math.round(Math.min(w*.021,h*.055))}px Arial`;ctx.fillText(brand.slice(0,28).toUpperCase(),copyX,h*.31,copyW);ctx.globalAlpha=1;
          const headSize=Math.round(Math.min(w*.050,h*.115));ctx.fillStyle='#fff';ctx.font=`800 ${headSize}px Arial`;
          ctx.globalAlpha=easeTitle;const headLines=drawWrapped(ctx,headline,copyX,h*.43+(1-easeTitle)*headSize*.55,copyW,Math.round(headSize*1.12),3);ctx.globalAlpha=1;
          const ctaFont=Math.round(Math.min(w*.022,h*.052));ctx.font=`700 ${ctaFont}px Arial`;const ctaW=Math.min(copyW,ctx.measureText(cta.slice(0,32)).width+pad*.7);const ctaH=Math.round(h*.085);const ctaY=Math.min(h*.79,h*.48+headLines*headSize*1.12+pad*.35);
          ctx.globalAlpha=Math.max(0,Math.min(1,(elapsed-.55)/.3));ctx.fillStyle=accent;ctx.beginPath();ctx.roundRect(copyX,ctaY,ctaW,ctaH,ctaH/2);ctx.fill();ctx.fillStyle='#07111c';ctx.fillText(cta.slice(0,32),copyX+pad*.28,ctaY+ctaH*.65,ctaW-pad*.45);ctx.globalAlpha=1;
          ctx.fillStyle='rgba(255,255,255,.48)';ctx.font=`500 ${Math.round(Math.min(w*.009,h*.022))}px Arial`;ctx.fillText('MADE TO MOVE',copyX,h-pad*.45);
        }else{
          const split=Math.round(h*.68);const shade=ctx.createLinearGradient(0,split,0,h);shade.addColorStop(0,'rgba(5,12,24,0)');shade.addColorStop(.12,'rgba(5,12,24,.92)');shade.addColorStop(1,'rgba(5,12,24,1)');ctx.fillStyle=shade;ctx.fillRect(0,split,w,h-split);
          ctx.textAlign='left';ctx.globalAlpha=Math.min(1,easeTitle+.15);ctx.fillStyle=accent;ctx.font=`700 ${Math.round(w*.035)}px Arial`;ctx.fillText(brand.slice(0,28).toUpperCase(),pad,split+pad*.9,w-pad*2);ctx.globalAlpha=1;
          const headSize=Math.round(w*.075);ctx.fillStyle='#fff';ctx.font=`800 ${headSize}px Arial`;ctx.globalAlpha=easeTitle;const headLines=drawWrapped(ctx,headline,pad,split+pad*1.9+(1-easeTitle)*headSize*.55,w-pad*2,headSize*1.08,2);ctx.globalAlpha=1;
          const ctaFont=Math.round(w*.034);ctx.font=`700 ${ctaFont}px Arial`;const ctaW=Math.min(w-pad*2,ctx.measureText(cta.slice(0,28)).width+pad*.8);const ctaH=Math.round(h*.055);const ctaY=Math.min(h-ctaH-pad*.8,split+pad*2.1+headLines*headSize*1.08);
          ctx.globalAlpha=Math.max(0,Math.min(1,(elapsed-.55)/.3));ctx.fillStyle=accent;ctx.beginPath();ctx.roundRect(pad,ctaY,ctaW,ctaH,ctaH/2);ctx.fill();ctx.fillStyle='#07111c';ctx.fillText(cta.slice(0,28),pad+pad*.3,ctaY+ctaH*.66,ctaW-pad*.5);ctx.globalAlpha=1;
        }
        const pct=Math.min(100,Math.round(elapsed*100));if(pct!==lastPct){lastPct=pct;setProgress(`Rendering ${pct}%…`);}
        if(elapsed<1&& !recorder.state.match(/inactive/))animation=requestAnimationFrame(draw);else if(recorder.state!=='inactive')recorder.stop();
      };
      recorder.start(250);source.playbackRate=1;await source.play();
      animation=requestAnimationFrame(draw);
      await new Promise<void>(resolve=>window.setTimeout(()=>{source.pause();if(recorder.state!=='inactive')recorder.stop();resolve();},Math.ceil(duration*1000)+350));
      const blob=await recorded;cancelAnimationFrame(animation);source.pause();if(musicElement)musicElement.pause();stream.getTracks().forEach(t=>t.stop());
      if(blob.size<1000)throw new Error('The export is empty. Check that the video can be played in the preview.');
      setProgress('Uploading finished video to Cloudinary…');
      const uploaded=await uploadToCloudinary(blob,`launchready-motion-${Date.now()}.webm`,'launchready/motion-edits','video');
      const mp4=uploaded.secure_url.includes('/upload/')?uploaded.secure_url.replace('/upload/','/upload/f_mp4,q_auto,vc_auto/') : uploaded.secure_url;
      setExportUrl(mp4);setProgress('Export complete. Your MP4 is ready.');
    }catch(e){setExportError(e instanceof Error?e.message:'Video export failed.');}
    finally{cancelAnimationFrame(animation);if(musicElement)musicElement.pause();if(audioContext)await audioContext.close().catch(()=>{});setExporting(false);setProgress('');}
  };

  return <>
    <div className="motion-editor-layout">
      <section className="panel motion-source-panel">
        <div className="panel-head"><span className="step-number">01</span><div><h3>Video source</h3><p>Upload a short product video or use your existing Cloudinary upload</p></div></div>
        <input ref={uploadRef} type="file" accept="video/mp4,video/quicktime,video/webm" hidden onChange={e=>onUploadVideo(e.target.files?.[0])}/>
        {videoAsset?<video ref={videoRef} className="motion-source-video" src={videoAsset.secure_url} crossOrigin="anonymous" controls playsInline preload="metadata"/>:<div className="motion-empty"><Film size={36}/><b>No video uploaded yet</b><span>Upload an MP4, MOV or WEBM video (up to 50 MB).</span></div>}
        <button className="btn-secondary" onClick={()=>uploadRef.current?.click()} disabled={videoBusy}>{videoBusy?<LoaderCircle className="spin"/>:<Upload size={15}/>} {videoAsset?'Replace video':'Upload product video'}</button>
        {motionUrl&&<div className="url-result"><small>Original optimized Cloudinary delivery</small><a href={motionUrl} target="_blank" rel="noreferrer">Open source MP4</a></div>}
        <div className="motion-tip"><AudioLines size={15}/><span>The original upload stays unchanged. Your edit is rendered as a new video asset.</span></div>
      </section>
      <section className="panel motion-controls-panel">
        <div className="panel-head"><span className="step-number">02</span><div><h3>Creative controls</h3><p>Shape the movement and message of your ad</p></div></div>
        <div className="motion-control-grid">
          <label className="field wide"><span>Export format</span><select value={ratio} onChange={e=>setRatio(e.target.value as Ratio)}>{Object.entries(SIZES).map(([key,v])=><option key={key} value={key}>{v.label} · {v.w}×{v.h}</option>)}</select></label>
          <label className="field"><span>Start (seconds)</span><input type="number" min="0" max={videoRef.current?.duration||300} value={start} onChange={e=>setStart(Math.max(0,Number(e.target.value)||0))}/></label>
          <label className="field"><span>End (seconds)</span><input type="number" min={start+1} max={videoRef.current?.duration||300} value={end} onChange={e=>setEnd(Math.max(start+1,Number(e.target.value)||start+1))}/></label>
          <label className="field wide"><span>Brand / wordmark</span><input value={brand} onChange={e=>setBrand(e.target.value)} maxLength={32}/></label>
          <label className="field wide"><span>Animated headline</span><input value={headline} onChange={e=>setHeadline(e.target.value)} maxLength={80}/></label>
          <label className="field wide"><span>Call to action</span><input value={cta} onChange={e=>setCta(e.target.value)} maxLength={48}/></label>
          <label className="field"><span>Overlay accent</span><input type="color" value={accent} onChange={e=>setAccent(e.target.value)}/></label>
          <label className="field"><span>Zoom strength · {zoom.toFixed(2)}×</span><input type="range" min="1" max="1.5" step="0.01" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/></label>
          <label className="motion-check wide"><input type="checkbox" checked={motion} onChange={e=>setMotion(e.target.checked)}/> Animate pan & zoom (Ken Burns effect)</label>
          <div className="music-control wide"><div><Music2 size={17}/><span><b>{music?.name||'Background music'}</b><small>{music?'Ready to mix into export':'Optional MP3, WAV or M4A'}</small></span></div><input ref={musicRef} type="file" accept="audio/*" hidden onChange={e=>chooseMusic(e.target.files?.[0])}/><button className="btn-secondary" onClick={()=>musicRef.current?.click()}>Choose audio</button></div>
          {music&&<label className="field wide"><span>Music volume · {Math.round(musicVolume*100)}%</span><input type="range" min="0" max="0.8" step="0.01" value={musicVolume} onChange={e=>setMusicVolume(Number(e.target.value))}/></label>}
        </div>
      </section>
    </div>
    <section className="panel motion-preview-panel">
      <div className="panel-head"><span className="step-number">03</span><div><h3>Preview & export</h3><p>Review the source and export a new Cloudinary-hosted campaign video</p></div></div>
      <div className="motion-export-row">
        <div className={`motion-preview-frame ${ratio}`}>
          {videoAsset?<video key={videoAsset.secure_url} src={videoAsset.secure_url} controls playsInline crossOrigin="anonymous"/>:<div><Video size={28}/><span>Upload a video to preview your campaign</span></div>}
          <div className="motion-preview-overlay"><small>{brand.toUpperCase()}</small><h2>{headline}</h2><b>{cta}</b></div>
        </div>
        <div className="motion-export-info"><div className="export-spec"><span>OUTPUT PROFILE</span><b>{SIZES[ratio].label}</b><small>{SIZES[ratio].w} × {SIZES[ratio].h} · 30 FPS target</small></div><div className="export-spec"><span>EDITING LAYERS</span><b>{motion?'Pan & zoom':'Static framing'} · Typography · CTA</b><small>{music?'Background music included':'No background music selected'}</small></div><button className="btn-primary motion-export-button" onClick={()=>void exportVideo()} disabled={!videoAsset||exporting}>{exporting?<LoaderCircle className="spin"/>:<WandSparkles size={16}/>} {exporting?'Rendering your ad…':'Render & export video'}</button>{progress&&<p className="motion-progress">{progress}</p>}{exportError&&<p className="motion-error">{exportError}</p>}{exportUrl&&<div className="motion-download"><b><Download size={15}/> MP4 export ready</b><a href={exportUrl} target="_blank" rel="noreferrer">Open finished MP4</a><a href={exportUrl.replace('/upload/','/upload/fl_attachment/')} download className="btn-secondary">Download campaign video <Download size={14}/></a></div>}</div>
      </div>
      <p className="fineprint">The editor renders a new video in your browser, preserving source audio where supported and mixing optional music. The WebM render is uploaded as a separate Cloudinary asset and delivered as optimized MP4. Your original upload remains unchanged. Use the latest Chrome or Edge for best compatibility.</p>
    </section>
  </>;
}
function drawWrapped(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,maxWidth:number,lineHeight:number,maxLines=3){const words=text.split(/\s+/);let line='';let yy=y;let lines=0;for(const word of words){const test=line?`${line} ${word}`:word;if(ctx.measureText(test).width>maxWidth&&line){if(lines>=maxLines-1){line=(line+' '+word).trim();continue;}ctx.fillText(line,x,yy,maxWidth);lines++;line=word;yy+=lineHeight;}else line=test;}if(line){ctx.fillText(line,x,yy,maxWidth);lines++;}return lines;}
