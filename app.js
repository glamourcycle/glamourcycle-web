'use strict';
const config = window.GLAM_CONFIG || {};
const email = config.email || 'glamourcycle@gmail.com';
const grid = document.querySelector('#outfit-grid');
const search = document.querySelector('#search');
const dialog = document.querySelector('#outfit-dialog');
let outfits = [], category = 'All', selected, opener;
const mail = (subject, body) => `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
const requestText = item => `Hello Glam-Cycle,\n\nI'd like to ask about outfit ${item.id}: ${item.title}.\nPlease confirm its size, condition, and availability, and let me know the next steps.\n\nThank you!`;
function element(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}
function imagePath(path) {
  return typeof path === 'string' && /^assets\/[a-zA-Z0-9._-]+$/.test(path) ? path : '';
}
function openItem(item, trigger) {
  selected = item; opener = trigger;
  document.querySelector('#dialog-title').textContent = item.title;
  document.querySelector('#dialog-image').src = imagePath(item.image);
  document.querySelector('#dialog-image').alt = item.title;
  document.querySelector('#dialog-category').textContent = item.category;
  document.querySelector('#dialog-size').textContent = `Size: ${item.size || 'Ask our team'}`;
  document.querySelector('#dialog-description').textContent = item.description;
  document.querySelector('#dialog-id').textContent = `Catalog no. ${item.id}`;
  document.querySelector('#request-link').href = mail(`Outfit request: ${item.id}`, requestText(item));
  document.querySelector('#copy-status').textContent = '';
  dialog.showModal(); document.body.classList.add('modal-open');
}
function render() {
  const query = search.value.trim().toLowerCase();
  const visible = outfits.filter(item => (category === 'All' || item.category === category) && [item.title,item.category,item.size,item.id,item.description].join(' ').toLowerCase().includes(query));
  grid.replaceChildren();
  document.querySelector('#results-count').textContent = `${visible.length} outfit${visible.length === 1 ? '' : 's'} shown`;
  if (!visible.length) grid.append(element('p','empty','No outfits match just yet. Try another size or category.'));
  visible.forEach(item => {
    const card = element('article','outfit-card');
    const imageButton = element('button','card-image-button'); imageButton.type = 'button'; imageButton.setAttribute('aria-label',`View ${item.title}, catalog ${item.id}`);
    const img = element('img'); img.src = imagePath(item.image); img.alt = item.title; img.loading = 'lazy'; img.width = 600; img.height = 800;
    imageButton.append(img,element('span','card-badge',item.category));
    imageButton.addEventListener('click',() => openItem(item,imageButton));
    const details = element('div','card-details'), heading = element('div','card-heading'), open = element('button','card-open','↗'); open.type = 'button'; open.setAttribute('aria-label',`Request details for ${item.title}`); open.addEventListener('click',() => openItem(item,open));
    heading.append(element('h3','',item.title),open);
    details.append(heading,element('p','card-meta',`Size ${item.size || 'to confirm'}`),element('p','catalog-id',`CATALOG / ${item.id}`));
    card.append(imageButton,details); grid.append(card);
  });
}
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click',() => {
  category = button.dataset.category;
  document.querySelectorAll('.filter').forEach(other => { const active = other === button; other.classList.toggle('active',active); other.setAttribute('aria-pressed',String(active)); }); render();
}));
search.addEventListener('input',render);
document.querySelector('.dialog-close').addEventListener('click',() => dialog.close());
dialog.addEventListener('click',event => { if(event.target === dialog) {const r=dialog.getBoundingClientRect(); if(event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();} });
dialog.addEventListener('close',() => {document.body.classList.remove('modal-open'); if(opener) opener.focus();});
document.querySelector('#copy-request').addEventListener('click',async () => {
  if(!selected) return;
  try {await navigator.clipboard.writeText(`To: ${email}\nSubject: Outfit request: ${selected.id}\n\n${requestText(selected)}`);document.querySelector('#copy-status').textContent = 'Copied. Paste into your email app.';}
  catch {document.querySelector('#copy-status').textContent = `Please email ${email} with catalog number ${selected.id}.`;}
});
document.querySelectorAll('.contact-link').forEach(link => {link.href=`mailto:${email}`;if(link.closest('.footer-contact')) link.textContent=email;});
document.querySelector('#year').textContent = new Date().getFullYear();
const donate = document.querySelector('#donate-link');
if(config.donationFormUrl && /^https:\/\/(?:(?:airtable\.com|[a-z0-9-]+\.airtable\.com)\/|docs\.google\.com\/forms\/)/i.test(config.donationFormUrl)) {
  donate.href=config.donationFormUrl; donate.target='_blank'; donate.rel='noopener noreferrer';
  document.querySelector('#donate-help').textContent='Complete our donation form. Our team will contact you about the next steps. Opens in a new tab.';
} else donate.href=mail("I'd like to donate an outfit","Hello Glam-Cycle,\n\nI'd like to offer an outfit.\nClothing type:\nSize:\nCondition and any flaws:\nPieces included:\nGeneral location:\n\nI will attach photos of the outfit and its size label.\nPlease let me know the next steps.\n");
fetch('data/outfits.json').then(response => {if(!response.ok) throw new Error('Catalog unavailable');return response.json();}).then(data => {
  if(!Array.isArray(data)) throw new Error('Invalid catalog');
  outfits=data.filter(item => item && item.id && item.title && imagePath(item.image));
  if(config.catalogSource==='airtable') document.querySelector('#catalog-note').textContent='Approved outfits from our collection. Our team will confirm availability when you request an item.';
  render();
}).catch(() => {grid.replaceChildren(element('p','empty','The collection could not load. Please email us to ask about available outfits.'));});
