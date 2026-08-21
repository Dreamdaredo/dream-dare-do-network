const menu=document.querySelector('.menu');const links=document.querySelector('.links');if(menu){menu.addEventListener('click',()=>{links.classList.toggle('open');menu.setAttribute('aria-expanded',links.classList.contains('open'))});document.querySelectorAll('.links a').forEach(a=>a.addEventListener('click',()=>links.classList.remove('open')))}

// Supabase public browser configuration.
const SUPABASE_URL='https://apbksupfsmigdmpdqtmo.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_4cCQcqIW5uoKxC_tiKEjAA_UJJnqgTC';

const form=document.querySelector('#registration-form');
const statusEl=document.querySelector('#form-status');
const submitBtn=document.querySelector('.submit-btn');

if(form){
  form.addEventListener('submit',async(e)=>{
    e.preventDefault();
    statusEl.textContent='Submitting your registration…';
    statusEl.className='form-status';
    submitBtn.disabled=true;
    try{
      const data=new FormData(form);
      const file=data.get('receipt');
      if(!file || !file.size) throw new Error('Please upload your receipt.');
      if(file.size>8*1024*1024) throw new Error('Receipt must be 8MB or smaller.');
      const allowed=['image/jpeg','image/png','image/webp','application/pdf'];
      if(!allowed.includes(file.type)) throw new Error('Receipt must be JPG, PNG, WEBP or PDF.');

      const safeName=file.name.toLowerCase().replace(/[^a-z0-9._-]/g,'-');
      const receiptPath=`${crypto.randomUUID()}-${safeName}`;
      const upload=await fetch(`${SUPABASE_URL}/storage/v1/object/registration-receipts/${receiptPath}`,{
        method:'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${SUPABASE_PUBLISHABLE_KEY}`,'x-upsert':'false','Content-Type':file.type},body:file
      });
      if(!upload.ok){const err=await upload.text();throw new Error(err||'Receipt upload failed.');}

      const row={full_name:data.get('full_name').trim(),institution:data.get('institution').trim(),whatsapp:data.get('whatsapp').trim(),email:data.get('email').trim().toLowerCase(),reason:data.get('reason').trim(),niche:data.get('niche'),receipt_path:receiptPath};
      const insert=await fetch(`${SUPABASE_URL}/rest/v1/members`,{method:'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${SUPABASE_PUBLISHABLE_KEY}`,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(row)});
      if(!insert.ok){const err=await insert.text();throw new Error(err||'Registration could not be saved.');}
      form.reset();
      statusEl.textContent='Registration submitted successfully. We will review it and contact you through the details provided.';
      statusEl.className='form-status success';
    }catch(err){
      console.error(err);
      statusEl.textContent=err.message||'Something went wrong. Please try again.';
      statusEl.className='form-status error';
    }finally{submitBtn.disabled=false;}
  });
}
