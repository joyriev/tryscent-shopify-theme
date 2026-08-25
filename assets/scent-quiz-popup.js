    /* ============================================================
       SCENT MATCH - perfume swipe quiz (mechanics replica)
       Ported into a site-wide popup: all ids prefixed sq-, all DOM
       lookups scoped under #scent-quiz-popup-overlay so this cannot
       collide with or leak into the rest of the theme.
       ============================================================ */
    (function(){
    'use strict';

    /* ---- Klaviyo hook ----------------
       Enabled/key/list come from theme settings (Doftquiz > E-postinsamling),
       not hardcoded here, so merchants can turn it on/off and rotate keys
       from the admin without touching code. */
    var SQ_CFG = window.SQ_QUIZ_CONFIG || {};
    var KLAVIYO_CONFIG = {
      enabled: !!(SQ_CFG.klaviyoEnabled && SQ_CFG.klaviyoPublicKey && SQ_CFG.klaviyoListId),
      publicApiKey: SQ_CFG.klaviyoPublicKey || '',
      listId: SQ_CFG.klaviyoListId || ''
    };

    var QUIZ_LANG = 'sv';
    var TAG_SV = {Date:'Dejt',Party:'Fest',Autumn:'Höst',Office:'Kontor',Everyday:'Vardag',Summer:'Sommar',Evening:'Kväll',Winter:'Vinter',Spring:'Vår'};

    var SCENTS = [
      {name:"Saffron Amber", no:"466", productId:7892876918854, accent:"#a97b2e", accent2:"#6e4d17",
       desc:"Inspired by Maison Francis Kurkdjian Baccarat Rouge 540.",
       emo:{en:"The scent strangers stop to ask you about.", sv:"Doften som får folk att fråga vad du har på dig."},
       tags:["Date","Party","Autumn"],
       imgs:["https://tryscent.co/cdn/shop/files/SaffronAmber.png?width=800",
         "https://tryscent.co/cdn/shop/files/Baccarat_Rouge_540_Maison_Francis_Kurkdjian.avif?width=800"]},

      {name:"Pineapple Smoke", no:"288", productId:7892877410374, accent:"#b03a5b", accent2:"#732239",
       desc:"Inspired by Aventus.",
       emo:{en:"Confidence you can smell across the room.", sv:"Självförtroende som känns tvärs över rummet."},
       tags:["Office","Everyday","Autumn"],
       imgs:["https://tryscent.co/cdn/shop/files/288m.try.png?width=800",
         "https://tryscent.co/cdn/shop/files/aventus.webp?width=800"]},

      {name:"Cherry Vanilla", no:"438", productId:7892876722246, accent:"#4a6f8f", accent2:"#2b4258",
       desc:"Inspired by Tom Ford Lost Cherry.",
       emo:{en:"Sweet, a little naughty, impossible to ignore.", sv:"Söt, lite busig och omöjlig att ignorera."},
       tags:["Date","Evening","Autumn"],
       imgs:["https://tryscent.co/cdn/shop/files/sweet_cherry_vanilla_1.png?width=800",
         "https://tryscent.co/cdn/shop/files/lost_cherry.jpg?width=800"]},

      {name:"Ginger Amber", no:"230", productId:7892877836358, accent:"#6f8f6a", accent2:"#455c41",
       desc:"Inspired by Dior Sauvage.",
       emo:{en:"For days when you need to feel unshakable.", sv:"För dagar när du behöver känna dig orubblig."},
       tags:["Date","Everyday","Autumn"],
       imgs:["https://tryscent.co/cdn/shop/files/dior-sauvage.webp?width=800",
         "https://tryscent.co/cdn/shop/files/Dior_Sauvage.avif?width=800"]},

      {name:"Berry Vanilla", no:"132", productId:7892877213766, accent:"#b0623a", accent2:"#78401f",
       desc:"Inspired by YSL Black Opium.",
       emo:{en:"Sexy on demand, whenever you want it.", sv:"Sexig när du själv bestämmer."},
       tags:["Date","Evening","Autumn"],
       imgs:["https://tryscent.co/cdn/shop/files/Blackberry_Vanilla_Musk_1.png?width=800",
         "https://tryscent.co/cdn/shop/files/ysl-black-opium-edp_jtgB.webp?width=800"]},

      {name:"Lavender Mint", no:"247", productId:7892877508678, accent:"#7a5a8f", accent2:"#4c3560",
       desc:"Inspired by Jean Paul Gaultier Le Male.",
       emo:{en:"Easy charm that does the talking for you.", sv:"Enkel charm som sköter snacket åt dig."},
       tags:["Office","Everyday","Summer"],
       imgs:["https://tryscent.co/cdn/shop/files/lavender_mint_vanilla_1.png?width=800",
         "https://tryscent.co/cdn/shop/files/Le_Male_Jean_Paul_Gaultier.avif?width=800"]},

      {name:"Born in Roma", no:"469", productId:8245967978566, accent:"#4a90a4", accent2:"#2c5a68",
       desc:"Inspired by Valentino Donna Born in Roma.",
       emo:{en:"Pretty and playful, exactly like you.", sv:"Söt och lekfull, precis som du."},
       tags:["Date","Evening","Summer"],
       imgs:["https://tryscent.co/cdn/shop/files/469W_c.webp?width=800",
         "https://tryscent.co/cdn/shop/files/born_in_roma.jpg?width=800"]},

      {name:"Cinnamon Leather", no:"275", productId:7892877705286, accent:"#8a7a5a", accent2:"#5c5039",
       desc:"Inspired by Paco Rabanne 1 Million.",
       emo:{en:"The kind of swagger that needs no words.", sv:"Självsäker attityd som inte behöver ord."},
       tags:["Party","Evening","Autumn"],
       imgs:["https://tryscent.co/cdn/shop/files/CinnamonLeatherAmber.png?width=800",
         "https://tryscent.co/cdn/shop/files/Paco_Rabanne_One_Million.avif?width=800"]},

      {name:"Wild Rebel", no:"232", productId:7902626938950, accent:"#a97b2e", accent2:"#6e4d17",
       desc:"Inspired by Tom Ford F**king Fabulous.",
       emo:{en:"For the mood that asks nobody's permission.", sv:"För humöret som inte ber någon om lov."},
       tags:["Party","Evening","Autumn"],
       imgs:["https://tryscent.co/cdn/shop/files/WildRebel.png?width=800",
         "https://tryscent.co/cdn/shop/files/Fabulous_Tom_Ford.avif?width=800"]},

      {name:"Apple Sandalwood", no:"234", productId:7892877901894, accent:"#b03a5b", accent2:"#732239",
       desc:"Inspired by Hugo Boss Boss Bottled.",
       emo:{en:"Clean and calm, like having it all handled.", sv:"Ren och lugn, som att ha full koll på läget."},
       tags:["Office","Everyday","Autumn"],
       imgs:["https://tryscent.co/cdn/shop/files/apple_cinnamon_woods.png?width=800",
         "https://tryscent.co/cdn/shop/files/Hugo_Boss_Boss_Bottled.avif?width=800"]},

      {name:"MY WAY", no:"140", productId:8245970042950, accent:"#4a6f8f", accent2:"#2b4258",
       desc:"Inspired by Giorgio Armani MY WAY.",
       emo:{en:"Smells like trusting yourself completely.", sv:"Doftar som att lita helt på dig själv."},
       tags:["Office","Everyday","Autumn"],
       imgs:["https://tryscent.co/cdn/shop/files/140W_c.webp?width=800",
         "https://tryscent.co/cdn/shop/files/Giorgio_Armani_MY_WAY.webp?width=800"]},

      {name:"Midnight Oud", no:"286M", productId:7902310170694, accent:"#6f8f6a", accent2:"#455c41",
       desc:"Inspired by Tom Ford Ombre Nomade.",
       emo:{en:"Deep and dark, with secrets it won't share.", sv:"Djup och mörk, med hemligheter för sig själv."},
       tags:["Party","Evening","Autumn"],
       imgs:["https://tryscent.co/cdn/shop/files/MidnightOud.png?width=800",
         "https://tryscent.co/cdn/shop/files/Tom_Ford_Ombre_Nomade.avif?width=800"]},

      {name:"La Belle", no:"412", productId:8245969944646, accent:"#b0623a", accent2:"#78401f",
       desc:"Inspired by Jean Paul Gaultier La Belle.",
       emo:{en:"Sweet, bold, and completely irresistible.", sv:"Söt, djärv och helt oemotståndlig."},
       tags:["Date","Evening","Autumn"],
       imgs:["https://tryscent.co/cdn/shop/files/412W_c.webp?width=800",
         "https://tryscent.co/cdn/shop/files/la_belle.webp?width=800"]},

      {name:"Royal Oud", no:"287", productId:7902416371782, accent:"#7a5a8f", accent2:"#4c3560",
       desc:"Inspired by Tom Ford Oud Wood.",
       emo:{en:"Rich, warm, and just a little bit royal.", sv:"Rik och varm, med en liten kunglig känsla."},
       tags:["Party","Evening","Autumn"],
       imgs:["https://tryscent.co/cdn/shop/files/RoyalOud.png?width=800",
         "https://tryscent.co/cdn/shop/files/tobacco_vanille.jpg?width=800"]},

      {name:"Tobacco Vanille", no:"193", productId:8245969846342, accent:"#4a90a4", accent2:"#2c5a68",
       desc:"Inspired by Tom Ford Tobacco Vanille.",
       emo:{en:"Warm and rich, pleasure with zero guilt.", sv:"Varm och rik, en njutning utan dåligt samvete."},
       tags:["Party","Evening","Autumn"],
       imgs:["https://tryscent.co/cdn/shop/files/193W_c.webp?width=800",
         "https://tryscent.co/cdn/shop/files/tobacco_vanille.jpg?width=800"]},

      {name:"Signature Blend", no:"227", productId:7902529683526, accent:"#8a7a5a", accent2:"#5c5039",
       desc:"Inspired by Hermes Terre d'Hermes.",
       emo:{en:"Grounded and steady, sure of who you are.", sv:"Jordnära och trygg, säker på vem du är."},
       tags:["Office","Everyday","Autumn"],
       imgs:["https://tryscent.co/cdn/shop/files/SignatureBlend-No.227.png?width=800",
         "https://tryscent.co/cdn/shop/files/Hermes_Terre_d_Hermes.avif?width=800"]},

      {name:"Mademoiselle Intense", no:"067", productId:8245970272326, accent:"#a97b2e", accent2:"#6e4d17",
       desc:"Inspired by Chanel Coco Mademoiselle Intense.",
       emo:{en:"Polished elegance with a wicked little edge.", sv:"Polerad elegans med en liten farlig kant."},
       tags:["Date","Evening","Autumn"],
       imgs:["https://tryscent.co/cdn/shop/files/067W_c.webp?width=800",
         "https://tryscent.co/cdn/shop/files/Chanel_Coco_Mademoiselle_Intense.png?width=800"]},

      {name:"Bleu", no:"252", productId:8245969748038, accent:"#b03a5b", accent2:"#732239",
       desc:"Inspired by Chanel Bleu.",
       emo:{en:"The smell of staying cool under pressure.", sv:"Doften av att alltid hålla huvudet kallt."},
       tags:["Office","Everyday","Autumn"],
       imgs:["https://tryscent.co/cdn/shop/files/252M_c.webp?width=800",
         "https://tryscent.co/cdn/shop/files/chanel_bleu.jpg?width=800"]},

      {name:"Coco", no:"079", productId:8245969682502, accent:"#4a6f8f", accent2:"#2b4258",
       desc:"Inspired by Chanel Coco Mademoiselle.",
       emo:{en:"Classy, flirty, and completely at ease.", sv:"Klassisk, flörtig och trygg i sig själv."},
       tags:["Party","Evening","Autumn"],
       imgs:["https://tryscent.co/cdn/shop/files/079W_c.webp?width=800",
         "https://tryscent.co/cdn/shop/files/Chanel_Coco_Mademoiselle.avif?width=800"]},

      {name:"One Million Elixir", no:"334", productId:8245968732230, accent:"#6f8f6a", accent2:"#455c41",
       desc:"Inspired by Paco Rabanne 1 Million Elixir.",
       emo:{en:"Intense, magnetic, and hard to forget.", sv:"Intensiv, magnetisk och svår att glömma."},
       tags:["Party","Evening","Autumn"],
       imgs:["https://tryscent.co/cdn/shop/files/334M_c.webp?width=800",
         "https://tryscent.co/cdn/shop/files/1_Million_Elixir.webp?width=800"]},

      {name:"Allure Homme Sport", no:"222", productId:8245969059910, accent:"#b0623a", accent2:"#78401f",
       desc:"Inspired by Chanel Allure Homme Sport.",
       emo:{en:"Fresh energy, like you already won the day.", sv:"Fräsch energi, som att redan ha vunnit dagen."},
       tags:["Office","Everyday","Autumn"],
       imgs:["https://tryscent.co/cdn/shop/files/222Mc.webp?width=800",
         "https://tryscent.co/cdn/shop/files/Allure_Homme_Sport.webp?width=800"]},

      {name:"Sage Cedar", no:"283", productId:7892877770822, accent:"#7a5a8f", accent2:"#4c3560",
       desc:"Inspired by Yves Saint Laurent Y.",
       emo:{en:"For the version of you that goes for it.", sv:"För den version av dig som vågar satsa."},
       tags:["Office","Everyday","Autumn"],
       imgs:["https://tryscent.co/cdn/shop/files/ysl-y-edp.png?width=800",
         "https://tryscent.co/cdn/shop/files/Yves_Saint_Laurent_Y.avif?width=800"]},

      {name:"Floral Amber", no:"437", productId:7892876623942, accent:"#4a90a4", accent2:"#2c5a68",
       desc:"Inspired by Prada Paradoxe.",
       emo:{en:"Sophisticated with just enough edge.", sv:"Sofistikerad med precis rätt kant."},
       tags:["Office","Everyday","Summer"],
       imgs:["https://tryscent.co/cdn/shop/files/WhiteFloralsAmber.png?width=800",
         "https://tryscent.co/cdn/shop/files/Prada_Paradoxe.avif?width=800"]},

      {name:"Cocoa Tonka", no:"461", productId:7892877049926, accent:"#8a7a5a", accent2:"#5c5039",
       desc:"Inspired by Carolina Herrera Good Girl.",
       emo:{en:"Sweet on the surface, trouble underneath.", sv:"Söt på ytan, med en mörkare sida under."},
       tags:["Date","Evening","Autumn"],
       imgs:["https://tryscent.co/cdn/shop/files/JasmineCocoaTonka.png?width=800",
         "https://tryscent.co/cdn/shop/files/Carolina_Herrera_Good_Girl.avif?width=800"]}
    ];

    /* 6x50ml bundle PDP - single destination for every shop CTA.
       Prefill contract: BUNDLE_URL + '?scents=' + up to 6 saved productIds.
       BUNDLE_URL comes from settings.scent_quiz_bundle_product (theme settings). */
    var BUNDLE_URL = (window.SQ_QUIZ_CONFIG && window.SQ_QUIZ_CONFIG.bundleUrl) || "";
    function bundleLink(){
      var ids = state.liked.map(function(s){ return s.productId; }).slice(0,6);
      if(!BUNDLE_URL) return '#';
      return ids.length ? BUNDLE_URL + '?scents=' + ids.join(',') : BUNDLE_URL;
    }

    /* Real photo per index: 0 = product bottle, 1 = inspiration bottle.
       Graceful SVG gradient fallback ONLY when a URL is missing. */
    var IMG_LABELS = ["Bottle","Inspiration"];
    function imgSrc(scent, photoIdx){
      if(scent.imgs && scent.imgs[photoIdx]) return scent.imgs[photoIdx];
      var label = IMG_LABELS[photoIdx] || ("Photo " + (photoIdx+1));
      var svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">'+
    '<defs><linearGradient id="g" x1="0" y1="0" x2="'+(photoIdx%2? '0':'1')+'" y2="1">'+
    '<stop offset="0" stop-color="'+scent.accent+'"/>'+
    '<stop offset="1" stop-color="'+scent.accent2+'"/></linearGradient></defs>'+
    '<rect width="600" height="800" fill="url(#g)"/>'+
    '<circle cx="'+(120+photoIdx*90)+'" cy="200" r="130" fill="rgba(255,255,255,.10)"/>'+
    '<circle cx="'+(480-photoIdx*70)+'" cy="560" r="180' +'" fill="rgba(0,0,0,.10)"/>'+
    '<text x="300" y="360" text-anchor="middle" font-family="Georgia,serif" font-size="44" fill="rgba(255,255,255,.92)">'+scent.name+'</text>'+
    '<text x="300" y="410" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" fill="rgba(255,255,255,.75)">'+label+' &#183; '+(photoIdx+1)+' / '+scent.imgs.length+'</text>'+
    '</svg>';
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    }

    /* ---------------- State ---------------- */
    var state = { pos:0, liked:[], history:[] };
    var root = document.getElementById('scent-quiz-popup-overlay');
    var deckEl = document.getElementById('sq-deck');
    var TOTAL = SCENTS.length;
    var MAX_PICKS = 6; // bundle holds 6 scents - hard cap on right swipes

    /* ---------------- Utilities ---------------- */
    function vibrate(ms){ try{ if(navigator.vibrate) navigator.vibrate(ms); }catch(e){} }
    function show(id){
      var els=root.querySelectorAll('.screen');
      for(var i=0;i<els.length;i++) els[i].classList.remove('active');
      document.getElementById(id).classList.add('active');
    }

    /* ---------------- Analytics ----------------
       Fires to GTM dataLayer, Meta Pixel (fbq) and GA4 (gtag) if present.
       Every funnel step is tracked so this popup can actually be optimized. */
    function track(event, params){
      params = params || {};
      try{ if(window.dataLayer) window.dataLayer.push(Object.assign({event:'scent_'+event}, params)); }catch(e){}
      try{ if(window.fbq) window.fbq('trackCustom', 'Scent'+event.replace(/(^|_)(\w)/g,function(m,a,b){return b.toUpperCase();}), params); }catch(e){}
      try{ if(window.gtag) window.gtag('event', 'scent_'+event, params); }catch(e){}
    }

    /* ---------------- Early-exit "see my matches" ---------------- */
    var SEE_AFTER = 5; // show the escape hatch once they've engaged
    function updateSeeMatches(){
      var btn=document.getElementById('sq-seeMatches');
      if(!btn) return;
      var eligible = state.pos>0 && state.pos<TOTAL && (state.pos>=SEE_AFTER || state.liked.length>=3);
      document.getElementById('sq-seeCount').textContent=state.liked.length;
      btn.hidden = !eligible;
    }

    /* ---------------- Intro preview thumbs ----------------
       Built lazily (on first popup open, see openPopup() below) instead of
       on page load, so these 3 CDN images are never fetched for visitors
       who never open the quiz. */
    var introPreviewBuilt=false;
    function buildIntroPreview(){
      if(introPreviewBuilt) return;
      introPreviewBuilt=true;
      var p=document.getElementById('sq-introPreview');
      var picks=[SCENTS[2],SCENTS[0],SCENTS[4]];
      for(var i=0;i<picks.length;i++){
        var d=document.createElement('div'); d.className='pc';
        var im=document.createElement('img'); im.src=imgSrc(picks[i],0); im.alt=picks[i].name; im.loading='lazy';
        d.appendChild(im); p.appendChild(d);
      }
    }

    /* ---------------- Card builder ---------------- */
    function buildCard(scent, idx){
      var card=document.createElement('div');
      card.className='card'; card.dataset.idx=idx; card._imgIndex=0; card._theme=scent;

      var photo=document.createElement('div'); photo.className='photo';
      var imgEls=[];
      var nImgs=Math.min(scent.imgs.length,5);
      for(var i=0;i<nImgs;i++){
    var im=document.createElement('img');
    im.alt=scent.name+' scent';
    if(i===0){ im.src=imgSrc(scent,0); im.className='show'; }
    im.decoding='async';
    photo.appendChild(im); imgEls.push(im);
      }
      card._imgEls=imgEls;

      var pips=document.createElement('div'); pips.className='pips';
      for(var j=0;j<nImgs;j++){ var pip=document.createElement('i'); if(j===0)pip.className='on'; pips.appendChild(pip); }
      photo.appendChild(pips); card._pips=pips;

      // tap zones to cycle photos
      var tl=document.createElement('div'); tl.className='tap-hint l';
      var tr=document.createElement('div'); tr.className='tap-hint r';
      photo.appendChild(tl); photo.appendChild(tr);

      // stamps
      var love=document.createElement('div'); love.className='stamp love'; love.textContent='Älskar';
      var skip=document.createElement('div'); skip.className='stamp skip'; skip.textContent='Hoppa';
      photo.appendChild(love); photo.appendChild(skip);
      card._love=love; card._skip=skip;

      // persistent swipe-direction cues (fade out as the card is dragged)
      var cueL=document.createElement('div'); cueL.className='dir-cue l';
      cueL.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>Hoppa över';
      var cueR=document.createElement('div'); cueR.className='dir-cue r';
      cueR.innerHTML='Spara<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
      photo.appendChild(cueL); photo.appendChild(cueR);
      card._cueL=cueL; card._cueR=cueR;

      var info=document.createElement('div'); info.className='info';
      var tagHtml='';
      for(var t=0;t<scent.tags.length;t++) tagHtml+='<span>'+(TAG_SV[scent.tags[t]]||scent.tags[t])+'</span>';
      info.innerHTML =
    '<div class="cat"><span class="dot" style="background:'+scent.accent+'"></span>'+(scent.no ? 'Nr '+scent.no : 'Doftprofil')+'</div>'+
    '<h2>'+scent.name+'</h2>'+
    (scent.emo ? '<p class="desc emo-lead">'+(scent.emo[QUIZ_LANG]||scent.emo.en)+'</p>' : '')+
    '<p class="desc inspired">'+scent.desc.replace('Inspired by','Inspirerad av')+'</p>'+
    '<div class="tags">'+tagHtml+'</div>'+
    '<span class="shop-mode"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/></svg>Spara nu, shoppa ditt board i slutet</span>';

      card.appendChild(photo); card.appendChild(info);
      bindPhotoTaps(card, tl, tr);
      return card;
    }

    function setImg(card, idx){
      var els=card._imgEls; if(!els||!els.length) return;
      idx=(idx+els.length)%els.length;
      card._imgIndex=idx;
      for(var i=0;i<els.length;i++){
    if(i===idx){
      if(!els[i].src) els[i].src=imgSrc(card._theme,i);
      els[i].classList.add('show');
    } else els[i].classList.remove('show');
    card._pips.children[i].className = (i===idx)?'on':'';
      }
    }

    function bindPhotoTaps(card, tl, tr){
      tl.addEventListener('click', function(e){ e.stopPropagation(); setImg(card, card._imgIndex-1); });
      tr.addEventListener('click', function(e){ e.stopPropagation(); setImg(card, card._imgIndex+1); });
    }

    /* ---------------- Deck window rendering ---------------- */
    function renderDeck(){
      deckEl.innerHTML='';
      // render up to 3 upcoming, farthest first so nearest is on top (last child)
      var end=Math.min(state.pos+3, TOTAL);
      for(var i=end-1;i>=state.pos;i--){
    var card=buildCard(SCENTS[i], i);
    deckEl.appendChild(card);
      }
      applyDepth();
      bindTop();
      updateProgress();
    }
    function topCard(){ return deckEl.lastElementChild; }
    function applyDepth(){
      var kids=deckEl.children; var n=kids.length;
      for(var i=0;i<n;i++){
    var depth=n-1-i; // 0 = top
    var c=kids[i];
    if(!c.classList.contains('dragging')){
      c.style.transition='transform .35s cubic-bezier(.2,.8,.2,1)';
      c.style.transform='translateY('+(depth*10)+'px) scale('+(1-depth*0.04)+')';
      c.style.zIndex=String(10+i);
    }
    c.style.pointerEvents = (i===n-1)?'auto':'none';
      }
    }
    function updateProgress(){
      // Progress toward the 6-pick bundle goal, not raw position in the
      // 24-card deck - reaching 6 saves is what "finishes" the quiz.
      var pct=(state.liked.length/MAX_PICKS)*100;
      document.getElementById('sq-progressBar').style.width=pct+'%';
    }

    /* ---------------- Swipe engine ---------------- */
    var drag={active:false, startX:0, startY:0, dx:0, dy:0, card:null, moved:false, id:null};
    function bindTop(){
      var c=topCard(); if(!c) return;
      c.addEventListener('pointerdown', onDown);
    }
    function onDown(e){
      if(e.button && e.button!==0) return;
      var c=e.currentTarget;
      if(c!==topCard()) return;
      cancelDemo();
      drag.active=true; drag.card=c; drag.startX=e.clientX; drag.startY=e.clientY; drag.dx=0; drag.dy=0; drag.moved=false; drag.id=e.pointerId;
      c.classList.add('dragging');
      try{ c.setPointerCapture(e.pointerId); }catch(err){}
      c.addEventListener('pointermove', onMove);
      c.addEventListener('pointerup', onUp);
      c.addEventListener('pointercancel', onUp);
    }
    function onMove(e){
      if(!drag.active) return;
      drag.dx=e.clientX-drag.startX; drag.dy=e.clientY-drag.startY;
      if(Math.abs(drag.dx)>6 || Math.abs(drag.dy)>6) drag.moved=true;
      var rot=drag.dx*0.06;
      drag.card.style.transform='translate('+drag.dx+'px,'+drag.dy+'px) rotate('+rot+'deg)';
      var p=Math.min(Math.abs(drag.dx)/90,1);
      drag.card._love.style.opacity = drag.dx>0 ? p : 0;
      drag.card._skip.style.opacity = drag.dx<0 ? p : 0;
      // fade the resting cues out as the drag builds, so the big stamps take over
      var cueFade=Math.max(0, 0.9 - p*1.5);
      if(drag.card._cueL) drag.card._cueL.style.opacity=cueFade;
      if(drag.card._cueR) drag.card._cueR.style.opacity=cueFade;
    }
    function onUp(e){
      if(!drag.active) return;
      var c=drag.card; drag.active=false;
      c.removeEventListener('pointermove', onMove);
      c.removeEventListener('pointerup', onUp);
      c.removeEventListener('pointercancel', onUp);
      c.classList.remove('dragging');
      var THRESH=95;
      if(drag.dx>THRESH){ commitSwipe(c,1); }
      else if(drag.dx<-THRESH){ commitSwipe(c,-1); }
      else if(!drag.moved){
    // treat as tap: which side of the photo?
    var rect=c.getBoundingClientRect();
    var rel=(e.clientX-rect.left)/rect.width;
    if(e.clientY-rect.top < rect.height*0.62){ // tapped photo area
      if(rel>0.55) setImg(c, c._imgIndex+1); else if(rel<0.45) setImg(c, c._imgIndex-1);
    }
    springBack(c);
      } else { springBack(c); }
    }
    function springBack(c){
      c._love.style.opacity=0; c._skip.style.opacity=0;
      if(c._cueL) c._cueL.style.opacity=.9;
      if(c._cueR) c._cueR.style.opacity=.9;
      applyDepth();
    }

    /* like=1, skip=-1 */
    function commitSwipe(card, dir){
      cancelDemo();
      // hard cap: bundle only fits MAX_PICKS scents
      if(dir>0 && state.liked.length>=MAX_PICKS){
    toast("Ditt bundle är fullt, 6 dofter valda");
    springBack(card);
    updateSeeMatches();
    return;
      }
      document.getElementById('sq-deck-screen').classList.add('swiped'); // hide hint + stop nudge after first swipe
      var idx=parseInt(card.dataset.idx,10);
      var scent=SCENTS[idx];
      card.style.transition='transform .42s cubic-bezier(.4,0,.4,1), opacity .42s';
      var offX=dir>0?window.innerWidth:-window.innerWidth;
      card.style.transform='translate('+(offX*1.1)+'px,'+(drag.dy||0)+'px) rotate('+(dir*22)+'deg)';
      card.style.opacity='0';

      state.history.push({idx:idx, dir:dir, wasLiked:dir>0});
      track('swipe', {scent:scent.name, action:dir>0?'save':'skip', position:state.pos+1, saved:state.liked.length + (dir>0?1:0)});
      // Give the progress bar instant feedback at swipe time instead of
      // waiting ~250ms for the outgoing card's exit animation to finish
      // (state.liked itself still only gets pushed to below, and state.pos
      // only advances once that animation completes in the setTimeout
      // below, so the new top card and everything else stays in sync).
      // Only saves move the bar - it tracks progress toward the 6-pick
      // bundle goal, so skips leave it unchanged.
      var likedAfterThisSwipe = state.liked.length + (dir>0?1:0);
      document.getElementById('sq-progressBar').style.width = (likedAfterThisSwipe/MAX_PICKS*100)+'%';
      if(dir>0){
    state.liked.push(scent);
    onLike(card);
      } else {
    vibrate(8);
      }
      document.getElementById('sq-undoBtn').disabled=false;

      setTimeout(function(){
    if(card.parentNode) card.parentNode.removeChild(card);
    state.pos++;
    // add a new card at the back if available
    var back=state.pos+2;
    if(back<TOTAL){
      var nc=buildCard(SCENTS[back], back);
      deckEl.insertBefore(nc, deckEl.firstElementChild);
    }
    applyDepth(); bindTop(); updateProgress(); updateSeeMatches();
    maybeCoach();
    // 6th save = bundle full -> straight to results with the picks prefilled
    if(state.liked.length>=MAX_PICKS){
      setTimeout(function(){ finish('bundle_full'); }, 900);
      return;
    }
    if(state.pos>=TOTAL) finish();
      }, dir>0?260:220);
    }

    function onLike(card){
      vibrate([10,30,14]);
      bumpCount();
      heartBurst();
      var n=state.liked.length;
      var msgs={1:"Sparad till ditt board!", 3:"Bra smak, 3 sparade", 5:"5 av 6 valda", 6:"Det blev 6, ditt bundle är fullt!"};
      if(msgs[n]) toast(msgs[n]);
    }
    function bumpCount(){
      var chip=document.getElementById('sq-countChip');
      document.getElementById('sq-countNum').textContent=state.liked.length;
      chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump');
    }
    function toast(msg){
      var t=document.getElementById('sq-toast');
      document.getElementById('sq-toastMsg').textContent=msg;
      t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
    }

    /* floating hearts on like */
    function heartBurst(){
      var app=document.getElementById('sq-app');
      var rect=app.getBoundingClientRect();
      var cx=rect.width*0.5, cy=rect.height*0.5;
      for(var i=0;i<10;i++){
    (function(i){
      var el=document.createElement('div'); el.className='particle';
      var size=12+Math.random()*16;
      el.innerHTML='<svg viewBox="0 0 24 24" width="'+size+'" height="'+size+'" fill="#b03a5b"><path d="M12 21s-6.7-4.35-9.33-8.24C.9 10.02 1.9 6.5 5.1 5.66c1.98-.52 3.9.37 4.9 1.98C11 6.03 12.92 5.14 14.9 5.66c3.2.84 4.2 4.36 2.43 7.1C18.7 16.65 12 21 12 21z"/></svg>';
      el.style.left=cx+'px'; el.style.top=cy+'px'; el.style.opacity='1';
      app.appendChild(el);
      var ang=(-90 + (Math.random()*120-60))*Math.PI/180;
      var dist=90+Math.random()*130;
      var tx=Math.cos(ang)*dist, ty=Math.sin(ang)*dist - 40;
      var dur=650+Math.random()*450;
      el.animate([
        {transform:'translate(-50%,-50%) translate(0,0) scale(.4) rotate(0deg)', opacity:1},
        {transform:'translate(-50%,-50%) translate('+tx+'px,'+ty+'px) scale(1.1) rotate('+(Math.random()*180-90)+'deg)', opacity:0}
      ],{duration:dur, easing:'cubic-bezier(.2,.6,.3,1)'}).onfinish=function(){ if(el.parentNode) el.parentNode.removeChild(el); };
    })(i);
      }
    }

    /* petal confetti on results */
    function petalShower(){
      var app=document.getElementById('sq-app'); var rect=app.getBoundingClientRect();
      var colors=['#b03a5b','#c9a961','#e8d9b8','#8b917d','#9b8fb5','#23233a'];
      for(var i=0;i<26;i++){
    (function(i){
      var el=document.createElement('div'); el.className='particle';
      var s=8+Math.random()*10;
      el.style.width=s+'px'; el.style.height=(s*1.5)+'px';
      el.style.background=colors[i%colors.length];
      el.style.borderRadius='60% 60% 60% 60% / 80% 80% 40% 40%';
      var startX=Math.random()*rect.width;
      el.style.left=startX+'px'; el.style.top='-20px';
      app.appendChild(el);
      var drift=(Math.random()*120-60);
      var dur=2200+Math.random()*1600;
      el.animate([
        {transform:'translateY(-20px) translateX(0) rotate(0deg)', opacity:1},
        {transform:'translateY('+(rect.height+40)+'px) translateX('+drift+'px) rotate('+(Math.random()*720-360)+'deg)', opacity:.9}
      ],{duration:dur, easing:'linear'}).onfinish=function(){ if(el.parentNode) el.parentNode.removeChild(el); };
    })(i);
      }
    }

    /* teaching demo on first card */
    var coachShown=false;
    var demoAnims=[];
    function maybeCoach(){ /* first-card demo runs once via showCoach() */ }
    function cancelDemo(){
      for(var i=0;i<demoAnims.length;i++){ try{ demoAnims[i].cancel(); }catch(e){} }
      demoAnims=[];
      var c=topCard();
      if(c){ if(c._love) c._love.style.opacity=0; if(c._skip) c._skip.style.opacity=0; }
    }
    function showCoach(){
      if(coachShown) return; coachShown=true;
      var c=topCard(); if(!c || !c.animate) return;
      var dur=2400, iters=2;
      // physically demonstrate the gesture: swing right (SAVE), back, left (SKIP), back - twice
      var cardA=c.animate([
    {transform:'translateX(0) rotate(0deg)', offset:0},
    {transform:'translateX(84px) rotate(7deg)', offset:.2},
    {transform:'translateX(0) rotate(0deg)', offset:.4},
    {transform:'translateX(-84px) rotate(-7deg)', offset:.6},
    {transform:'translateX(0) rotate(0deg)', offset:.8},
    {transform:'translateX(0) rotate(0deg)', offset:1}
      ],{duration:dur, iterations:iters, easing:'ease-in-out'});
      var loveA=c._love.animate([
    {opacity:0,offset:0},{opacity:1,offset:.2},{opacity:0,offset:.38},{opacity:0,offset:1}
      ],{duration:dur, iterations:iters, easing:'ease-in-out'});
      var skipA=c._skip.animate([
    {opacity:0,offset:0},{opacity:0,offset:.42},{opacity:1,offset:.6},{opacity:0,offset:.78},{opacity:0,offset:1}
      ],{duration:dur, iterations:iters, easing:'ease-in-out'});
      demoAnims=[cardA,loveA,skipA];
      cardA.onfinish=function(){ cancelDemo(); };
    }

    /* ---------------- Undo ---------------- */
    function undo(){
      if(!state.history.length) return;
      var last=state.history.pop();
      if(last.wasLiked){
    // remove from liked (last matching)
    for(var i=state.liked.length-1;i>=0;i--){ if(state.liked[i]===SCENTS[last.idx]){ state.liked.splice(i,1); break; } }
    bumpCount();
      }
      // if we're on results, go back to deck
      if(document.getElementById('sq-results').classList.contains('active')){
    show('sq-deck-screen');
      }
      state.pos=Math.max(0,state.pos-1);
      renderDeck();
      // animate the restored top card back in from its swiped side
      var c=topCard();
      if(c){
    var from=last.dir>0?window.innerWidth:-window.innerWidth;
    c.style.transition='none';
    c.style.transform='translate('+(from)+'px,0) rotate('+(last.dir*20)+'deg)';
    void c.offsetWidth;
    c.style.transition='transform .45s cubic-bezier(.2,.8,.2,1)';
    applyDepth();
      }
      document.getElementById('sq-undoBtn').disabled = state.history.length===0;
      vibrate(8);
    }

    /* ---------------- Finish / results ---------------- */
    function finish(source){
      track('results', {saved:state.liked.length, source:source||'completed', seen:state.pos});
      buildResults();
      if(source==='bundle_full'){
    document.getElementById('sq-resTitle').textContent='Ditt bundle med 6 dofter är redo';
    document.getElementById('sq-resSub').textContent='Alla 6 val ligger redan i ditt bundle nedan, ett tryck för att bygga det.';
      }
      show('sq-results');
      document.getElementById('sq-results').scrollTop=0;
      var sm=document.getElementById('sq-seeMatches'); if(sm) sm.hidden=true;
      setTimeout(petalShower, 250);
    }
    function buildResults(){
      var liked=state.liked;
      var board=document.getElementById('sq-board');
      var empty=document.getElementById('sq-results').querySelector('.res-empty');
      if(empty) empty.parentNode.removeChild(empty);
      board.innerHTML='';

      // recompute the bundle prefill link from current picks (up to 6)
      var link=bundleLink();
      var shopAllEl=document.getElementById('sq-shopAll');
      shopAllEl.href=link;
      shopAllEl.textContent = liked.length
    ? 'Bygg mitt bundle ('+Math.min(liked.length,6)+' av 6 valda)'
    : 'Bygg mitt bundle med 6 dofter';
      document.getElementById('sq-lsCta').href=link;

      document.getElementById('sq-boardCnt').textContent = liked.length + (liked.length===1?' doft':' dofter');

      if(liked.length===0){
    document.getElementById('sq-resTitle').textContent="Hittade du ingen match?";
    document.getElementById('sq-resSub').textContent="Ingen fara. Bläddra bland alla dofter nedan eller kör en runda till.";
    var bt=root.querySelector('.board-title'); if(bt) bt.style.display='none';
    var e=document.createElement('div'); e.className='res-empty';
    e.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.7-4.35-9.33-8.24C.9 10.02 1.9 6.5 5.1 5.66c1.98-.52 3.9.37 4.9 1.98C11 6.03 12.92 5.14 14.9 5.66c3.2.84 4.2 4.36 2.43 7.1C18.7 16.65 12 21 12 21z"/></svg><h3>Inget sparat ännu</h3><p>Alla är olika. Utforska hela kollektionen och hitta din doft.</p>';
    board.parentNode.insertBefore(e, board);
    return;
      }
      var bt=root.querySelector('.board-title'); if(bt) bt.style.display='';
      document.getElementById('sq-resTitle').textContent = liked.length===1 ? "Din perfekta match" : "Ditt doftboard";

      for(var i=0;i<liked.length;i++){
    var th=liked[i];
    var a=document.createElement('a');
    a.className='bcard'; a.href=link; a.target='_blank'; a.rel='noopener'; a.dataset.scent=th.name;
    a.innerHTML=
      '<div class="bimg"><span class="dot" style="background:'+th.accent+'"></span><img src="'+imgSrc(th,0)+'" alt="'+th.name+'" loading="lazy"></div>'+
      '<div class="bbody"><div class="bname">'+th.name+'</div>'+
      '<div class="blink">Shoppa doften <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div></div>';
    board.appendChild(a);
      }
    }

    /* ---------------- Email capture (Klaviyo) ---------------- */
    function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
    document.getElementById('sq-leadForm').addEventListener('submit', function(e){
      e.preventDefault();
      var submitBtn=document.getElementById('sq-leadSubmitBtn');
      if(submitBtn.disabled) return; // request already in flight
      var input=document.getElementById('sq-emailInput');
      var email=input.value.trim();
      if(!validEmail(email)){ input.classList.add('err'); input.focus(); return; }
      input.classList.remove('err');
      var likedNames=state.liked.map(function(t){return t.name;});
      submitLead(email, likedNames);
    });

    function showLeadSuccess(){
      document.getElementById('sq-leadForm').style.display='none';
      document.getElementById('sq-leadSuccess').classList.add('show');
      vibrate([10,40,10]);
    }

    function setLeadSubmitting(isSubmitting){
      var btn=document.getElementById('sq-leadSubmitBtn');
      var label=document.getElementById('sq-leadSubmitLabel');
      btn.disabled=isSubmitting;
      label.textContent=isSubmitting ? 'Skickar...' : 'Skicka mitt board';
    }

    function submitLead(email, likedScents){
      var prefill=bundleLink();
      track('email_submit', {saved:likedScents.length, scents:likedScents.join(', '), bundle_url:prefill});
      document.getElementById('sq-lsCta').href=prefill;

      if(!KLAVIYO_CONFIG.enabled){
    // Klaviyo isn't configured in theme settings yet - preview the success
    // state without sending the email anywhere.
    showLeadSuccess();
    return;
      }

      setLeadSubmitting(true);

      fetch('https://a.klaviyo.com/client/subscriptions/?company_id='+encodeURIComponent(KLAVIYO_CONFIG.publicApiKey), {
    method:'POST',
    headers:{'Content-Type':'application/json','revision':'2024-10-15'},
    body: JSON.stringify({ data:{ type:'subscription',
      attributes:{
        profile:{ data:{ type:'profile', attributes:{ email:email,
          properties:{ scent_match_scents: likedScents, scent_match_bundle_url: prefill } } } },
        custom_source:'Scent Match'
      },
      relationships:{ list:{ data:{ type:'list', id:KLAVIYO_CONFIG.listId } } }
    }})
      }).then(function(res){
    // Klaviyo's subscribe endpoint returns 202 Accepted with no body.
    if(!res.ok && res.status!==202){ throw new Error('Klaviyo request failed: '+res.status); }
    setLeadSubmitting(false);
    showLeadSuccess();
      }).catch(function(err){
    try{ console.error('[scent quiz] Klaviyo subscribe failed', err); }catch(e){}
    setLeadSubmitting(false);
    toast('Något gick fel, försök igen');
      });
    }

    /* ---------------- Wire up controls ---------------- */
    document.getElementById('sq-startBtn').addEventListener('click', function(){
      track('start', {total:TOTAL});
      document.getElementById('sq-deck-screen').classList.remove('swiped');
      renderDeck();
      show('sq-deck-screen');
      updateSeeMatches();
      setTimeout(showCoach, 500);
    });
    document.getElementById('sq-loveBtn').addEventListener('click', function(){ var c=topCard(); if(c) commitSwipe(c,1); });
    document.getElementById('sq-skipBtn').addEventListener('click', function(){ var c=topCard(); if(c) commitSwipe(c,-1); });
    document.getElementById('sq-undoBtn').addEventListener('click', undo);
    document.getElementById('sq-seeMatches').addEventListener('click', function(){ finish('early'); });
    document.getElementById('sq-retakeBtn').addEventListener('click', function(){
      track('retake', {});
      state={pos:0, liked:[], history:[]}; coachShown=false;
      document.getElementById('sq-deck-screen').classList.remove('swiped');
      document.getElementById('sq-countNum').textContent='0';
      document.getElementById('sq-undoBtn').disabled=true;
      document.getElementById('sq-seeMatches').hidden=true;
      document.getElementById('sq-leadForm').style.display='';
      document.getElementById('sq-leadSuccess').classList.remove('show');
      document.getElementById('sq-emailInput').value='';
      document.getElementById('sq-emailInput').classList.remove('err');
      setLeadSubmitting(false);
      renderDeck();
      show('sq-deck-screen');
      updateSeeMatches();
      setTimeout(showCoach, 500);
    });
    document.getElementById('sq-shopAll').setAttribute('href', BUNDLE_URL || '#');

    /* shop-click tracking (delegated so it survives board re-renders) */
    document.getElementById('sq-board').addEventListener('click', function(e){
      var a=e.target.closest ? e.target.closest('.bcard') : null;
      if(a) track('shop_click', {scent:a.dataset.scent||'', where:'board'});
    });
    document.getElementById('sq-shopAll').addEventListener('click', function(){ track('shop_click', {where:'browse_all'}); });
    document.getElementById('sq-lsCta').addEventListener('click', function(){ track('shop_click', {where:'post_email'}); });

    /* ---------------- Popup open/close + trigger ---------------- */
    var overlay = root;
    var fab = document.getElementById('scent-quiz-fab');
    var closeBtn = document.getElementById('sq-close');
    var cfg = window.SQ_QUIZ_CONFIG || {};

    /* Fraunces/Nunito Sans are only used inside the popup, so the
       stylesheet is fetched on demand instead of on every page load -
       warmed on hover/focus of the trigger button, guaranteed before the
       popup itself first opens (manually or auto). */
    var fontsRequested=false;
    function ensureFontsLoaded(){
      if(fontsRequested) return;
      fontsRequested=true;
      var link=document.createElement('link');
      link.rel='stylesheet';
      link.href='https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Nunito+Sans:wght@400;600;700&display=swap';
      document.head.appendChild(link);
    }
    if(fab){
      fab.addEventListener('pointerenter', ensureFontsLoaded, {once:true});
      fab.addEventListener('focus', ensureFontsLoaded, {once:true});
    }

    function openPopup(source){
      ensureFontsLoaded();
      buildIntroPreview();
      overlay.hidden = false;
      requestAnimationFrame(function(){ overlay.classList.add('sq-open'); });
      document.documentElement.classList.add('sq-scroll-lock');
      document.body.classList.add('sq-scroll-lock');
      track('popup_open', {source:source||'unknown'});
      if(closeBtn) closeBtn.focus();
    }
    function closePopup(){
      if(overlay.hidden) return;
      overlay.classList.remove('sq-open');
      document.documentElement.classList.remove('sq-scroll-lock');
      document.body.classList.remove('sq-scroll-lock');
      track('popup_close', {});
      setTimeout(function(){ overlay.hidden = true; }, 300);
    }

    if(fab) fab.addEventListener('click', function(){ openPopup('fab'); });
    if(closeBtn) closeBtn.addEventListener('click', closePopup);
    document.addEventListener('keydown', function(e){
      if(e.key==='Escape' && overlay.classList.contains('sq-open')) closePopup();
    });

    /* Auto-open, respecting the merchant's frequency setting. Skipped entirely
       inside the theme editor so it never interrupts a merchant who's editing
       an unrelated section. */
    var delay = parseInt(cfg.autoOpenDelay, 10) || 0;
    if(delay > 0 && !(window.Shopify && window.Shopify.designMode)){
      var STORE_KEY = 'sq_quiz_last_seen';
      function seenRecently(){
    try{
      if(cfg.frequency==='every_visit') return false;
      if(cfg.frequency==='once_per_session') return sessionStorage.getItem(STORE_KEY)==='1';
      if(cfg.frequency==='once_ever') return localStorage.getItem(STORE_KEY)==='1';
      if(cfg.frequency==='once_per_day'){
        var last=parseInt(localStorage.getItem(STORE_KEY)||'0',10);
        return (Date.now()-last) < 86400000;
      }
    }catch(e){ /* storage unavailable (private mode etc.) - just don't auto-open twice this pageview */ }
    return false;
      }
      function markSeen(){
    try{
      if(cfg.frequency==='once_per_session') sessionStorage.setItem(STORE_KEY,'1');
      else if(cfg.frequency==='once_ever') localStorage.setItem(STORE_KEY,'1');
      else if(cfg.frequency==='once_per_day') localStorage.setItem(STORE_KEY,String(Date.now()));
    }catch(e){}
      }
      if(!seenRecently()){
    setTimeout(function(){
      if(overlay.hidden){ openPopup('auto'); markSeen(); }
    }, delay*1000);
      }
    }

    })();
