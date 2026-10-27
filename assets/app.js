
const defaultDataUrl = 'data/resources.json';
const storageKey = 'nancy-command-center-resources-v1';
const state = { resources: [], activeCategory: null, favoritesOnly: false };

const icons = {
  'Web Projects & GitHub':'⌘',
  'AI Resources':'✦',
  'Digital Tools':'◈',
  'Course Development':'▤',
  'Blueprinting':'⬡',
  'ATST Collaboration':'◎',
  'Administration':'▦',
  'Productivity & Automation':'⚡',
  'FLAIR Innovation Grant':'◆'
};

const descriptions = {
  'Web Projects & GitHub':'Web pages, repositories, and development projects.',
  'AI Resources':'AI teaching, assessment, literacy, and professional learning.',
  'Digital Tools':'Frequently used AI, collaboration, and support tools.',
  'Course Development':'Documents, trackers, templates, and Canvas resources.',
  'Blueprinting':'Blueprint pairing, tracking, schedules, and coordinator resources.',
  'ATST Collaboration':'Shared ATST tools, forms, and collaborative resources.',
  'Administration':'Planning, budgeting, requests, and assessment materials.',
  'Productivity & Automation':'Automation, focus, and Microsoft productivity tools.',
  'FLAIR Innovation Grant':'Proposal, planning, guidelines, folders, and reporting.'
};

async function loadData(){
  const saved = localStorage.getItem(storageKey);
  if(saved){
    state.resources = JSON.parse(saved);
  } else {
    const data = await fetch(defaultDataUrl).then(r=>r.json());
    state.resources = data.resources;
  }
  renderCategories();
  fillCategorySelect();
}

function saveLocal(){
  localStorage.setItem(storageKey, JSON.stringify(state.resources));
}

function categories(){
  return [...new Set(state.resources.map(r=>r.category))].sort();
}

function renderCategories(filter=''){
  document.getElementById('homeView').classList.remove('hidden');
  document.getElementById('categoryView').classList.add('hidden');
  const grid = document.getElementById('categoryGrid');
  grid.innerHTML='';
  const q = filter.trim().toLowerCase();
  let total = 0;
  categories().forEach(cat=>{
    const matching = state.resources.filter(r=>{
      const hay=[r.name,r.description,r.category,r.type,...(r.tags||[])].join(' ').toLowerCase();
      return r.category===cat && (!q || hay.includes(q));
    });
    if(!matching.length) return;
    total += matching.length;
    const tpl=document.getElementById('categoryCardTemplate').content.cloneNode(true);
    const btn=tpl.querySelector('.category-card');
    tpl.querySelector('.category-icon').textContent=icons[cat]||'•';
    tpl.querySelector('h3').textContent=cat;
    tpl.querySelector('p').textContent=`${matching.length} resource${matching.length===1?'':'s'}`;
    btn.onclick=()=>openCategory(cat,q);
    grid.appendChild(tpl);
  });
  document.getElementById('resourceCount').textContent=`${total} resources`;
  if(!grid.children.length) grid.innerHTML='<div class="empty-state">No resources match that search.</div>';
}

function openCategory(cat, initialSearch=''){
  state.activeCategory=cat;
  state.favoritesOnly=false;
  document.getElementById('homeView').classList.add('hidden');
  document.getElementById('categoryView').classList.remove('hidden');
  document.getElementById('categoryTitle').textContent=cat;
  document.getElementById('categorySubtitle').textContent=descriptions[cat]||'';
  document.getElementById('categorySearch').value=initialSearch;
  renderResources(initialSearch);
  window.scrollTo({top:0,behavior:'smooth'});
}

function showFavorites(){
  state.activeCategory=null;
  state.favoritesOnly=true;
  document.getElementById('homeView').classList.add('hidden');
  document.getElementById('categoryView').classList.remove('hidden');
  document.getElementById('categoryTitle').textContent='Favorites';
  document.getElementById('categorySubtitle').textContent='Your most frequently used resources.';
  document.getElementById('categorySearch').value='';
  renderResources('');
}

function renderResources(filter=''){
  const grid=document.getElementById('resourceGrid');
  grid.innerHTML='';
  const q=filter.trim().toLowerCase();
  const list=state.resources.filter(r=>{
    const categoryMatch = state.favoritesOnly ? r.favorite : r.category===state.activeCategory;
    const hay=[r.name,r.description,r.category,r.type,...(r.tags||[])].join(' ').toLowerCase();
    return categoryMatch && (!q || hay.includes(q));
  }).sort((a,b)=>(b.favorite-a.favorite)||a.name.localeCompare(b.name));

  list.forEach(r=>{
    const tpl=document.getElementById('resourceCardTemplate').content.cloneNode(true);
    const card=tpl.querySelector('.resource-card');
    tpl.querySelector('.type-pill').textContent=r.type||'Resource';
    tpl.querySelector('h3').textContent=r.name;
    tpl.querySelector('.description').textContent=r.description;
    const fav=tpl.querySelector('.favorite-btn');
    fav.textContent=r.favorite?'★':'☆';
    fav.onclick=()=>{r.favorite=!r.favorite;saveLocal();renderResources(document.getElementById('categorySearch').value)};
    const tags=tpl.querySelector('.tag-list');
    (r.tags||[]).forEach(t=>{const s=document.createElement('span');s.textContent=t;tags.appendChild(s)});
    const open=tpl.querySelector('.open-link');open.href=r.url;
    tpl.querySelector('.edit-btn').onclick=()=>editResource(r.id);
    tpl.querySelector('.delete-btn').onclick=()=>deleteResource(r.id);
    card.dataset.id=r.id;
    grid.appendChild(tpl);
  });
  if(!list.length) grid.innerHTML='<div class="empty-state">No resources found here.</div>';
}

