export const CHANNELS = [
 {id:'Instagram',w:1080,h:1080,ratio:'1:1',desc:'Square social post'},
 {id:'Instagram Story',w:1080,h:1920,ratio:'9:16',desc:'Story / reel cover'},
 {id:'LinkedIn',w:1200,h:628,ratio:'1.91:1',desc:'Professional feed creative'},
 {id:'E-commerce',w:1200,h:1200,ratio:'1:1',desc:'Product listing image'},
 {id:'Website Hero',w:1920,h:1080,ratio:'16:9',desc:'Landing page hero'},
 {id:'Email Banner',w:1200,h:600,ratio:'2:1',desc:'Email campaign banner'},
 {id:'YouTube',w:1920,h:1080,ratio:'16:9',desc:'Video thumbnail'}
] as const;
export type ChannelId = typeof CHANNELS[number]['id'];
export const DIRECTIONS = [
 {id:'Cinematic Luxe',sub:'Deep studio · premium contrast',bg:'#0b1220',accent:'#8b83ff',ink:'#f8fafc',muted:'#b8c5da'},
 {id:'Minimal Editorial',sub:'Bright neutral · clean canvas',bg:'#f3f0e9',accent:'#b18b5e',ink:'#171717',muted:'#615d56'},
 {id:'Future Forward',sub:'Cool tones · tech aesthetic',bg:'#071827',accent:'#67e8f9',ink:'#f0fbff',muted:'#a5d8e7'},
 {id:'Warm Lifestyle',sub:'Warm neutral · approachable',bg:'#29221e',accent:'#d9ad83',ink:'#fff5e9',muted:'#e0c8b1'}
] as const;
export type DirectionId = typeof DIRECTIONS[number]['id'];
export type SavedCampaign = {id:string;name:string;brand:string;createdAt:string;assetUrl:string;creatives:{channel:string,url:string,w:number,h:number}[];direction:string;headline:string};
export function readiness(input:{asset:boolean;name:string;details:string;brand:string;channels:string[];uploaded:number}) {
 const checks=[['Source image uploaded',input.asset],['Product name provided',!!input.name.trim()],['Verified product details added',input.details.trim().length>=35],['Brand identity provided',!!input.brand.trim()],['At least three channels selected',input.channels.length>=3],['Cloudinary creative exports generated',input.uploaded>=input.channels.length && input.channels.length>0]] as const;
 const score=Math.round(checks.filter(x=>x[1]).length/checks.length*100);
 return {score,checks};
}
