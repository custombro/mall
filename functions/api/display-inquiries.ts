import {available,requiredEnv,sameOrigin,readBody,validateInquiry,hash,json,errorResponse,IntakeError,type IntakeContext} from '../_lib/display-intake.ts';

export async function onRequest({request,env}:IntakeContext):Promise<Response>{
  try{
    if(request.method==='GET'){
      if(!available(env))return json({acceptingInquiries:false});
      try{await env.INQUIRIES_DB.prepare('SELECT id FROM display_inquiries LIMIT 1').first();return json({acceptingInquiries:true});}catch{return json({acceptingInquiries:false});}
    }
    if(request.method!=='POST')return json({message:'허용되지 않는 요청입니다.'},405);
    sameOrigin(request);const configured=requiredEnv(env),input=validateInquiry(await readBody(request));
    const payload={brief:input.brief,contact:input.contact,privacyConsent:input.privacyConsent,marketingConsent:input.marketingConsent};
    const requestHash=await hash(JSON.stringify(payload));
    const existing=await configured.INQUIRIES_DB.prepare('SELECT id,request_hash,created_at FROM display_inquiries WHERE client_request_id=?').bind(input.key).first<{id:string;request_hash:string;created_at:string}>();
    if(existing){if(existing.request_hash!==requestHash)throw new IntakeError(409,'같은 접수 번호의 내용이 변경되었습니다. 접수 내용을 확인하고 새 문의로 보내 주세요.');return json({requestId:existing.id,receivedAt:existing.created_at,message:'이미 접수된 문의입니다. 중복으로 저장하지 않았습니다.',replayed:true});}
    const at=new Date().toISOString(),window=at.slice(0,13);
    const ip=request.headers.get('cf-connecting-ip')||'unknown';
    const rateKey=await hash(configured.INQUIRY_OPERATOR_TOKEN+'|'+window+'|'+ip);
    await configured.INQUIRIES_DB.prepare('INSERT INTO display_intake_limits(key,window,count) VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET count=count+1').bind(rateKey,window).run();
    const rate=await configured.INQUIRIES_DB.prepare('SELECT count FROM display_intake_limits WHERE key=?').bind(rateKey).first<{count:number}>();
    if((rate?.count||0)>20)throw new IntakeError(429,'문의가 짧은 시간에 반복되었습니다. 잠시 후 다시 접수해 주세요.');
    const requestId='CBI-'+crypto.randomUUID();
    try{
      await configured.INQUIRIES_DB.prepare('INSERT INTO display_inquiries(id,brief_json,contact_json,privacy_consent,marketing_consent,source,request_hash,client_request_id,created_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(requestId,JSON.stringify(input.brief),JSON.stringify(input.contact),1,input.marketingConsent?1:0,'mall-display',requestHash,input.key,at).run();
    }catch(error){
      const replay=await configured.INQUIRIES_DB.prepare('SELECT id,request_hash,created_at FROM display_inquiries WHERE client_request_id=?').bind(input.key).first<{id:string;request_hash:string;created_at:string}>();
      if(!replay)throw error;if(replay.request_hash!==requestHash)throw new IntakeError(409,'접수 식별자가 다른 문의에 사용되었습니다. 새 문의로 접수해 주세요.');
      return json({requestId:replay.id,receivedAt:replay.created_at,message:'이미 접수된 문의입니다.',replayed:true});
    }
    // Raw client IPs are never stored. Expired throttling keys are disposable counters.
    try{await configured.INQUIRIES_DB.prepare('DELETE FROM display_intake_limits WHERE window<?').bind(new Date(Date.now()-86400000).toISOString().slice(0,13)).run();}catch{}
    return json({requestId,receivedAt:at,message:'제작 상담이 접수되었습니다. 입력한 제품 정보와 희망 조건을 검토합니다. 가격·납기·제작은 아직 확정되지 않았습니다.',replayed:false},201);
  }catch(error){return errorResponse(error);}
}
