const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
async function run(kind,native,initialDestination='속초',search='',tossRouteShare){
 let handler,opened,payload,copied;
 const status={textContent:'',classList:{toggle(){},contains(){return false},add(){},remove(){}},style:{setProperty(){},removeProperty(){}}};
 const navigator={clipboard:{writeText:async url=>{copied=url}}};
 if(native)navigator.share=async value=>{payload=value;await native()};
 vm.runInNewContext(fs.readFileSync('route-share.js','utf8'),{
 document:{getElementById:()=>status,querySelectorAll:()=>[{dataset:{share:kind},parentElement:{appendChild:node=>{assert.equal(node,status)}},closest:selector=>selector==='.route-share-buttons'?{appendChild:node=>assert.equal(node,status)}:null,addEventListener:(_,fn)=>handler=fn}]},
 navigator,location:{href:'https://vercel-public-5325-20260708.vercel.app/?v=test',origin:'https://vercel-public-5325-20260708.vercel.app',search},
 getOriginOptions:()=>['서울'],getDestinationOptions:()=>['속초'],refreshMenus(){},render(){},showMap(){},
 state:{origin:'서울',destination:initialDestination},window:{open:url=>opened=url,tossRouteShare},URL,URLSearchParams,clearTimeout(){},setTimeout(){}});
 await handler();return {opened,payload,copied,status:status.textContent};
}
(async()=>{
 const sdkCalls=[];
 const bridgeContext={window:{},getSchemeUri:()=> 'intoss://gogowatercharging',Share:{createLink:async value=>{sdkCalls.push(value);return 'https://toss.im/test-share'},sendMessage:async value=>sdkCalls.push(value)},Clipboard:{setText:async value=>sdkCalls.push(value)},Device:{openURL:async value=>sdkCalls.push(value)}};
 vm.runInNewContext(fs.readFileSync('toss-share-entry.js','utf8').replace(/^import .*;\r?\n/,''),bridgeContext);
 assert.equal(bridgeContext.window.tossRouteShare.isAvailable(),true);
 await bridgeContext.window.tossRouteShare.createLink('origin=Seoul&destination=Busan');
 assert.equal(sdkCalls[0].path,'intoss://gogowatercharging?origin=Seoul&destination=Busan');
 assert.equal(sdkCalls[0].ogImageUrl,'https://fast-charger-v2-appintoss.vercel.app/assets/new/og-appintoss-20261106.png');
 await bridgeContext.window.tossRouteShare.share('Title','https://toss.im/test-share');
 assert.equal(sdkCalls[1].message,'Title\nhttps://toss.im/test-share');
 bridgeContext.getSchemeUri=()=>{throw new Error('Browser')};
 assert.equal(bridgeContext.window.tossRouteShare.isAvailable(),false);
 const html=fs.readFileSync('index.html','utf8');
 assert.ok(html.indexOf('src="./toss-share-sdk.js') < html.indexOf('src="./route-share.js'));
 const native=await run('kakao',async()=>{});assert.equal(native.payload.title,'서울 → 속초 최저가 급속 충전소');assert.equal(native.copied,undefined);
 assert.equal((await run('kakao')).status,'이 브라우저에서는 공유창을 지원하지 않습니다.\n링크 복사를 이용해주세요.');
 assert.equal((await run('kakao',async()=>{throw {name:'NotAllowedError'}})).status,'다시 시도해주세요.');
 assert.equal((await run('kakao',async()=>{throw {name:'AbortError'}})).status,'');
 const copy=await run('link');assert.equal(copy.status,'링크 복사 성공!');assert.equal(new URL(copy.copied).searchParams.get('destination'),'속초');assert.equal(new URL(copy.copied).searchParams.has('v'),false);
 for(const kind of ['facebook','x']){const result=await run(kind);const link=new URL(result.opened).searchParams.get(kind==='facebook'?'u':'url');assert.match(decodeURIComponent(link),/share\/서울-속초.html/)}
 const page=fs.readFileSync('share/서울-속초.html','utf8');assert.match(page,/og:title" content="서울 → 속초 최저가 급속 충전소/);assert.match(page,/summary_large_image/);assert.match(page,/og-appintoss-20261106.png/);
 const og=fs.readFileSync('assets/new/og-appintoss-20261106.png');
 assert.equal(og.readUInt32BE(16),1200);assert.equal(og.readUInt32BE(20),600);
 const pending=await run('kakao',async()=>{},'');assert.equal(pending.payload.title,'서울 → 도착지 선택');assert.equal(new URL(pending.payload.url).searchParams.get('view'),'result');assert.equal(new URL(pending.payload.url).searchParams.has('destination'),false);
 const restored=await run('kakao',async()=>{},'속초','?origin=서울&view=result');assert.equal(restored.payload.title,'서울 → 도착지 선택');
 const invalid=await run('kakao',async()=>{},'속초','?origin=서울&destination=서울');assert.equal(invalid.payload.title,'서울 → 도착지 선택');
 const pendingFacebook=await run('facebook',undefined,'');assert.match(decodeURIComponent(new URL(pendingFacebook.opened).searchParams.get('u')),/서울-도착지선택.html/);
 const calls=[];
 const toss={isAvailable:()=>true,createLink:async query=>{calls.push(['link',query]);return 'https://toss.im/test-share'},share:async(title,url)=>calls.push(['share',title,url]),copy:async url=>calls.push(['copy',url]),open:async url=>calls.push(['open',url])};
 await run('kakao',undefined,'속초','',toss);
 assert.equal(new URLSearchParams(calls[0][1]).get('origin'),'서울');
 assert.equal(new URLSearchParams(calls[0][1]).get('destination'),'속초');
 assert.equal(calls[1][2],'https://toss.im/test-share');
 calls.length=0;
 await run('link',undefined,'','',toss);
 assert.equal(new URLSearchParams(calls[0][1]).get('view'),'result');
 assert.deepEqual(calls[1],['copy','https://toss.im/test-share']);
 for(const kind of ['facebook','x']){
   calls.length=0;await run(kind,undefined,'속초','',toss);
   assert.equal(new URL(calls[1][1]).searchParams.get(kind==='facebook'?'u':'url'),'https://toss.im/test-share');
 }
 const failed=await run('kakao',undefined,'속초','',{...toss,createLink:async()=>{throw new Error('network')}});
 assert.equal(failed.status,'다시 시도해주세요.');assert.equal(failed.copied,undefined);
 assert.equal((await run('kakao',undefined,'속초','',{...toss,createLink:async()=>undefined})).status,'다시 시도해주세요.');
 assert.equal((await run('kakao',undefined,'속초','',{...toss,share:async()=>{throw {name:'AbortError'}}})).status,'');
 console.log('Toss route links, native sharing, copy, external destinations, failures, cancellation and browser fallback verified');
})();
