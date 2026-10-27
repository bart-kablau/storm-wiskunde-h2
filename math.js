/* =====================================================================
   math.js — wiskunde-nakijker + rendering voor de Storm-oefen-engine.
   Vak-add-on: alleen geladen wanneer VAK.wiskunde === true.

   - equiv(a, b, vars): zijn twee expressies gelijk? Via NUMERIEKE substitutie
     (plug-in checking, zoals WeBWorK). Géén CAS/symbolische simplify.
     Onderbouwing: Schwartz–Zippel — als twee polynomen verschillen, betrapt
     een willekeurig punt dat verschil; over meerdere punten → faalkans ~0.
   - WIS_RENDER(s): math-string → leesbare HTML (x^2 → x², · , NL-komma).

   Notatie-afspraak voor machine-gecheckte antwoorden (t:"bouw"/"stap"/"velden"):
     machten met ^  (x^2, 10^11) · vermenigvuldigen met * of · · NL-komma als
     decimaal (8,75) · variabelen zijn losse letters (5a = 5*a, ab = a*b).
   ===================================================================== */
(function(){
  "use strict";

  /* ---- preprocess: naar parser-vriendelijke ASCII-vorm ---- */
  function pre(s){
    return String(s==null?"":s)
      .replace(/−/g,"-")            // unicode minus −
      .replace(/[·×∙]/g,"*")             // maaltekens → *
      .replace(/\s+/g,"")
      .replace(/(\d),(\d)/g,"$1.$2");    // NL-komma als decimaal: 8,75 → 8.75
  }
  const isDigit=c=>c>="0"&&c<="9";
  const isAlpha=c=>(c>="a"&&c<="z")||(c>="A"&&c<="Z");

  /* ---- tokenizer met impliciete vermenigvuldiging ---- */
  function tokenize(s){
    const t=[]; let i=0;
    while(i<s.length){
      const c=s[i];
      if(c==="("||c===")"){ t.push({type:c}); i++; }
      else if("+-*/^".indexOf(c)>=0){ t.push({type:"op",op:c}); i++; }
      else if(isDigit(c)||c==="."){ let j=i+1; while(j<s.length&&(isDigit(s[j])||s[j]==="."))j++; t.push({type:"num",val:parseFloat(s.slice(i,j))}); i=j; }
      else if(isAlpha(c)){ t.push({type:"var",name:c}); i++; }   // één letter = één variabele
      else throw new Error("onbekend teken: "+c);
    }
    // impliciete * : een waarde (num/var/")") gevolgd door een waarde-start (num/var/"(")
    const out=[];
    for(let k=0;k<t.length;k++){
      out.push(t[k]); const a=t[k], b=t[k+1]; if(!b) continue;
      const aVal=a.type==="num"||a.type==="var"||a.type===")";
      const bStart=b.type==="num"||b.type==="var"||b.type==="(";
      if(aVal&&bStart) out.push({type:"op",op:"*"});
    }
    return out;
  }

  /* ---- shunting-yard → RPN (unary minus = 'u'; ^ rechts-associatief) ---- */
  const PREC={"+":1,"-":1,"*":2,"/":2,"u":3,"^":4}, RIGHT={"^":1,"u":1};
  function toRPN(tokens){
    const out=[], ops=[]; let prev=null;
    for(const tk of tokens){
      if(tk.type==="num"||tk.type==="var"){ out.push(tk); prev=tk; }
      else if(tk.type==="("){ ops.push(tk); prev=tk; }
      else if(tk.type===")"){
        while(ops.length&&ops[ops.length-1].type!=="(") out.push(ops.pop());
        if(!ops.length) throw new Error("haakjes kloppen niet");
        ops.pop(); prev=tk;
      } else {
        let op=tk.op;
        if(op==="-" && (!prev||prev.type==="op"||prev.type==="(")) op="u";  // unary
        while(ops.length){
          const top=ops[ops.length-1]; if(top.type!=="op") break;
          const o2=top.op;
          if(RIGHT[op] ? PREC[op]<PREC[o2] : PREC[op]<=PREC[o2]) out.push(ops.pop());
          else break;
        }
        ops.push({type:"op",op:op}); prev={type:"op",op:op};
      }
    }
    while(ops.length){ const o=ops.pop(); if(o.type==="(") throw new Error("haakjes kloppen niet"); out.push(o); }
    return out;
  }

  /* ---- evaluatie ---- */
  function evalRPN(rpn, env){
    const st=[];
    for(const tk of rpn){
      if(tk.type==="num") st.push(tk.val);
      else if(tk.type==="var"){ const v=env[tk.name]; if(v===undefined) throw new Error("var "+tk.name); st.push(v); }
      else if(tk.op==="u"){ st.push(-st.pop()); }
      else { const b=st.pop(), a=st.pop();
        st.push(tk.op==="+"?a+b: tk.op==="-"?a-b: tk.op==="*"?a*b: tk.op==="/"?a/b: Math.pow(a,b)); }
    }
    if(st.length!==1) throw new Error("ongeldige expressie");
    return st[0];
  }

  function compile(s){ return toRPN(tokenize(pre(s))); }
  function varsIn(s){ const set={}; const p=pre(s); for(let i=0;i<p.length;i++){ const c=p[i]; if(isAlpha(c)) set[c]=1; } return Object.keys(set); }

  /* ---- equiv: numerieke substitutie over meerdere punten ---- */
  // Vaste, niet-gehele meetpunten die 0 en 1 mijden (minder toevallige gelijkheid).
  const BASIS=[-3.7, 2.3, -1.45, 4.1, 0.62, 3.15, -2.8, 1.9, -4.3, 2.75];
  function equiv(a, b, vars){
    let rpnA, rpnB;
    try{ rpnA=compile(a); rpnB=compile(b); }catch(e){ return false; }
    if(!vars || !vars.length){ const s={}; varsIn(a).concat(varsIn(b)).forEach(v=>s[v]=1); vars=Object.keys(s); }
    let valid=0, tries=0, pi=0;
    while(valid<5 && tries<60){
      tries++;
      const env={};
      for(const v of vars){ env[v]=BASIS[pi%BASIS.length]+pi*0.137; pi++; }
      let va, vb;
      try{ va=evalRPN(rpnA,env); vb=evalRPN(rpnB,env); }catch(e){ continue; }
      if(!isFinite(va)||!isFinite(vb)) continue;
      valid++;
      const tol=1e-9*(1+Math.abs(va)+Math.abs(vb));
      if(Math.abs(va-vb)>tol) return false;   // één geldig tegenpunt = niet gelijk
    }
    return valid>=3;   // genoeg geldige punten gezien, allemaal gelijk
  }

  /* ---- "kortste vorm"-hint: bevat de student-expressie nog haakjes of
     direct samen te nemen termen? (lichte heuristiek, geen harde rechter) ---- */
  function heeftHaakjes(s){ return /[()]/.test(pre(s)); }

  /* ---- rendering: math-string → HTML ---- */
  function render(s){
    if(s==null) return "";
    s=String(s);
    // ^2  ^{10}  ^-3  ^x   (laat al-bestaande <sup> en HTML-tags met rust)
    s=s.replace(/\^(\{[^}]+\}|-?\d+|[a-zA-Z])/g, function(_,g){ return "<sup>"+g.replace(/[{}]/g,"")+"</sup>"; });
    s=s.replace(/\*/g,"·");
    return s;
  }

  // alleen activeren voor wiskunde-vakken
  if(window.VAK && window.VAK.wiskunde){
    window.equiv      = equiv;
    window.mathEval   = function(s,env){ return evalRPN(compile(s), env||{}); };
    window.mathVarsIn = varsIn;
    window.mathHeeftHaakjes = heeftHaakjes;
    window.WIS_RENDER = render;
  }
})();
