/** Public lead intake only. Production orders, payments and drawings stay private. */
export interface Statement {
  bind(...values: unknown[]): Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<unknown>;
  all<T = Record<string, unknown>>(): Promise<{results: T[]}>;
}
export interface IntakeDatabase { prepare(query: string): Statement }
export interface IntakeEnv {
  INQUIRIES_DB?: IntakeDatabase;
  INQUIRY_OPERATOR_TOKEN?: string;
}
export interface IntakeContext { request: Request; env: IntakeEnv }
export class IntakeError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
export function json(value: unknown, status = 200) {
  return Response.json(value, {status, headers: {'Cache-Control':'private, no-store', 'X-Content-Type-Options':'nosniff'}});
}
export function available(env: IntakeEnv): env is IntakeEnv & {INQUIRIES_DB: IntakeDatabase; INQUIRY_OPERATOR_TOKEN:string} {
  return !!env.INQUIRIES_DB && typeof env.INQUIRY_OPERATOR_TOKEN === 'string' && env.INQUIRY_OPERATOR_TOKEN.length >= 32;
}
export function requiredEnv(env: IntakeEnv) {
  if (!available(env)) throw new IntakeError(503, '온라인 접수 연결을 준비하고 있습니다. 작성한 내용을 보관하고 이메일 문의를 이용해 주세요.');
  return env;
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (origin !== new URL(request.url).origin || request.headers.get('sec-fetch-site') === 'cross-site') throw new IntakeError(403,'이 사이트의 문의 양식에서 접수해 주세요.');
}
export async function readBody(request:Request, maxBytes=16000):Promise<Record<string,unknown>> {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new IntakeError(415,'JSON 형식의 요청이 필요합니다.');
  if (Number(request.headers.get('content-length') || 0)>maxBytes) throw new IntakeError(413,'입력 내용이 너무 깁니다.');
  const reader=request.body?.getReader();if(!reader)throw new IntakeError(400,'문의 내용을 입력해 주세요.');
  let count=0;const chunks:Uint8Array[]=[];
  try{while(true){const {value,done}=await reader.read();if(done)break;if(value){count+=value.byteLength;if(count>maxBytes){await reader.cancel();throw new IntakeError(413,'입력 내용이 너무 깁니다.');}chunks.push(value);}}}finally{reader.releaseLock();}
  const data=new Uint8Array(count);let offset=0;for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.length;}
  let body:unknown;try{body=JSON.parse(new TextDecoder().decode(data));}catch{throw new IntakeError(400,'문의 형식을 확인해 주세요.');}
  if(!body||typeof body!=='object'||Array.isArray(body))throw new IntakeError(400,'문의 형식을 확인해 주세요.');
  return body as Record<string,unknown>;
}
export async function hash(value:string) {const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));return [...bytes].map(v=>v.toString(16).padStart(2,'0')).join('');}
export async function operator(request:Request,env:IntakeEnv) {
  const configured=requiredEnv(env);
  const token=request.headers.get('authorization')?.match(/^Bearer ([^\s]+)$/)?.[1]||'';
  const [a,b]=await Promise.all([hash(token),hash(configured.INQUIRY_OPERATOR_TOKEN)]);
  let difference=0;for(let i=0;i<a.length;i++)difference|=a.charCodeAt(i)^b.charCodeAt(i);
  if(difference!==0)throw new IntakeError(401,'운영 연결 인증이 필요합니다.');
  return configured;
}
function text(value:unknown,label:string,max:number,required=false) {
  if(value===undefined||value===null){if(required)throw new IntakeError(400,`${label}을(를) 입력해 주세요.`);return '';}
  if(typeof value!=='string'||value.length>max||/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value))throw new IntakeError(400,`${label} 형식을 확인해 주세요.`);
  const result=value.trim();if(required&&!result)throw new IntakeError(400,`${label}을(를) 입력해 주세요.`);return result;
}
// These fields are imported by the private sales bridge as single-line text.
// Reject control characters here so a publicly accepted record cannot block its queue.
function contactText(value:unknown,label:string,max:number,required=false) {
  if(typeof value==='string'&&/[\u0000-\u001F\u007F]/.test(value))throw new IntakeError(400,`${label} 형식을 확인해 주세요.`);
  return text(value,label,max,required);
}
function number(value:unknown,label:string,min:number,max:number,optional=false) {
  if(optional&&(value===null||value===undefined||value===''))return null;
  if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max)throw new IntakeError(400,`${label}은(는) ${min}~${max} 범위로 입력해 주세요.`);return value;
}
function enumValue(value:unknown,values:readonly string[],fallback:string,label:string){const v=value??fallback;if(typeof v!=='string'||!values.includes(v))throw new IntakeError(400,`${label}을(를) 선택해 주세요.`);return v;}
export function validateInquiry(input:Record<string,unknown>) {
  const allowed=['brief','contact','privacyConsent','marketingConsent','website','idempotencyKey'];
  if(Object.keys(input).some(k=>!allowed.includes(k)))throw new IntakeError(400,'지원하지 않는 문의 항목이 있습니다.');
  if(input.privacyConsent!==true)throw new IntakeError(400,'문의 처리를 위한 개인정보 이용에 동의해 주세요.');
  if(input.marketingConsent!==undefined&&typeof input.marketingConsent!=='boolean')throw new IntakeError(400,'추가 안내 수신 여부를 확인해 주세요.');
  if(text(input.website,'웹사이트',1000))throw new IntakeError(400,'문의 양식을 다시 확인해 주세요.');
  const key=text(input.idempotencyKey,'접수 식별자',80,true);if(!/^[a-zA-Z0-9_-]{20,80}$/.test(key))throw new IntakeError(400,'새 문의 양식에서 접수해 주세요.');
  if(!input.brief||typeof input.brief!=='object'||Array.isArray(input.brief)||!input.contact||typeof input.contact!=='object'||Array.isArray(input.contact))throw new IntakeError(400,'제품과 연락 정보를 입력해 주세요.');
  const v=input.brief as Record<string,unknown>,c=input.contact as Record<string,unknown>;
  const bf=['purpose','brand','productName','productShape','diameterMm','heightMm','productsPerStand','quantity','materialId','printSide','requestedDate','notes','measurementsConfirmed','budgetSupply'];
  if(Object.keys(v).some(k=>!bf.includes(k))||Object.keys(c).some(k=>!['name','company','email'].includes(k)))throw new IntakeError(400,'문의 항목 형식을 확인해 주세요.');
  const quantity=number(v.quantity??1,'수량',1,10000)!,productsPerStand=number(v.productsPerStand??1,'진열 제품 수',1,12)!;
  if(!Number.isInteger(quantity)||!Number.isInteger(productsPerStand))throw new IntakeError(400,'수량과 제품 수는 정수로 입력해 주세요.');
  const materialId=enumValue(v.materialId,['clear','clear-matte','white-gloss','white-matte','mirror','transparent-color','matte-color','gloss-color'],'white-matte','소재');
  const printSide=enumValue(v.printSide,['front','rear'],'front','인쇄 방향');
  if(printSide==='rear'&&materialId!=='clear')throw new IntakeError(400,'뒷면 인쇄는 투명 아크릴에서만 선택할 수 있습니다.');
  const requestedDate=text(v.requestedDate,'희망일',10);
  if(requestedDate&&(!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)||Number.isNaN(Date.parse(requestedDate))||new Date(requestedDate).toISOString().slice(0,10)!==requestedDate))throw new IntakeError(400,'희망일을 확인해 주세요.');
  if(v.measurementsConfirmed!==undefined&&typeof v.measurementsConfirmed!=='boolean')throw new IntakeError(400,'실측 확인 항목을 확인해 주세요.');
  const email=contactText(c.email,'이메일',254,true).toLowerCase();
  if(!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)||/[\r\n]/.test(email))throw new IntakeError(400,'이메일 주소를 확인해 주세요.');
  const budgetSupply=number(v.budgetSupply,'공급가 총예산',1,100000000,true);
  return {key,brief:{purpose:enumValue(v.purpose,['hero','collection','exhibition','reorder','partner'],'hero','제작 목적'),brand:text(v.brand,'브랜드',80),productName:text(v.productName,'제품명',120),productShape:enumValue(v.productShape,['round','other'],'round','제품 모양'),diameterMm:number(v.diameterMm,'지름',1,1000,true),heightMm:number(v.heightMm,'높이',10,1000,true),productsPerStand,quantity,materialId,printSide,...(requestedDate?{requestedDate}:{}),...(budgetSupply===null?{}:{budgetSupply}),notes:text(v.notes,'요청사항',1500),measurementsConfirmed:v.measurementsConfirmed===true},contact:{name:contactText(c.name,'담당자명',80,true),company:contactText(c.company,'회사명',120),email},privacyConsent:true,marketingConsent:input.marketingConsent===true};
}
export function errorResponse(error:unknown){return json({message:error instanceof IntakeError?error.message:'접수를 완료하지 못했습니다. 입력 내용은 보관되며, 잠시 후 다시 시도하거나 이메일 문의를 이용해 주세요.'},error instanceof IntakeError?error.status:503);}
