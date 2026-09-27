const desktop=matchMedia('(min-width:701px)');
// Keep both native summaries in place; either control compares both packages.
const offerDetails=[...document.querySelectorAll('.offer-details')];
for(const details of offerDetails){
  details.querySelector('summary').addEventListener('click',event=>{
    event.preventDefault();
    const open=!details.open;
    for(const offer of offerDetails)offer.open=open;
  });
}

const menuButton=document.querySelector('.menu-button');
const menu=document.querySelector('#mobile-menu');
function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Otvoriť menu');}
menuButton.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Zatvoriť menu':'Otvoriť menu');});
menu.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){closeMenu();menuButton.focus();}});
desktop.addEventListener('change',()=>{if(desktop.matches)closeMenu();});
document.querySelector('#dopyt button[type="submit"]').disabled=false;

const preview=document.querySelector('.project-dialog');
const previewImage=document.querySelector('#preview-image');
const previewScroll=document.querySelector('.preview-scroll');
let previewTrigger;
function resetZoom(){previewScroll.classList.remove('is-zoomed');document.querySelector('#preview-zoom').setAttribute('aria-pressed','false');document.querySelector('#preview-zoom').textContent='Zväčšiť';}
document.querySelectorAll('.project-preview').forEach(button=>{
  button.hidden=false;
  button.addEventListener('click',()=>{
    previewTrigger=button;
    document.querySelector('#preview-title').textContent=button.dataset.title;
    document.querySelector('#preview-live').href=button.dataset.url;
    previewImage.alt=`${button.dataset.title} — celá stránka, statický náhľad`;
    previewImage.width=Number(button.dataset.width);previewImage.height=Number(button.dataset.height);
    previewImage.src=`/media/projects/${button.dataset.project}-full.webp`;
    resetZoom();preview.showModal();previewScroll.scrollTo(0,0);
  });
});
document.querySelector('.close-dialog').addEventListener('click',()=>preview.close());
document.querySelector('#preview-zoom').addEventListener('click',event=>{
  const zoomed=previewScroll.classList.toggle('is-zoomed');
  event.currentTarget.setAttribute('aria-pressed',String(zoomed));event.currentTarget.textContent=zoomed?'Prispôsobiť':'Zväčšiť';
});
previewImage.addEventListener('click',()=>document.querySelector('#preview-zoom').click());
preview.addEventListener('close',()=>{previewImage.removeAttribute('src');resetZoom();previewTrigger?.focus({preventScroll:true});});
document.querySelector('#dopyt').addEventListener('submit',event=>{
  event.preventDefault();const form=event.currentTarget;
  if(!form.reportValidity())return;
  const data=new FormData(form);
  const body=`Meno: ${data.get('name')}\nE-mail: ${data.get('email')}\n\n${data.get('message')}`;
  const mailto=`mailto:${form.dataset.email}?subject=${encodeURIComponent('Nový projekt — Codera')}&body=${encodeURIComponent(body)}`;
  const status=document.querySelector('#form-status');
  status.textContent='Dopyt je pripravený na odoslanie vo vašom e-mailovom programe. Ak sa neotvoril, napíšte nám priamo na uvedený e-mail.';
  window.location.href=mailto;
});