function fillCategorySelect(){
  const select=document.getElementById('resourceCategory');
  select.innerHTML='';
  categories().forEach(cat=>{
    const o=document.createElement('option');o.value=cat;o.textContent=cat;select.appendChild(o);
  });
  const n=document.createElement('option');n.value='__new__';n.textContent='＋ New category…';select.appendChild(n);
}

function toggleNewCategory(){
  const select=document.getElementById('resourceCategory');
  const label=document.getElementById('newCategoryLabel');
  const input=document.getElementById('newCategoryName');
  const isNew=select.value==='__new__';
  label.classList.toggle('hidden',!isNew);
  input.required=isNew;
  if(!isNew) input.value='';
}

function openAddDialog(){
  document.getElementById('dialogTitle').textContent='Add Resource';
  document.getElementById('resourceForm').reset();
  document.getElementById('resourceId').value='';
  if(state.activeCategory) document.getElementById('resourceCategory').value=state.activeCategory;
  toggleNewCategory();
  document.getElementById('resourceDialog').showModal();
}

function editResource(id){
  const r=state.resources.find(x=>x.id===id);
  document.getElementById('dialogTitle').textContent='Edit Resource';
  document.getElementById('resourceId').value=r.id;
  document.getElementById('resourceName').value=r.name;
  document.getElementById('resourceUrl').value=r.url;
  document.getElementById('resourceCategory').value=r.category;
  document.getElementById('resourceDescription').value=r.description;
  document.getElementById('resourceType').value=r.type||'';
  document.getElementById('resourceTags').value=(r.tags||[]).join(', ');
  document.getElementById('resourceFavorite').checked=!!r.favorite;
  toggleNewCategory();
  document.getElementById('resourceDialog').showModal();
}

function deleteResource(id){
  const r=state.resources.find(x=>x.id===id);
  if(confirm(`Delete "${r.name}"?`)){
    state.resources=state.resources.filter(x=>x.id!==id);
    saveLocal();
    renderResources(document.getElementById('categorySearch').value);
  }
}

document.getElementById('resourceForm').addEventListener('submit',e=>{
  e.preventDefault();
  const id=document.getElementById('resourceId').value;
  const item={
    id:id||`r${Date.now()}`,
    name:document.getElementById('resourceName').value.trim(),
    url:document.getElementById('resourceUrl').value.trim(),
    category:document.getElementById('resourceCategory').value==='__new__'
      ?document.getElementById('newCategoryName').value.trim()
      :document.getElementById('resourceCategory').value,
    description:document.getElementById('resourceDescription').value.trim(),
    type:document.getElementById('resourceType').value.trim()||'Resource',
    tags:document.getElementById('resourceTags').value.split(',').map(x=>x.trim()).filter(Boolean),
    favorite:document.getElementById('resourceFavorite').checked
  };
  if(id){
    const index=state.resources.findIndex(x=>x.id===id);
    state.resources[index]=item;
  } else {
    state.resources.push(item);
  }
  saveLocal();
  fillCategorySelect();
  document.getElementById('resourceDialog').close();
  if(state.activeCategory===item.category || state.favoritesOnly) renderResources('');
  else renderCategories();
});

document.getElementById('globalSearch').addEventListener('input',e=>renderCategories(e.target.value));
document.getElementById('categorySearch').addEventListener('input',e=>renderResources(e.target.value));
document.getElementById('backBtn').onclick=()=>renderCategories(document.getElementById('globalSearch').value);
document.getElementById('favoritesBtn').onclick=showFavorites;
document.getElementById('addResourceBtn').onclick=openAddDialog;
document.getElementById('resourceCategory').addEventListener('change',toggleNewCategory);
document.getElementById('closeDialog').onclick=()=>document.getElementById('resourceDialog').close();
document.getElementById('cancelDialog').onclick=()=>document.getElementById('resourceDialog').close();

const manage=document.getElementById('manageDialog');
document.getElementById('manageBtn').onclick=()=>manage.showModal();
document.getElementById('closeManage').onclick=()=>manage.close();

document.getElementById('exportBtn').onclick=()=>{
  const payload={version:'1.0',resources:state.resources};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='resources.json';
  a.click();
  URL.revokeObjectURL(a.href);
};

document.getElementById('importInput').addEventListener('change',e=>{
  const file=e.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const parsed=JSON.parse(reader.result);
      state.resources=parsed.resources||parsed;
      saveLocal();
      fillCategorySelect();
      renderCategories();
      manage.close();
      alert('Resources imported successfully.');
    }catch{
      alert('That file could not be read as resource data.');
    }
  };
  reader.readAsText(file);
});

document.getElementById('resetBtn').onclick=async()=>{
  if(!confirm('Reset all local edits and return to the published version?')) return;
  localStorage.removeItem(storageKey);
  const data=await fetch(defaultDataUrl).then(r=>r.json());
  state.resources=data.resources;
  fillCategorySelect();
  renderCategories();
  manage.close();
};

loadData();
