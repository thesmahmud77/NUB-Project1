import { useState, useRef, useEffect } from 'react'
import { CATS, TRI, TESTS, posts0, pend0, RP } from './data'

const TABS = [['login','🔐 লগইন'],['feed','🏠 মূল পাতা'],['chat','💬 চ্যাট'],['post','✍️ পোস্ট তৈরি'],['preg','🤰 গর্ভাবস্থা'],['test','🧪 টেস্ট গাইড'],['panel','👨‍⚕️ বিশেষজ্ঞ প্যানেল']]
const time = () => new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
const ME = 'আপনি'

export default function App() {
  const [tab, setTab] = useState('login'), [role, setRole] = useState('user'), [who, setWho] = useState('')
  const [posts, setPosts] = useState(posts0), [pend, setPend] = useState(pend0)
  const [cat, setCat] = useState('সব'), [ticked, setTicked] = useState({})
  const [cm, setCm] = useState({ 1: [{ by: 'আব্দুল করিম', t: 'আমার ক্ষেত্রেও মেথি কাজে দিয়েছে।' }], 2: [{ by: 'রহিমা বেগম', t: 'লবণ কমানো সত্যিই জরুরি।' }] })
  const [open, setOpen] = useState({}), [ct, setCt] = useState({})
  const [chats, setChats] = useState({}), [cur, setCur] = useState(null), [msg, setMsg] = useState('')
  const [notes, setNotes] = useState([]), [nopen, setNopen] = useState(false), [toast, setToast] = useState(null)
  const [tri, setTri] = useState(0), [tst, setTst] = useState(0), [an, setAn] = useState({})
  const [f, setF] = useState({ cat: CATS[1], t: '', rem: '', doc: '', tests: '', txt: '' })
  // OTP
  const [step, setStep] = useState('form'), [email, setEmail] = useState(''), [pw, setPw] = useState(''), [code, setCode] = useState(''), [shown, setShown] = useState('')
  const otp = useRef({}), seeded = useRef(false), view = useRef({}), endRef = useRef(null)
  view.current = { tab, cur }

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 4500); return () => clearTimeout(t) }, [toast])
  useEffect(() => { endRef.current?.scrollIntoView() }, [chats, cur])

  const go = t => { setTab(t); window.scrollTo(0, 0) }
  const notify = (txt, act, silent) => { setNotes(n => [{ txt, act, read: false, t: time() }, ...n]); if (!silent) setToast(txt) }
  const openChat = n => { setCur(n); setChats(c => ({ ...c, [n]: c[n] || [] })); go('chat') }
  const showComments = id => { setOpen(o => ({ ...o, [id]: true })); go('feed') }
  const unread = notes.filter(n => !n.read).length
  const readN = i => { const n = notes[i]; if (!n) return; setNotes(l => l.map((x, j) => j === i ? { ...x, read: true } : x)); setNopen(false); setToast(null); n.act?.() }

  // ---- Login + OTP ----
  const newCode = () => { const c = String(Math.floor(1e5 + Math.random() * 9e5)); otp.current = { c, exp: Date.now() + 3e5, tries: 0, last: Date.now() }; setShown(c); setCode('') }
  const sendOtp = () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return alert('সঠিক ইমেইল দিন')
    if (!pw) return alert('পাসওয়ার্ড দিন')
    newCode(); setStep('otp')
  }
  const finish = () => {
    setWho(role === 'admin' ? '🛡️ অ্যাডমিন' : '👤 ব্যবহারকারী'); setStep('form'); go(role === 'admin' ? 'panel' : 'feed')
    if (seeded.current) return
    seeded.current = true
    notify('🆕 রহিমা বেগম নতুন পোস্ট করেছেন: সকালে মেথি ভিজানো পানি (ডায়াবেটিস)', () => go('feed'), true)
    setTimeout(() => {
      setChats(c => ({ ...c, 'আব্দুল করিম': [{ t: 'আসসালামু আলাইকুম, আপনার অভিজ্ঞতাটি নিয়ে একটু কথা বলতে চাই।' }] }))
      notify('💬 আব্দুল করিম আপনাকে মেসেজ পাঠিয়েছেন', () => openChat('আব্দুল করিম'))
    }, 7000)
  }
  const verify = () => {
    const o = otp.current
    if (Date.now() > o.exp) return alert('কোডের মেয়াদ শেষ। নতুন কোড নিন।')
    if (o.tries >= 3) return alert('অনেকবার ভুল হয়েছে। নতুন কোড নিন।')
    if (code !== o.c) { o.tries++; return alert('ভুল কোড। বাকি চেষ্টা: ' + (3 - o.tries)) }
    finish()
  }
  const resend = () => { if (Date.now() - otp.current.last < 3e4) return alert('৩০ সেকেন্ড পর আবার চেষ্টা করুন'); newCode() }

  // ---- Chat / comments / posts ----
  const send = () => {
    const t = msg.trim(); if (!t) return
    const n = cur; setMsg(''); setChats(c => ({ ...c, [n]: [...c[n], { me: 1, t }] }))
    setTimeout(() => {
      const r = RP[Math.floor(Math.random() * RP.length)]
      setChats(c => ({ ...c, [n]: [...c[n], { t: r }] }))
      const v = view.current
      if (!(v.tab === 'chat' && v.cur === n)) notify('💬 ' + n + ' আপনাকে মেসেজ পাঠিয়েছেন: ' + r, () => openChat(n))
    }, 1800)
  }
  const addC = p => {
    const t = (ct[p.id] || '').trim(); if (!t) return
    setCm(c => ({ ...c, [p.id]: [...(c[p.id] || []), { by: ME, t }] })); setCt(x => ({ ...x, [p.id]: '' }))
    if (p.by !== ME) setTimeout(() => {
      setCm(c => ({ ...c, [p.id]: [...c[p.id], { by: p.by, t: 'ধন্যবাদ আপনার মন্তব্যের জন্য!' }] }))
      notify('💬 ' + p.by + ' আপনার মন্তব্যের জবাব দিয়েছেন', () => showComments(p.id))
    }, 2000)
  }
  const submit = () => {
    if (!f.t.trim() || !f.txt.trim()) return alert('শিরোনাম ও বিবরণ লিখুন')
    setPend(l => [...l, { id: Date.now(), cat: f.cat, t: f.t, txt: f.txt, rem: f.rem || '—', doc: f.doc || '—', tests: f.tests || '—', v: false, tk: 0, by: ME, note: '' }])
    notify('⏳ আপনার পোস্ট জমা হয়েছে, বিশেষজ্ঞ যাচাইয়ের অপেক্ষায়', null, true)
    setF({ ...f, t: '', rem: '', doc: '', tests: '', txt: '' })
    alert('পোস্ট জমা হয়েছে। বিশেষজ্ঞ যাচাইয়ের পর প্রকাশিত হবে।'); go('feed')
  }
  const decide = (p, ok) => {
    setPend(l => l.filter(x => x.id !== p.id))
    if (!ok) return notify('❌ পোস্টটি বাতিল করা হয়েছে: ' + p.t, null, true)
    setPosts(l => [{ ...p, v: true, note: an[p.id] || '' }, ...l])
    if (p.by === ME) {
      notify('✅ আপনার পোস্ট অনুমোদিত হয়েছে: ' + p.t, () => go('feed'))
      setTimeout(() => {
        setCm(c => ({ ...c, [p.id]: [...(c[p.id] || []), { by: 'রহিমা বেগম', t: 'আপনার অভিজ্ঞতাটি আমার খুব কাজে লাগল, ধন্যবাদ।' }] }))
        notify('💬 রহিমা বেগম আপনার পোস্টে মন্তব্য করেছেন', () => showComments(p.id))
      }, 6000)
    } else notify('🆕 ' + p.by + ' নতুন পোস্ট করেছেন: ' + p.t + ' (' + p.cat + ')', () => go('feed'))
  }

  // ---- UI pieces (plain functions, not components, so inputs keep focus) ----
  const postCard = p => {
    const c = cm[p.id] || [], o = open[p.id], tk = ticked[p.id]
    return (
      <div className="card" key={p.id}>
        <div className="meta">{p.by} · <span className="badge">{p.cat}</span>{p.v ? <span className="badge">✅ বিশেষজ্ঞ যাচাইকৃত</span> : <span className="badge w">যাচাই অপেক্ষমাণ</span>}</div>
        <h3>{p.t}</h3><p style={{ margin: '4px 0' }}>{p.txt}</p>
        <div className="meta">🌿 <b>ঘরোয়া উপায়/খাবার:</b> {p.rem}</div>
        <div className="meta">👨‍⚕️ <b>ডাক্তার:</b> {p.doc}</div>
        <div className="meta">🧪 <b>টেস্ট:</b> {p.tests}</div>
        {p.note && <div className="disc">⚠️ বিশেষজ্ঞের নোট: {p.note}</div>}
        <div className="row" style={{ marginTop: 10 }}>
          <button className={'tick ' + (tk ? 'done' : '')} onClick={() => setTicked(t => ({ ...t, [p.id]: !t[p.id] }))}>✔ আমারও একই অভিজ্ঞতা · {p.tk + (tk ? 1 : 0)}</button>
          {p.by !== ME && <button className="tick" onClick={() => openChat(p.by)}>💬 {p.by}-কে মেসেজ করুন</button>}
        </div>
        <div className="meta" style={{ marginTop: 8, cursor: 'pointer' }} onClick={() => setOpen(x => ({ ...x, [p.id]: !x[p.id] }))}>💬 {c.length} টি মন্তব্য {o ? '▲' : '▼'}</div>
        {o && <div style={{ marginTop: 6 }}>
          {c.map((x, i) => <div key={i} style={{ padding: '6px 0', borderTop: '1px solid var(--bd)' }}><b style={{ fontSize: 13 }}>{x.by}</b><div>{x.t}</div></div>)}
          <div className="row" style={{ marginTop: 6 }}>
            <input style={{ flex: 1 }} placeholder="মন্তব্য লিখুন..." value={ct[p.id] || ''} onChange={e => setCt(x => ({ ...x, [p.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addC(p)} />
            <button className="btn" onClick={() => addC(p)}>পাঠান</button>
          </div>
        </div>}
      </div>
    )
  }
  const chips = (arr, val, set) => <div className="chips">{arr.map((c, i) => <button key={i} className={'chip ' + (val === i ? 'on' : '')} onClick={() => set(i)}>{c}</button>)}</div>
  const list = (a, cls) => <ul className={cls}>{a.map((x, i) => <li key={i}>{x}</li>)}</ul>
  const names = [...new Set(posts.concat(pend).map(p => p.by))].filter(n => n !== ME)
  const convs = Object.keys(chats).filter(n => chats[n].length)

  return (<>
    <header>
      <span>🩺 হেলথ কম্যুনিটি</span>
      <span><button id="bell" onClick={() => setNopen(!nopen)}>🔔{unread > 0 && <span id="bc">{unread}</span>}</button><small>{who || 'অতিথি'}</small></span>
    </header>
    {nopen && <div id="np">
      <div className="row" style={{ justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid var(--bd)' }}>
        <b>🔔 নোটিফিকেশন</b><button className="chip" onClick={() => setNotes(l => l.map(x => ({ ...x, read: true })))}>সব পড়া হয়েছে</button>
      </div>
      {notes.length ? notes.map((n, i) => <div key={i} onClick={() => readN(i)} style={{ padding: '10px 12px', borderBottom: '1px solid var(--bd)', cursor: 'pointer', background: n.read ? '' : 'var(--pr2)' }}>{n.txt}<div className="meta">{n.t}</div></div>)
        : <p className="meta" style={{ padding: 12 }}>কোনো নোটিফিকেশন নেই।</p>}
    </div>}
    {toast && <div id="toast" onClick={() => readN(0)}>{toast}</div>}
    <nav>{TABS.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => go(k)}>{l}</button>)}</nav>

    <main>
      {tab === 'login' && (step === 'form' ? (
        <div className="card"><h2>🔐 লগইন</h2>
          <div className="row">
            <button className={'chip ' + (role === 'user' ? 'on' : '')} onClick={() => setRole('user')}>👤 ব্যবহারকারী</button>
            <button className={'chip ' + (role === 'admin' ? 'on' : '')} onClick={() => setRole('admin')}>🛡️ অ্যাডমিন/বিশেষজ্ঞ</button>
          </div>
          <label>ইমেইল</label><input type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          <label>পাসওয়ার্ড</label><input type="password" placeholder="••••••••" value={pw} onChange={e => setPw(e.target.value)} />
          <div className="row" style={{ marginTop: 14 }}><button className="btn" onClick={sendOtp}>{role === 'admin' ? 'অ্যাডমিন হিসেবে প্রবেশ' : 'লগইন করুন'}</button></div>
          <p className="meta">পাসওয়ার্ড দেওয়ার পর আপনার ইমেইলে ৬ সংখ্যার OTP কোড যাবে।</p>
        </div>
      ) : (
        <div className="card"><h2>📧 ইমেইল যাচাই (OTP)</h2>
          <p>{email.replace(/^(.{2}).*(@.*)$/, '$1•••$2')} ঠিকানায় ৬ সংখ্যার কোড পাঠানো হয়েছে। কোডটি ৫ মিনিট কার্যকর থাকবে।</p>
          <div className="disc">🧪 ডেমো মোড: ইমেইল সার্ভার সংযুক্ত নেই, তাই কোডটি এখানে দেখানো হলো: <b>{shown}</b></div>
          <label>OTP কোড</label>
          <input inputMode="numeric" maxLength={6} placeholder="______" value={code} onChange={e => setCode(e.target.value)} style={{ letterSpacing: 8, textAlign: 'center', fontSize: 22 }} />
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn" onClick={verify}>যাচাই করুন</button>
            <button className="btn o" onClick={resend}>আবার কোড পাঠান</button>
            <button className="btn o" onClick={() => setStep('form')}>← ফিরে যান</button>
          </div>
        </div>
      ))}

      {tab === 'feed' && <>
        <h2>🏠 রোগীদের অভিজ্ঞতা</h2>
        {chips(CATS, CATS.indexOf(cat), i => setCat(CATS[i]))}
        <div className="card"><b>⭐ সুপারিশকৃত ডাক্তার</b><div className="meta">ডা. রফিকুল ইসলাম (ডায়াবেটিস) · ডা. সেলিনা আক্তার (হৃদরোগ) · ডা. তানভীর হাসান (গ্যাস্ট্রো)</div></div>
        {posts.filter(p => cat === 'সব' || p.cat === cat).map(postCard)}
      </>}

      {tab === 'chat' && (cur ? (
        <div className="card">
          <div className="row"><button className="btn o" onClick={() => setCur(null)}>←</button><b>👤 {cur}</b></div>
          <div style={{ height: '46vh', overflowY: 'auto', padding: '10px 2px' }}>
            {chats[cur].length ? chats[cur].map((x, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: x.me ? 'flex-end' : 'flex-start', margin: '6px 0' }}>
                <span style={{ maxWidth: '80%', padding: '8px 12px', borderRadius: 14, background: x.me ? 'var(--pr)' : 'var(--pr2)', color: x.me ? '#fff' : 'var(--tx)' }}>{x.t}</span>
              </div>)) : <p className="meta">সালাম দিয়ে আলাপ শুরু করুন।</p>}
            <div ref={endRef} />
          </div>
          <div className="row">
            <input style={{ flex: 1 }} placeholder="মেসেজ লিখুন..." value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
            <button className="btn" onClick={send}>পাঠান</button>
          </div>
          <div className="disc">🔒 ফোন নম্বর, পাসওয়ার্ড বা টাকা-পয়সার তথ্য শেয়ার করবেন না। চিকিৎসার জন্য ডাক্তারের পরামর্শ নিন।</div>
        </div>
      ) : <>
        <h2>💬 মেসেজ</h2>
        <div className="card"><h3>আপনার কথোপকথন</h3>
          {convs.length ? convs.map(n => { const l = chats[n].slice(-1)[0]; return (
            <div key={n} className="row" style={{ padding: '8px 0', borderBottom: '1px solid var(--bd)', cursor: 'pointer' }} onClick={() => openChat(n)}>
              <span style={{ fontSize: 26 }}>👤</span><div><b>{n}</b><div className="meta">{l.me ? 'আপনি: ' : ''}{l.t}</div></div>
            </div>) }) : <p className="meta">এখনো কোনো চ্যাট নেই। নিচ থেকে কাউকে বেছে নিন বা ফিডের পোস্ট থেকে মেসেজ করুন।</p>}
        </div>
        <div className="card"><h3>নতুন চ্যাট শুরু করুন</h3><div className="chips">{names.map(n => <button key={n} className="chip" onClick={() => openChat(n)}>👤 {n}</button>)}</div></div>
      </>)}

      {tab === 'post' && <div className="card"><h2>✍️ অভিজ্ঞতা শেয়ার করুন</h2>
        <label>রোগ নির্বাচন</label><select value={f.cat} onChange={e => setF({ ...f, cat: e.target.value })}>{CATS.slice(1).map(c => <option key={c}>{c}</option>)}</select>
        <label>শিরোনাম</label><input value={f.t} onChange={e => setF({ ...f, t: e.target.value })} placeholder="যেমন: কীভাবে সুগার নিয়ন্ত্রণে এলো" />
        <label>ঘরোয়া উপায় / প্রাকৃতিক খাবার</label><input value={f.rem} onChange={e => setF({ ...f, rem: e.target.value })} placeholder="যেমন: মেথি, হাঁটা" />
        <label>ডাক্তার / ক্লিনিকের তথ্য</label><input value={f.doc} onChange={e => setF({ ...f, doc: e.target.value })} placeholder="নাম, বিশেষত্ব, হাসপাতাল" />
        <label>করানো টেস্ট ও টিপস</label><input value={f.tests} onChange={e => setF({ ...f, tests: e.target.value })} placeholder="যেমন: HbA1c, ফাস্টিং লাগে" />
        <label>অভিজ্ঞতার বিবরণ</label><textarea value={f.txt} onChange={e => setF({ ...f, txt: e.target.value })} placeholder="আপনার অভিজ্ঞতা বিস্তারিত লিখুন" />
        <div className="disc">⚠️ এটি ব্যক্তিগত অভিজ্ঞতা, চিকিৎসা পরামর্শ নয়। বিশেষজ্ঞ যাচাইয়ের পর প্রকাশিত হবে।</div>
        <button className="btn" style={{ marginTop: 12 }} onClick={submit}>জমা দিন</button>
      </div>}

      {tab === 'preg' && <>
        <h2>🤰 গর্ভাবস্থা ও মাতৃত্ব গাইড</h2>
        {chips(['১ম ত্রৈমাসিক', '২য় ত্রৈমাসিক', '৩য় ত্রৈমাসিক'], tri, setTri)}
        <div className="card"><h3>{TRI[tri].n}</h3><p>{TRI[tri].adv}</p><b>🔍 জরুরি পরীক্ষা</b>{list(TRI[tri].chk, 'ok')}</div>
        <div className="grid">
          <div className="card"><h3>✅ করণীয়</h3>{list(['নিয়মিত চেকআপ ও ওষুধ', 'পর্যাপ্ত পানি ও পুষ্টিকর খাবার', '৭–৮ ঘণ্টা ঘুম', 'ডাক্তারের অনুমতিতে হালকা ব্যায়াম'], 'ok')}</div>
          <div className="card"><h3>❌ বর্জনীয়</h3>{list(['ধূমপান, তামাক, অ্যালকোহল', 'ডাক্তার ছাড়া ওষুধ', 'ভারী জিনিস তোলা', 'কাঁচা মাংস/ডিম'], 'no')}</div>
        </div>
        <div className="card"><h3>🛡️ গর্ভপাত প্রতিরোধ টিপস</h3>
          {list(['গর্ভধারণের আগে ও পরে ফলিক অ্যাসিড', 'ডায়াবেটিস, থাইরয়েড ও রক্তচাপ নিয়ন্ত্রণে রাখুন', 'অতিরিক্ত ক্যাফেইন ও মানসিক চাপ এড়ান', 'সংক্রমণ হলে দ্রুত চিকিৎসা নিন'], 'ok')}
          <div className="disc">🚨 রক্তপাত, তীব্র পেটব্যথা, জ্বর বা শিশুর নড়াচড়া কমলে সঙ্গে সঙ্গে হাসপাতালে যান।</div>
        </div>
      </>}

      {tab === 'test' && <>
        <h2>🧪 টেস্ট ও ডায়াগনস্টিক নির্দেশিকা</h2>
        {chips(TESTS.map(t => t.n), tst, setTst)}
        <div className="card"><h3>{TESTS[tst].n} — প্রস্তুতি</h3>
          <b>✅ করণীয়</b>{list(TESTS[tst].ok, 'ok')}<b>⚠️ সতর্কতা</b>{list(TESTS[tst].no, 'no')}
          <div className="meta">⏱️ {TESTS[tst].t}</div>
          <div className="disc">নির্দিষ্ট নির্দেশনার জন্য আপনার ডায়াগনস্টিক সেন্টার বা ডাক্তারের সঙ্গে কথা বলুন।</div>
        </div>
      </>}

      {tab === 'panel' && (role !== 'admin' ? (
        <div className="card"><h2>🔒 শুধু বিশেষজ্ঞদের জন্য</h2><p>অ্যাডমিন/বিশেষজ্ঞ হিসেবে লগইন করুন।</p><button className="btn" onClick={() => { setRole('admin'); go('login') }}>লগইন পাতায় যান</button></div>
      ) : <>
        <h2>👨‍⚕️ বিশেষজ্ঞ ও ডাক্তার প্যানেল</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          <div className="card stat"><b>{pend.length}</b>অপেক্ষমাণ</div>
          <div className="card stat"><b>{posts.filter(p => p.v).length}</b>অনুমোদিত</div>
          <div className="card stat"><b>{posts.length}</b>মোট পোস্ট</div>
        </div>
        {pend.length ? pend.map(p => <div key={p.id}>{postCard(p)}
          <div className="card" style={{ marginTop: -6 }}>
            <label>মেডিকেল ডিসক্লেইমার / নোট</label>
            <textarea value={an[p.id] || ''} onChange={e => setAn({ ...an, [p.id]: e.target.value })} placeholder="যেমন: ডাক্তারের পরামর্শ ছাড়া ওষুধ বন্ধ করবেন না" />
            <div className="row" style={{ marginTop: 8 }}><button className="btn" onClick={() => decide(p, true)}>✅ অনুমোদন</button><button className="btn r" onClick={() => decide(p, false)}>❌ বাতিল</button></div>
          </div></div>) : <p className="meta">কোনো অপেক্ষমাণ পোস্ট নেই 🎉</p>}
      </>)}
    </main>
  </>)
}
