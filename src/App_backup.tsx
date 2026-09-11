import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from './api';
import {
  ArrowRight, Bell, CalendarDays, Check, ChevronRight, ClipboardList, Clock3,
  Home, Leaf, LogOut, Menu, MessageCircle, Package, Plus, Search, Settings,
  ShieldCheck, ShoppingBag, TicketCheck, UserRound, Users, Wrench, X, MapPin,
  IndianRupee, Vote, Megaphone, Sparkles, QrCode, Phone, CreditCard, Building2,
  CircleAlert, CheckCircle2, Mail, LockKeyhole, Eye, EyeOff, Database, BarChart3, Filter, RefreshCw, CheckCheck
} from 'lucide-react';
import './styles.css';

type Role = 'Resident' | 'Admin' | 'Security';
type Page = 'Overview' | 'Notice Board' | 'Events & Meetings' | 'Service Requests' | 'Visitor Passes' | 'Facility Booking' | 'Community Hub' | 'Buy • Sell • Rent' | 'Maintenance' | 'Directory' | 'Emergency Contacts' | 'Settings';

const nav: { label: Page; icon: any; badge?: string }[] = [
  { label: 'Overview', icon: Home },
  { label: 'Notice Board', icon: Megaphone, badge: '2' },
  { label: 'Events & Meetings', icon: CalendarDays },
  { label: 'Service Requests', icon: Wrench, badge: '1' },
  { label: 'Visitor Passes', icon: TicketCheck },
  { label: 'Facility Booking', icon: Building2 },
  { label: 'Community Hub', icon: MessageCircle },
  { label: 'Buy • Sell • Rent', icon: ShoppingBag },
  { label: 'Maintenance', icon: CreditCard },
  { label: 'Directory', icon: Users },
  { label: 'Emergency Contacts', icon: Phone },
];

const events = [
  { day: '12', month: 'SEP', title: 'Community Yoga Session', time: '6:00 AM – 7:00 AM', place: 'Clubhouse Lawn', people: 24, image: 'yoga' },
  { day: '15', month: 'SEP', title: 'Table Tennis Tournament', time: '5:00 PM – 8:00 PM', place: 'Indoor Sports Complex', people: 32, image: 'sport' },
  { day: '20', month: 'SEP', title: 'Tree Plantation Drive', time: '8:00 AM – 11:00 AM', place: 'Main Park', people: 18, image: 'tree' },
];

const initialRequests = [
  { id: '#SR-248', title: 'Kitchen sink leakage', category: 'Plumbing', priority: 'High', status: 'In progress', date: 'Today' },
  { id: '#SR-241', title: 'Corridor light replacement', category: 'Electrical', priority: 'Medium', status: 'Resolved', date: '08 Sep' },
  { id: '#SR-233', title: 'Gym AC service', category: 'Facility', priority: 'Low', status: 'Assigned', date: '05 Sep' },
];

const initialAnnouncements = [
  { title: 'Water tank cleaning', text: 'Overhead tanks will be cleaned on Sunday from 9:00 AM.', tag: 'Important', time: '2h ago' },
  { title: 'Parking policy update', text: 'New visitor parking guidelines are now active.', tag: 'Community', time: 'Yesterday' },
  { title: 'Green weekend challenge', text: 'Join your neighbours in reducing single-use plastic this weekend.', tag: 'Eco', time: '2d ago' },
];

const people = [
  { name: 'Priya Sharma', flat: 'A-204', role: 'Resident', phone: '+91 98••• 2214' },
  { name: 'Rohit Verma', flat: 'B-508', role: 'Resident', phone: '+91 97••• 1142' },
  { name: 'Meera Iyer', flat: 'C-302', role: 'Resident', phone: '+91 99••• 7740' },
  { name: 'Arjun Nair', flat: 'A-101', role: 'Committee', phone: '+91 96••• 4831' },
];

function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try { const raw = localStorage.getItem(`nestly:${key}`); return raw ? JSON.parse(raw) as T : initial; }
    catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(`nestly:${key}`, JSON.stringify(value)); } catch {} }, [key, value]);
  return [value, setValue] as const;
}

function App() {
  const [role, setRole] = usePersistentState<Role>('role', 'Resident');
  const [page, setPage] = useState<Page>('Overview');
  const [sidebar, setSidebar] = useState(false);
  const [query, setQuery] = useState('');
  const [notifications, setNotifications] = useState(false);
  const [modal, setModal] = useState<string | null>(null);

  const [requests, setRequests] = usePersistentState('requests', initialRequests);
  const [announcements, setAnnouncements] = usePersistentState(
    'announcements',
    initialAnnouncements
  );

  const [visitors, setVisitors] = usePersistentState<any[]>(
    'visitors',
    []
  );

  const [listings, setListings] = usePersistentState<any[]>(
    'listings',
    []
  );

  const [payments, setPayments] = usePersistentState(
    'payments',
    { due: 18450, paid: 55350 }
  );

  const [posts, setPosts] = usePersistentState<any[]>(
    'posts',
    []
  );

  const [booked, setBooked] = usePersistentState<string[]>(
    'booked',
    []
  );

  const [joined, setJoined] = usePersistentState<string[]>(
    'joined',
    []
  );

  const [approved, setApproved] = usePersistentState<string[]>(
    'approved',
    []
  );

  const [entryLogs, setEntryLogs] = usePersistentState<any[]>(
    'entryLogs',
    [
      {
        id: 'LOG-1042',
        visitor: 'Rahul Mehta',
        flat: 'A-204',
        type: 'Guest',
        time: '08:42 PM',
        status: 'Entered'
      },
      {
        id: 'LOG-1041',
        visitor: 'QuickKart Delivery',
        flat: 'B-508',
        type: 'Delivery',
        time: '07:18 PM',
        status: 'Exited'
      },
      {
        id: 'LOG-1040',
        visitor: 'UrbanFix Services',
        flat: 'C-302',
        type: 'Service',
        time: '05:35 PM',
        status: 'Exited'
      }
    ]
  );

  const [liked, setLiked] = usePersistentState<string[]>(
    'liked',
    []
  );

  const [notice, setNotice] = useState('');
  const [token, setToken] = usePersistentState<string>(
    'apiToken',
    ''
  );

  const [authenticated, setAuthenticated] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setBooting(false),
      350
    );

    return () => window.clearTimeout(timer);
  }, []);

  function toast(message: string) {
    setNotice(message);
    setTimeout(() => setNotice(''), 2500);
  }

  /*
   * LOAD DATA FROM MYSQL
   */
  useEffect(() => {
    if (!authenticated || !token) return;

    /*
     * SERVICE REQUESTS
     */
    apiFetch('/requests', {}, token)
      .then((rows: any[]) => {
        setRequests(
          rows.map((r: any) => ({
            id: `REQ-${r.id}`,
            title: r.title,
            category: r.category,
            priority: r.priority,
            description: r.description,
            status: r.status,
            date: r.created_at
              ? new Date(r.created_at).toLocaleDateString()
              : 'Recently'
          }))
        );
      })
      .catch(() => {
        toast('Could not load service requests from SQL.');
      });

    /*
     * NOTICES
     */
    apiFetch('/notices', {}, token)
      .then((rows: any[]) => {
        setAnnouncements(
          rows.map((n: any) => ({
            tag: n.category || 'Community',
            title: n.title,
            text: n.description || '',
            time: n.created_at
              ? new Date(n.created_at).toLocaleDateString()
              : 'Recently'
          }))
        );
      })
      .catch(() => {
        toast('Could not load notices from SQL.');
      });

    /*
     * VISITORS
     */
    apiFetch('/visitors', {}, token)
      .then((rows: any[]) => {
        setVisitors(
          rows.map((v: any) => ({
            id: v.pass_code || `VP-${v.id}`,
            visitor: v.visitor_name,
            visitor_name: v.visitor_name,
            date: v.visit_date,
            time: v.visit_time,
            purpose: v.purpose,
            status: v.status,
            passCode: v.pass_code
          }))
        );
      })
      .catch(() => {
        toast('Could not load visitor passes from SQL.');
      });

    /*
     * FACILITY BOOKINGS
     */
    apiFetch('/bookings', {}, token)
      .then((rows: any[]) => {
        setBooked(
          rows.map((b: any) => b.facility_name)
        );
      })
      .catch(() => {
        toast('Could not load facility bookings from SQL.');
      });

    /*
     * COMMUNITY POSTS
     */
    apiFetch('/community', {}, token)
      .then((rows: any[]) => {
        setPosts(
          rows.map((p: any) => ({
            id: p.id,
            name: p.author_name || 'Resident',
            text: p.content,
            category: p.category,
            time: p.created_at
              ? new Date(p.created_at).toLocaleDateString()
              : 'Recently'
          }))
        );
      })
      .catch(() => {
        toast('Could not load community posts from SQL.');
      });

    /*
     * MARKETPLACE
     */
    apiFetch('/marketplace', {}, token)
      .then((rows: any[]) => {
        setListings(
          rows.map((m: any) => ({
            id: m.id,
            name: m.title,
            title: m.title,
            description: m.description,
            category: m.category,
            price: m.price,
            seller: m.seller_name
          }))
        );
      })
      .catch(() => {
        toast('Could not load marketplace listings from SQL.');
      });

    /*
     * MAINTENANCE
     */
    apiFetch('/maintenance', {}, token)
      .then((rows: any[]) => {
        const due = rows
          .filter((p: any) => p.status !== 'Paid')
          .reduce(
            (total: number, p: any) =>
              total + Number(p.amount || 0),
            0
          );

        const paid = rows
          .filter((p: any) => p.status === 'Paid')
          .reduce(
            (total: number, p: any) =>
              total + Number(p.amount || 0),
            0
          );

        setPayments({
          due,
          paid
        });
      })
      .catch(() => {
        toast('Could not load maintenance data from SQL.');
      });

    /*
     * EMERGENCY CONTACTS
     * The page can request these directly.
     */

    /*
     * SECURITY ENTRY LOGS
     */
    if (role === 'Security' || role === 'Admin') {
      apiFetch('/entry-logs', {}, token)
        .then((rows: any[]) => {
          setEntryLogs(
            rows.map((l: any) => ({
              id: `LOG-${l.id}`,
              visitor: l.visitor_name,
              passCode: l.pass_code,
              type: 'Guest',
              time: l.logged_at
                ? new Date(l.logged_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Recently',
              status: l.action
            }))
          );
        })
        .catch(() => {
          toast('Could not load security entry logs from SQL.');
        });
    }
  }, [authenticated, token, role]);

  function resetDemo() {
    [
      'role',
      'requests',
      'announcements',
      'visitors',
      'listings',
      'payments',
      'posts',
      'booked',
      'joined',
      'approved',
      'entryLogs',
      'liked'
    ].forEach(k =>
      localStorage.removeItem(`nestly:${k}`)
    );

    window.location.reload();
  }

  const filteredPeople = useMemo(
    () =>
      people.filter(p =>
        `${p.name} ${p.flat} ${p.role}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [query]
  );

  function go(p: Page) {
    setPage(p);
    setSidebar(false);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  if (booting) {
    return (
      <div className="boot-screen">
        <div className="boot-card">
          <div className="boot-logo">
            <Leaf size={28}/>
          </div>

          <b>Nestly</b>

          <span>
            Loading your community workspace…
          </span>

          <div className="boot-bar">
            <i/>
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <LoginScreen
        role={role}
        setRole={setRole}
        onLogin={(newToken: string, user: any) => {
          setToken(newToken);
          setRole(user.role);
          setAuthenticated(true);
        }}
      />
    );
  }

  const commonProps = {
    role,
    setRole,
    page,
    go,
    sidebar,
    setSidebar,
    query,
    setQuery,
    notifications,
    setNotifications,
    modal,
    setModal,
    notice,
    toast,
    token,

    setAnnouncements,

    requests,
    setRequests,

    visitors,
    setVisitors,

    booked,
    setBooked,

    posts,
    setPosts,

    listings,
    setListings,

    payments,
    setPayments,

    joined,
    setJoined,

    liked,
    setLiked,

    approved,
    setApproved,

    entryLogs,
    setEntryLogs,

    filteredPeople,
    announcements,

    onLogout: () => {
      setAuthenticated(false);
      setToken('');
      localStorage.removeItem('nestly:apiToken');
    }
  };

  if (page === 'Overview') {
    return (
      <Layout {...commonProps}>
        <>
          {role === 'Resident' ? (
            <Overview
              {...{
                go,
                setModal,
                joined,
                setJoined,
                liked,
                setLiked,
                booked,
                setBooked,
                role
              }}
            />
          ) : (
            <RoleOverview
              role={role}
              go={go}
              toast={toast}
            />
          )}
        </>
      </Layout>
    );
  }

  return (
    <Layout {...commonProps}>
      {renderPage(page, commonProps)}
    </Layout>
  );
}

function LoginScreen({role,setRole,onLogin}:any){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [showPassword,setShowPassword]=useState(false);
  const [remember,setRemember]=useState(true);
  const [error,setError]=useState('');
  const [saving,setSaving]=useState(false);

  async function submit(e:any){
    e.preventDefault();
    if(!email.trim() || !password.trim()){
      setError('Please enter your email/phone and password.');
      return;
    }
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email:email.trim(),password}) });
      const body = await response.json();
      if(!response.ok) throw new Error(body.message || 'Login failed');
      if(remember) localStorage.setItem('nestly-login',email.trim());
      onLogin(body.token, body.user);
    } catch (err:any) {
      setError(err.message || 'Unable to connect to the SQL backend.');
    }
  }

  return <div className="login-screen">
    <div className="login-background"/>
    <div className="login-vignette"/>

    <header className="login-brand">
      <div className="login-brand-mark"><Leaf size={31}/></div>
      <div><b>Nestly</b><span>Better communities. Smarter living.</span></div>
    </header>

    <div className="login-community-chip"><MapPin size={15}/> Greenview Community</div>

    <section className="login-copy">
      <span className="login-kicker">SMART COMMUNITY PLATFORM</span>
      <h1>More than just<br/>a society...<br/><em>it’s a community</em></h1>
      <p>One connected place for residents, management and security — designed around everyday community life.</p>
      <div className="login-benefits">
        <span>✓ Safer access</span><span>✓ Faster requests</span><span>✓ Happier neighbours</span>
      </div>
    </section>

    <div className="login-weather">
      <span className="weather-emoji">☀️</span><div><b>28°C</b><small>Partly Cloudy</small><small>Greenview Community</small></div><ChevronRight/>
    </div>

    <div className="login-stats-float">
      {[['24','Events this month','calendar'],['186','Active residents','people'],['42','Open requests','request'],['92%','Community engagement','heart']].map(([value,label,icon]:any,i)=><div className={`login-float-card c${i}`} key={label}>
        <span className="float-icon">{icon==='calendar'?<CalendarDays/>:icon==='people'?<Users/>:icon==='request'?<ClipboardList/>:<span>♡</span>}</span>
        <div><b>{value}</b><small>{label}</small></div><ChevronRight size={18}/>
      </div>)}
    </div>

    <div className="login-slogan">Living better<br/><span>together</span> ♡</div>

    <div className="login-card-wrap">
      <div className="login-card">
        <div className="login-card-glow"/>
        <div className="login-card-top">
          <div className="login-mini-logo"><Leaf size={31}/></div>
          <div className="login-mini-brand"><b>Nestly</b><span>Better communities. Smarter living.</span></div>
          <button type="button" className="create-account" onClick={()=>setError('Account creation is ready for the next step.')}>New here? <strong>Create account →</strong></button>
        </div>

        <div className="login-heading">
          <span>WELCOME BACK</span>
          <h2>Welcome to Nestly <i>👋</i></h2>
          <p>Log in to your account and continue your journey.</p>
        </div>

        <div className="role-switcher">
          {(['Resident','Admin','Security'] as Role[]).map(r=><button type="button" key={r} className={role===r?'selected':''} onClick={()=>{setRole(r);setError('')}}>
            {r==='Resident'?<Home/>:r==='Admin'?<UserRound/>:<ShieldCheck/>}<span>{r}</span>
          </button>)}
        </div>

        <form onSubmit={submit} className="login-form">
          <label>Email or Phone</label>
          <div className="login-input"><Mail/><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email or phone number" autoComplete="username"/></div>
          <label>Password</label>
          <div className="login-input"><LockKeyhole/><input value={password} onChange={e=>setPassword(e.target.value)} type={showPassword?'text':'password'} placeholder="Enter your password" autoComplete="current-password"/><button type="button" onClick={()=>setShowPassword(!showPassword)} aria-label="Toggle password visibility">{showPassword?<EyeOff/>:<Eye/>}</button></div>
          <div className="login-options"><label className="remember"><button type="button" className={`check ${remember?'checked':''}`} onClick={()=>setRemember(!remember)}>{remember?'✓':''}</button> Remember me</label><button type="button" className="forgot" onClick={()=>setError('Password reset instructions would be sent to your registered contact.')}>Forgot password?</button></div>
          {error && <div className="login-error">{error}</div>}
          <button className="login-submit" type="submit"><span>→</span> Sign In <ArrowRight/></button>
        </form>

        <div className="login-or"><span/>OR<span/></div>
        <button type="button" className="google-login" onClick={onLogin}><b>G</b> Continue with Google</button>
        <div className="login-safe"><ShieldCheck size={18}/><div><b>Your data is safe with us</b><small>Industry-standard security protects your information.</small></div></div>
      </div>
    </div>
  </div>
}

function Layout(props: any) {
  const {
  role,
  setRole,
  page,
  go,
  sidebar,
  setSidebar,
  query,
  setQuery,
  notifications,
  setNotifications,
  modal,
  setModal,
  notice,
  toast,
  onLogout,
  token,
  setAnnouncements,
  setRequests,
  setVisitors,
  setBooked,
  setPosts,
  setListings,
  setPayments,
  children
} = props;
  const [readNotifications,setReadNotifications] = useState(false);
  const searchable = nav.filter(item => item.label.toLowerCase().includes(query.trim().toLowerCase())).slice(0,5);
  return <div className="app-shell">
    <aside className={`sidebar ${sidebar ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Leaf size={28}/></div><div><b>Nestly</b><span>Greenview Community</span></div></div>
      <button className="mode-pill" onClick={() => setRole(role === 'Resident' ? 'Admin' : role === 'Admin' ? 'Security' : 'Resident')}><span/> {role} mode <ChevronRight size={15}/></button>
      <nav>{nav.map(({label,icon:Icon,badge}) => <button key={label} className={page===label?'active':''} onClick={()=>go(label)}><Icon size={20}/><span>{label}</span>{badge&&<em>{badge}</em>}</button>)}</nav>
      <div className="sidebar-bottom"><button onClick={()=>go('Settings')} className={page==='Settings'?'sidebar-setting-active':''}><Settings size={19}/> Settings</button><button onClick={()=>{onLogout();toast('You have been safely signed out.')}}><LogOut size={19}/> Sign out</button></div>
    </aside>
    <main className="main">
      <header className="topbar"><button className="mobile-menu" onClick={()=>setSidebar(!sidebar)}><Menu/></button><div className="crumb">Greenview Community <ChevronRight size={15}/> <b>{page}</b></div><div className="top-actions"><div className="search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search community tools..."/>{query.trim()&&<button className="search-clear" onClick={()=>setQuery('')}><X size={14}/></button>}</div><button className={`icon-btn ${readNotifications?'read':''}`} onClick={()=>setNotifications(!notifications)}><Bell size={19}/>{!readNotifications&&<i>3</i>}</button><button className="avatar" onClick={()=>setModal('My Profile')}>R</button></div></header>
      {query.trim()&&<div className="search-results">{searchable.length?<>{searchable.map(({label,icon:Icon})=><button key={label} onClick={()=>{go(label);setQuery('')}}><Icon size={17}/><span>{label}</span><ArrowRight size={15}/></button>)}</>:<div className="search-empty"><Search size={18}/><span>No matching community tool</span></div>}</div>}
      {notifications && <div className="notifications"><div className="notif-head"><b>Recent notifications</b><button onClick={()=>setNotifications(false)}><X size={16}/></button></div><Notif icon={<CalendarDays/>} title="Event Reminder" text="Community Yoga Session is today"/><Notif icon={<Wrench/>} title="Service Request Update" text="Your complaint #SR-248 is in progress"/><Notif icon={<TicketCheck/>} title="Visitor Pass Approved" text="Guest entry approved for 09 Sep"/><button className="view-all" onClick={()=>{setReadNotifications(true);setNotifications(false);toast('All notifications marked as read.')}}><CheckCheck size={15}/> Mark all as read</button></div>}
      {children}
    </main>
    {notice && <div className="toast"><CheckCircle2 size={18}/>{notice}</div>}
    {modal && <Modal title={modal} close={()=>setModal(null)} toast={toast} onSave={async (data:any)=>{
      if (modal.includes('service request')) {
  if (!token) {
    throw new Error('Please sign in again to save to SQL.');
  }

  const r = await apiFetch(
    '/requests',
    {
      method: 'POST',
      body: JSON.stringify({
        title: data.name,
        category: data.category,
        priority: data.priority,
        description: data.description
      })
    },
    token
  );

  setRequests((x: any[]) => [
    {
      id: `#SR-${r.id}`,
      title: r.title,
      category: r.category,
      priority: r.priority,
      status: r.status,
      date: 'Just now'
    },
    ...x
  ]);

  return;
}
      if (modal.includes('visitor pass')) {
  if (!token) {
    throw new Error('Please sign in again to save the visitor pass.');
  }

  const v = await apiFetch(
    '/visitors',
    {
      method: 'POST',
      body: JSON.stringify({
        visitor_name: data.name,
        visit_date: data.date,
        visit_time: data.time,
        purpose: data.description
      })
    },
    token
  );

  setVisitors((x: any[]) => [
    {
      id: v.pass_code || `VP-${v.id}`,
      visitor: v.visitor_name,
      visitor_name: v.visitor_name,
      date: v.visit_date,
      time: v.visit_time,
      purpose: v.purpose,
      status: v.status,
      passCode: v.pass_code
    },
    ...x
  ]);

  return;
}
      if (modal.includes('booking')) {
  if (!token) {
    throw new Error(
      'Please sign in again to save the booking.'
    );
  }

  const facilityName = modal
    .replace('Facility booking: ', '')
    .trim();

  const facilityMap: any = {
    'Swimming Pool': 1,
    'Clubhouse': 2,
    'Gym': 3,
    'Badminton Court': 4
  };

  const facilityId = facilityMap[facilityName];

  if (!facilityId) {
    throw new Error(
      'Invalid facility selected.'
    );
  }

  if (!data.date) {
    throw new Error(
      'Please select a booking date.'
    );
  }

  const startTime = data.time || '10:00';
  const endTime = '11:00';

  await apiFetch(
    '/bookings',
    {
      method: 'POST',
      body: JSON.stringify({
        facility_id: facilityId,
        booking_date: data.date,
        start_time: startTime,
        end_time: endTime
      })
    },
    token
  );

  setBooked((x: string[]) =>
    x.includes(facilityName)
      ? x
      : [...x, facilityName]
  );

  toast(
    `${facilityName} booked successfully.`
  );

  return;
}
      if (modal.includes('community post')) {
  if (!token) {
    throw new Error('Please sign in again to create a community post.');
  }

  const response = await apiFetch(
    '/community',
    {
      method: 'POST',
      body: JSON.stringify({
        description: data.description || data.name
      })
    },
    token
  );

  setPosts((x: any[]) => [
    {
      id: response.id,
      name: response.author_name || 'Alex Resident',
      text: response.description || data.description || data.name,
      time: 'Just now'
    },
    ...x
  ]);

  toast('Community post created successfully.');
  return;
}
      if (modal.includes('List an item')) {
  if (!token) {
    throw new Error('Please sign in again to list an item.');
  }

  const priceValue = Number(
    String(data.amount || data.price || '0').replace(/[₹,]/g, '')
  );

  const response = await apiFetch(
    '/marketplace',
    {
      method: 'POST',
      body: JSON.stringify({
        title: data.name,
        description: data.description || '',
        category: data.category || 'Sell',
        price: priceValue
      })
    },
    token
  );

  setListings((x: any[]) => [
    {
      id: response.id,
      name: data.name,
      amount: data.amount || `₹${priceValue}`,
      category: data.category || 'Sell'
    },
    ...x
  ]);

  toast('Item listed successfully.');
  return;
}
      if (modal.includes('notice')) {
  if (role !== 'Admin') {
    throw new Error('Only Admin can create notices.');
  }

  if (!token) {
    throw new Error('Please sign in again to save the notice.');
  }

  const response = await apiFetch(
    '/notices',
    {
      method: 'POST',
      body: JSON.stringify({
        title: data.name,
        description: data.description,
        category: 'Community',
        priority: 'Normal'
      })
    },
    token
  );

  const newNotice = response;

  setAnnouncements((items: any[]) => [
    {
      tag: newNotice.category || 'Community',
      title: newNotice.title,
      text: newNotice.description || '',
      time: newNotice.created_at
        ? new Date(newNotice.created_at).toLocaleDateString()
        : 'Just now'
    },
    ...items
  ]);

  return;
}
      if (modal === 'Pay maintenance') {
  if (!token) {
    throw new Error('Please sign in again to make the payment.');
  }

  const response = await apiFetch(
    '/maintenance/1/pay',
    {
      method: 'PATCH'
    },
    token
  );

  setPayments((x:any) => ({
    due: 0,
    paid: x.paid + 18450,
    transaction_ref: response.transaction_ref
  }));

  toast(
    `Payment successful. Transaction: ${response.transaction_ref}`
  );

  return;
}
    }}/>} 
  </div>
}

function Notif({icon,title,text}:any){return <div className="notif"><span>{icon}</span><div><b>{title}</b><small>{text}</small></div><small>now</small></div>}


function RoleOverview({role,go,toast}:any){
  const config:any={
    Resident:{eyebrow:'RESIDENT SPACE',title:'Your community, your way',sub:'Everything you need for everyday living is ready at a glance.',cards:[['My Requests','3 active requests','Service Requests',Wrench],['Visitor Passes','2 active today','Visitor Passes',TicketCheck],['Facility Bookings','1 upcoming booking','Facility Booking',Building2],['Maintenance','₹18,450 due today','Maintenance',CreditCard]],actions:[['Raise a request','Report an issue in seconds','Service Requests',Wrench],['Invite a visitor','Create a secure QR pass','Visitor Passes',QrCode],['Book a facility','Reserve shared spaces','Facility Booking',CalendarDays],['Join community','Talk with neighbours','Community Hub',MessageCircle]]},
    Admin:{eyebrow:'ADMIN CONTROL CENTER',title:'Run the community smarter',sub:'Monitor operations, approvals and resident engagement from one dashboard.',cards:[['Open requests','42 service requests','Service Requests',Wrench],['Pending approvals','8 actions waiting','Notice Board',CheckCircle2],['Monthly collection','94% collected','Maintenance',IndianRupee],['Residents','186 active members','Directory',Users]],actions:[['Review requests','Assign and track service work','Service Requests',ClipboardList],['Post announcement','Share an important update','Notice Board',Megaphone],['Manage facilities','Review bookings and usage','Facility Booking',Building2],['View residents','Search the community directory','Directory',Users]]},
    Security:{eyebrow:'SECURITY CONSOLE',title:'Gate control at a glance',sub:'Verify visitors, monitor passes and reach emergency contacts quickly.',cards:[['Visitors today','24 expected entries','Visitor Passes',TicketCheck],['Pending verification','3 passes to check','Visitor Passes',ShieldCheck],['Emergency line','24 / 7 available','Emergency Contacts',Phone],['Community alerts','2 active notices','Notice Board',Bell]],actions:[['Verify visitor','Check a digital visitor pass','Visitor Passes',QrCode],['Entry log','Review today’s guest activity','Visitor Passes',ClipboardList],['Emergency contacts','Reach response teams quickly','Emergency Contacts',Phone],['Community notices','See current alerts','Notice Board',Megaphone] ]}
  }[role];
  return <div className="content role-overview inner"><section className="role-hero"><div><span className="community-chip"><ShieldCheck size={14}/> {config.eyebrow}</span><h1>{config.title}</h1><p>{config.sub}</p></div><div className="role-orb"><Sparkles/><b>{role}</b><small>Active mode</small></div></section><section className="role-stat-grid">{config.cards.map((c:any)=>{const Icon=c[3]; return <button className="role-stat" key={c[0]} onClick={()=>go(c[2])}><span><Icon size={21}/></span><div><b>{c[0]}</b><strong>{c[1]}</strong></div><ChevronRight/></button>})}</section><section className="section"><div className="section-head"><div><h2>{role} quick actions</h2><p>Role-focused tools for faster community management.</p></div><span className="live"><i/> Live</span></div><div className="role-action-grid">{config.actions.map((a:any)=>{const Icon=a[3]; return <button className="role-action" key={a[0]} onClick={()=>{go(a[2]);toast(`${a[0]} opened.`)}}><span><Icon size={22}/></span><div><b>{a[0]}</b><small>{a[1]}</small></div><ArrowRight/></button>})}</div></section>{role==='Admin'&&<section className="ops-analytics"><div className="analytics-head"><div><span>OPERATIONS SNAPSHOT</span><h2>Community performance</h2><p>Quick signals for the committee dashboard.</p></div><button onClick={()=>toast('Analytics refreshed.') }><RefreshCw size={15}/> Refresh</button></div><div className="analytics-grid"><div className="analytics-card"><span><BarChart3 size={19}/></span><b>94%</b><small>Maintenance collection</small><div className="meter"><i style={{width:'94%'}}/></div></div><div className="analytics-card"><span><Wrench size={19}/></span><b>18</b><small>Requests resolved this week</small><div className="meter"><i style={{width:'72%'}}/></div></div><div className="analytics-card"><span><Users size={19}/></span><b>78%</b><small>Resident engagement</small><div className="meter"><i style={{width:'78%'}}/></div></div></div></section>}{role==='Security'&&<section className="gate-strip"><div><span>SECURITY STATUS</span><h2>Gate 01 · Online</h2><p>3 verification slots are expected today.</p></div><button onClick={()=>go('Visitor Passes')}><QrCode size={17}/> Open gate console</button></section>}<section className="role-bottom"><div><span>SMART COMMUNITY</span><h2>One platform. Different responsibilities.</h2><p>Switch modes from the sidebar to preview the Resident, Admin or Security experience.</p></div><button className="primary" onClick={()=>go('Settings')}><Settings size={17}/> Configure workspace</button></section></div>
}

function Overview({go,setModal,joined,setJoined,liked,setLiked,booked,setBooked,role}:any) {
  return <div className="content overview">
    <section className="hero">
      <div className="hero-image"/><div className="hero-overlay"/>
      <div className="hero-copy"><span className="community-chip"><MapPin size={14}/> Greenview Community</span><h1>Good evening, Alex <span>👋</span></h1><p>Everything your community needs, in one calm space.</p><button className="pulse"><span className="pulse-dot"/><div><b>Community pulse is healthy</b><small>92% engagement this month · 18 neighbours are active right now</small></div><ArrowRight/></button></div>
      <div className="weather"><span>☀️</span><div><b>28°C</b><small>Partly Cloudy</small><small>Greenview Community</small></div><ChevronRight/></div>
      <div className="hero-note"><Leaf/><div><b>A greener tomorrow</b><small>Our community planted 50 trees this year.</small></div><ArrowRight/></div>
    </section>
    <section className="stats">{[
      [CalendarDays,'24','Events this month','+12%'],[Users,'186','Active residents','+5%'],[ClipboardList,'42','Open requests','-8%'],[IndianRupee,'18,450','Maintenance due','+2%']
    ].map(([Icon,value,label,change]:any)=><button className="stat" key={label} onClick={()=>go(label==='Events this month'?'Events & Meetings':label==='Open requests'?'Service Requests':'Maintenance')}><span className="stat-icon"><Icon size={21}/></span><strong>{label==='Maintenance due'?'₹':''}{value}</strong><small>{label}</small><em>{change}</em><ChevronRight/></button>)}</section>
    <section className="section"><div className="section-head"><div><h2>Quick actions</h2><p>Common tasks, one tap away.</p></div><span className="live"><i/> Live</span></div><div className="quick-grid">{[
      [Building2,'Book a facility','Pool, gym, clubhouse','Facility Booking'],[Wrench,'Raise a request','Maintenance or service','Service Requests'],[TicketCheck,'Invite a visitor','Create a quick pass','Visitor Passes'],[MessageCircle,'Community chat','Connect with neighbours','Community Hub']
    ].map(([Icon,title,sub,target]:any)=><button key={title} className="quick" onClick={()=>go(target)}><span><Icon size={22}/></span><div><b>{title}</b><small>{sub}</small></div><ChevronRight/></button>)}</div></section>
    <div className="columns"><section className="panel"><div className="section-head"><div><h2>Upcoming events</h2><p>Meet, move and make memories.</p></div><button onClick={()=>go('Events & Meetings')}>View all →</button></div><div className="event-row">{events.map(e=><EventCard key={e.title} e={e} joined={joined.includes(e.title)} onJoin={()=>setJoined((x:string[])=>x.includes(e.title)?x.filter(y=>y!==e.title):[...x,e.title])}/>)}</div></section><section className="panel feed"><div className="section-head"><div><h2>Community feed</h2><p>What your neighbours are saying.</p></div><button onClick={()=>go('Community Hub')}>View all →</button></div><Post name="Priya Sharma" text="The new kids play area looks amazing!" id="1" liked={liked.includes('1')} onLike={()=>setLiked((x:string[])=>x.includes('1')?x.filter(y=>y!=='1'):[...x,'1'])}/><Post name="Rohit Verma" text="Does anyone know if the gym will be open tomorrow?" id="2" liked={liked.includes('2')} onLike={()=>setLiked((x:string[])=>x.includes('2')?x.filter(y=>y!=='2'):[...x,'2'])}/></section></div>
    <section className="explore"><div className="section-head"><div><h2>Explore community</h2><p>Discover everything around you.</p></div></div><div className="explore-grid">{[['Facilities',Building2,'Facility Booking'],['Services',Wrench,'Service Requests'],['Community',Users,'Community Hub'],['Marketplace',ShoppingBag,'Buy • Sell • Rent']].map(([t,I,target]:any)=><button key={t} onClick={()=>go(target)}><span><I size={22}/></span><b>{t}</b><ArrowRight/></button>)}</div></section>
  </div>
}

function EventCard({e,joined,onJoin}:any){return <article className="event-card"><div className={`event-image ${e.image}`}><div><b>{e.day}</b><small>{e.month}</small></div></div><h3>{e.title}</h3><p><Clock3 size={14}/> {e.time}</p><p><MapPin size={14}/> {e.place}</p><button className={joined?'joined':''} onClick={onJoin}>{joined?<><Check size={15}/> Joined</>:<>Join Event <ArrowRight size={15}/></>}</button><span className="attendees"><Users size={13}/> {e.people}</span></article>}
function Post({name,text,id,liked,onLike}:any){return <article className="post"><div className="post-avatar">{name[0]}</div><div className="post-main"><div className="post-meta"><b>{name}</b><small>2h ago · Greenview Community</small></div><p>{text}</p><div className="post-actions"><button className={liked?'liked':''} onClick={onLike}>♥ {liked?25:24}</button><button>◯ 6</button><button>•••</button></div></div></article>}

function renderPage(page:Page, p:any){
  switch(page){
    case 'Notice Board': return <NoticeBoard {...p}/>;
    case 'Events & Meetings': return <Events {...p}/>;
    case 'Service Requests': return <Requests {...p}/>;
    case 'Visitor Passes': return <Visitors {...p}/>;
    case 'Facility Booking': return <Facilities {...p}/>;
    case 'Community Hub': return <Community {...p}/>;
    case 'Buy • Sell • Rent': return <Marketplace {...p}/>;
    case 'Maintenance': return <Maintenance {...p}/>;
    case 'Directory': return <Directory {...p}/>;
    case 'Emergency Contacts': return <EmergencyContacts {...p}/>;
    case 'Settings': return <SettingsPage {...p}/>;
  }
}

function PageHead({eyebrow,title,sub,action}:any){return <div className="page-head"><div><span>{eyebrow}</span><h1>{title}</h1><p>{sub}</p></div>{action}</div>}
function NoticeBoard({toast,setModal,announcements,token,setAnnouncements,role}:any){return <div className="content inner"><PageHead eyebrow="COMMUNITY UPDATES" title="Digital notice board" sub="Important updates, notices and community initiatives." action={<button className="primary" onClick={()=>setModal('New notice')}><Plus size={17}/> New notice</button>}/><div className="notice-grid">{announcements.length===0?<div className="empty-state wide"><Megaphone size={28}/><b>No notices yet</b><span>New community announcements will appear here.</span><button className="primary" onClick={()=>setModal('New notice')}><Plus size={15}/> Create notice</button></div>:announcements.map((a:any,i:number)=><article className="notice-card" key={`${a.title}-${i}`}><div className={`notice-icon n${i%3}`}><Megaphone/></div><span>{a.tag}</span><h2>{a.title}</h2><p>{a.text}</p><footer>{a.time}<button onClick={()=>toast(`Opened: ${a.title}`)}>Read update <ArrowRight size={15}/></button></footer></article>)}</div></div>}
function Events({joined,setJoined,toast}:any){return <div className="content inner"><PageHead eyebrow="PLAN TOGETHER" title="Events & meetings" sub="Join activities, discover neighbours and make plans." action={<button className="primary" onClick={()=>toast('Your community calendar is ready.') }><CalendarDays size={17}/> Add to calendar</button>}/><div className="event-large-grid">{events.map(e=><EventCard key={e.title} e={e} joined={joined.includes(e.title)} onJoin={()=>setJoined((x:string[])=>x.includes(e.title)?x.filter(y=>y!==e.title):[...x,e.title])}/>)}</div></div>}
function Requests({requests,setRequests,setModal,toast,role}:any){
  const isAdmin=role==='Admin';
  const updateStatus=(id:string,status:string)=>{setRequests((items:any[])=>items.map(r=>r.id===id?{...r,status}:r));toast(`${id} marked ${status}.`)};
  return <div className="content inner"><PageHead eyebrow={isAdmin?'OPERATIONS CONTROL':'HELP DESK'} title={isAdmin?'Service request management':'Service requests'} sub={isAdmin?'Review, assign and resolve resident complaints from one workspace.':'Track complaints, maintenance and service issues from one place.'} action={<button className="primary" onClick={()=>setModal('Raise a service request')}><Plus size={17}/> Raise request</button>}/><div className="request-summary"><div><b>{requests.length}</b><span>Total requests</span></div><div><b>{requests.filter((r:any)=>r.status==='In progress'||r.status==='Submitted').length}</b><span>Open</span></div><div><b>{requests.filter((r:any)=>r.status==='Resolved').length}</b><span>Resolved</span></div><div><b>4.8/5</b><span>Service rating</span></div></div><div className="table-card"><div className="table-head"><b>{isAdmin?'All community requests':'My requests'}</b><span>Updated just now</span></div>{requests.map((r:any)=><div className="request-row" key={r.id}><div className="request-code">{r.id}</div><div className="request-title"><b>{r.title}</b><small>{r.category} · {r.date}</small></div><span className={`priority ${r.priority.toLowerCase()}`}>{r.priority}</span><span className={`status ${r.status.toLowerCase().replace(' ','-')}`}>{r.status}</span>{isAdmin?<div className="row-actions"><button onClick={()=>updateStatus(r.id,'In progress')}>Assign</button><button onClick={()=>updateStatus(r.id,'Resolved')}>Resolve</button></div>:<ChevronRight/>}</div>)}</div></div>
}

function Visitors({setModal,toast,visitors,role,approved,setApproved,entryLogs,setEntryLogs}:any){
  const isSecurity=role==='Security';
  const verify=(id:string,visitor:any)=>{setApproved((x:string[])=>x.includes(id)?x.filter(y=>y!==id):[...x,id]); setEntryLogs((logs:any[])=>[{id:`LOG-${1043+logs.length}`,visitor:visitor.name,flat:'A-204',type:visitor.category||'Guest',time:'Just now',status:'Entered'},...logs]); toast(`${visitor.name} verified at the gate.`)};
  return <div className="content inner"><PageHead eyebrow={isSecurity?'GATE CONTROL':'GUEST ACCESS'} title={isSecurity?'Visitor verification':'Visitor passes'} sub={isSecurity?'Verify digital passes and monitor today’s entry activity.':'Create secure digital passes for guests, deliveries and service staff.'} action={<button className="primary" onClick={()=>setModal('Create visitor pass')}><QrCode size={17}/> Create pass</button>}/>{isSecurity?<><div className="security-console"><div><span className="community-chip">LIVE GATE STATUS</span><h2>Gate 01 is operational</h2><p>Visitor verification is active. Check each pass before allowing entry.</p></div><div className="gate-status"><i/> Online</div></div><div className="table-card"><div className="table-head"><b>Verification queue</b><span>{visitors.length} local passes</span></div>{visitors.length===0?<div className="empty-state"><ShieldCheck size={28}/><b>No pending passes</b><span>New visitor requests will appear here.</span></div>:visitors.map((v:any)=><div className="request-row" key={v.id}><div className="request-code">{v.id}</div><div className="request-title"><b>{v.name}</b><small>{v.category} · {v.date||'Today'} {v.time||''}</small></div><span className={`status ${approved.includes(v.id)?'resolved':'submitted'}`}>{approved.includes(v.id)?'Verified':'Pending'}</span><button className="verify-btn" disabled={approved.includes(v.id)} onClick={()=>verify(v.id,v)}>{approved.includes(v.id)?'✓ Verified':'Verify entry'}</button></div>)}</div><div className="table-card live-list"><div className="table-head"><b>Today’s entry log</b><span>Live demo activity</span></div>{entryLogs.map((l:any)=><div className="request-row" key={l.id}><div className="request-code">{l.id}</div><div className="request-title"><b>{l.visitor}</b><small>{l.flat} · {l.type} · {l.time}</small></div><span className={`status ${l.status==='Entered'?'resolved':'assigned'}`}>{l.status}</span><ChevronRight/></div>)}</div></>:<><div className="visitor-hero"><div><span className="community-chip">Secure access</span><h2>Welcome your guests without the paperwork.</h2><p>Generate a time-bound pass and share it instantly with your visitor.</p><button className="white-btn" onClick={()=>setModal('Create visitor pass')}>Create a visitor pass <ArrowRight size={17}/></button></div><div className="qr-card"><QrCode size={105}/><b>VISITOR PASS</b><small>Valid for today · 6:00 PM</small></div></div><div className="mini-grid"><InfoCard icon={CheckCircle2} title={`${visitors.length} active passes`} sub="Created in this session"/><InfoCard icon={Clock3} title="1 pending" sub="Awaiting approval"/><InfoCard icon={ShieldCheck} title="100% verified" sub="Secure gate entry"/></div>{visitors.length>0&&<div className="table-card live-list"><div className="table-head"><b>Recent passes</b><span>Local demo state</span></div>{visitors.map((v:any)=><div className="request-row" key={v.id}><div className="request-code">{v.id}</div><div className="request-title"><b>{v.name}</b><small>{v.category} · {v.date||'Today'} {v.time||''}</small></div><span className="status resolved">Active</span><ChevronRight/></div>)}</div>}</>}</div>
}

function Facilities({ booked, setBooked, toast, setModal, token }: any) {
  const fac = [
    ['Swimming Pool', '06:00 AM – 09:00 PM', '12 slots'],
    ['Clubhouse', '08:00 AM – 10:00 PM', '8 slots'],
    ['Gym', '05:30 AM – 11:00 PM', '16 slots'],
    ['Badminton Court', '06:00 AM – 10:00 PM', '5 slots']
  ];

  async function cancelBooking(name: string) {
    try {
      if (!token) {
        throw new Error('Please sign in again.');
      }

      const bookings = await apiFetch('/bookings', {}, token);

      const booking = bookings.find(
        (b: any) => b.facility_name === name
      );

      if (!booking) {
        setBooked((x: string[]) =>
          x.filter(y => y !== name)
        );
        toast(`Booking cancelled for ${name}`);
        return;
      }

      await apiFetch(
        `/bookings/${booking.id}`,
        {
          method: 'DELETE'
        },
        token
      );

      setBooked((x: string[]) =>
        x.filter(y => y !== name)
      );

      toast(`Booking cancelled for ${name}`);
    } catch (e: any) {
      toast(e.message || 'Could not cancel booking.');
    }
  }

  return (
    <div className="content inner">
      <PageHead
        eyebrow="SHARED SPACES"
        title="Facility booking"
        sub="Reserve community spaces in a few taps."
        action={
          <button
            className="primary"
            onClick={() => toast('Calendar view opened.')}
          >
            <CalendarDays size={17}/>
            Calendar
          </button>
        }
      />

      <div className="facility-grid">
        {fac.map(([name, time, slots], i) => (
          <article
            className="facility"
            key={name}
          >
            <div className={`facility-photo f${i}`}>
              <span>Available</span>
            </div>

            <div className="facility-body">
              <h2>{name}</h2>

              <p>
                <Clock3 size={14}/>
                {time}
              </p>

              <small>
                {slots} available today
              </small>

              <button
                className={
                  booked.includes(name)
                    ? 'joined'
                    : ''
                }
                onClick={() =>
                  booked.includes(name)
                    ? cancelBooking(name)
                    : setModal(
                        `Facility booking: ${name}`
                      )
                }
              >
                {booked.includes(name)
                  ? 'Booked ✓'
                  : 'Book now'}

                <ArrowRight size={15}/>
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
function Community({liked,setLiked,toast,setModal,posts}:any){
  return (
    <div className="content inner">
      <PageHead
        eyebrow="NEIGHBOURHOOD"
        title="Community hub"
        sub="Talk, vote, share and help your community grow."
        action={
          <button
            className="primary"
            onClick={()=>setModal('Create community post')}
          >
            <Plus size={17}/> Create post
          </button>
        }
      />

      <div className="community-layout">
        <div>

          <div
            className="composer"
            onClick={()=>setModal('Create community post')}
          >
            <div className="post-avatar">A</div>
            <span>Share something with your community...</span>
            <Plus/>
          </div>

          {posts.map((p:any,i:number)=>(
            <Post
              key={`new-${p.id || i}`}
              name={p.name}
              text={p.text}
              id={`new-${p.id || i}`}
              liked={liked.includes(`new-${p.id || i}`)}
              onLike={()=>{
                const id=`new-${p.id || i}`;

                setLiked((x:string[])=>
                  x.includes(id)
                    ? x.filter(y=>y!==id)
                    : [...x,id]
                );
              }}
            />
          ))}

          <Post
            name="Priya Sharma"
            text="The new kids play area looks amazing! 🌿"
            id="1"
            liked={liked.includes('1')}
            onLike={()=>
              setLiked((x:string[])=>
                x.includes('1')
                  ? x.filter(y=>y!=='1')
                  : [...x,'1']
              )
            }
          />

          <Post
            name="Rohit Verma"
            text="Does anyone know if the gym will be open tomorrow?"
            id="2"
            liked={liked.includes('2')}
            onLike={()=>
              setLiked((x:string[])=>
                x.includes('2')
                  ? x.filter(y=>y!=='2')
                  : [...x,'2']
              )
            }
          />

        </div>

        <div className="poll">
          <span className="poll-icon">
            <Vote/>
          </span>

          <small>COMMUNITY POLL</small>

          <h2>
            Should we add more weekend fitness sessions?
          </h2>

          <button onClick={()=>toast('Vote recorded: Yes')}>
            Yes, definitely <span>64%</span>
          </button>

          <button onClick={()=>toast('Vote recorded: Maybe')}>
            Maybe one more <span>24%</span>
          </button>

          <button onClick={()=>toast('Vote recorded: No')}>
            Not needed <span>12%</span>
          </button>

          <p>126 residents voted · closes tomorrow</p>
        </div>

      </div>
    </div>
  );
}
function Marketplace({setModal,toast,listings}:any){
  const items=[
    ['Study table','₹2,500','Furniture'],
    ['Mountain bicycle','₹8,000','Sports'],
    ['2BHK apartment','₹24,000/mo','Rent'],
    ['Dining chairs set','₹4,500','Furniture']
  ];

  const all=[
    ...listings.map((x:any)=>[
      x.name || x.title,
      x.amount || (x.price ? `₹${x.price}` : ''),
      x.category
    ]),
    ...items
  ];

  return (
    <div className="content inner">

      <PageHead
        eyebrow="COMMUNITY MARKETPLACE"
        title="Buy • Sell • Rent"
        sub="A trusted space to exchange useful things with neighbours."
        action={
          <button
            className="primary"
            onClick={()=>setModal('List an item')}
          >
            <Plus size={17}/> List an item
          </button>
        }
      />

      <div className="market-grid">
        {all.map(([name,price,tag]:any,i:number)=>(
          <article
            className="market"
            key={`${name}-${i}`}
          >
            <div className={`market-image m${i%4}`}>
              <span>{tag}</span>
            </div>

            <div>
              <h2>{name}</h2>
              <strong>{price}</strong>
              <small>Listed by Greenview resident</small>

              <button
                onClick={()=>toast(`Opened ${name}`)}
              >
                View item <ArrowRight size={15}/>
              </button>
            </div>
          </article>
        ))}
      </div>

    </div>
  );
}
function Maintenance({toast,setModal,payments}:any){
  return (
    <div className="content inner">

      <PageHead
        eyebrow="FINANCE"
        title="Maintenance payments"
        sub="Stay ahead of monthly dues and community expenses."
        action={
          <button
            className="primary"
            onClick={()=>setModal('Pay maintenance')}
          >
            <CreditCard size={17}/>
            {payments.due ? 'Pay now' : 'Paid ✓'}
          </button>
        }
      />

      <div className="payment-card">
        <div>
          <span>September 2026</span>

          <h2>
            ₹{payments.due.toLocaleString('en-IN')}
          </h2>

          <p>
            {payments.due
              ? 'Maintenance due · 10 Sep 2026'
              : 'September maintenance paid successfully'}
          </p>

          <div className="progress">
            <i
              style={{
                width: payments.due ? '35%' : '100%'
              }}
            />
          </div>

          <small>
            {payments.due
              ? '2 days remaining'
              : 'Payment completed'}
          </small>
        </div>

        <div className="payment-badge">
          <IndianRupee size={28}/>
          <b>{payments.due ? 'Pending' : 'Paid'}</b>
          <span>Monthly dues</span>
        </div>
      </div>

      <div className="request-summary">
        <div>
          <b>
            ₹{payments.paid.toLocaleString('en-IN')}
          </b>
          <span>Paid this year</span>
        </div>

        <div>
          <b>
            ₹{payments.due.toLocaleString('en-IN')}
          </b>
          <span>Current due</span>
        </div>

        <div>
          <b>{payments.due ? '99%' : '100%'}</b>
          <span>Payment history</span>
        </div>
      </div>

    </div>
  );
}
function Directory({filteredPeople,toast}:any){return <div className="content inner"><PageHead eyebrow="YOUR COMMUNITY" title="Resident directory" sub="Find neighbours and committee members quickly."/><div className="directory-grid">{filteredPeople.length===0?<div className="empty-state wide"><Users size={28}/><b>No residents found</b><span>Try a different name, flat number or role.</span></div>:filteredPeople.map((p:any)=><article className="person" key={p.name}><div className="person-avatar">{p.name.split(' ').map((x:string)=>x[0]).join('')}</div><div><h2>{p.name}</h2><span>{p.flat} · {p.role}</span><p>{p.phone}</p></div><button onClick={()=>toast(`Calling ${p.name} in demo mode.`)}><Phone size={17}/></button></article>)}</div></div>}

function SettingsPage({role,setRole,toast,resetDemo}:any){
  const [notificationsOn,setNotificationsOn]=useState(true);
  const [compact,setCompact]=useState(false);
  const [motion,setMotion]=useState(true);
  const [privacy,setPrivacy]=useState(true);
  const toggle=(setter:any,value:boolean,label:string)=>{setter(!value);toast(`${label} ${!value?'enabled':'disabled'}.`)};
  return <div className="content inner settings-page">
    <PageHead eyebrow="PERSONALIZE NESTLY" title="Settings" sub="Control your community experience, notifications and account preferences." action={<button className="primary" onClick={()=>toast('All settings saved successfully.')}><Check size={17}/> Save changes</button>}/>
    <div className="settings-layout">
      <section className="settings-card settings-profile">
        <div className="settings-avatar">R</div><div><span className="settings-label">SIGNED IN AS</span><h2>Alex Resident</h2><p>Greenview Community · A-204</p></div><span className="role-pill">{role}</span>
        <div className="role-setting"><b>Active workspace</b><p>Switch between Resident, Admin and Security views.</p><div className="role-mini">{(['Resident','Admin','Security'] as Role[]).map(r=><button key={r} className={role===r?'active':''} onClick={()=>{setRole(r);toast(`Switched to ${r} mode.`)}}>{r}</button>)}</div></div>
      </section>
      <section className="settings-card"><div className="settings-title"><Settings/><div><h2>Experience</h2><p>Make Nestly feel right for you.</p></div></div>
        <SettingRow title="Smart notifications" text="Get reminders for events, requests and visitor updates." on={notificationsOn} onClick={()=>toggle(setNotificationsOn,notificationsOn,'Smart notifications')}/>
        <SettingRow title="Motion & 3D effects" text="Keep the elevated cards and smooth interactions enabled." on={motion} onClick={()=>toggle(setMotion,motion,'Motion effects')}/>
        <SettingRow title="Compact dashboard" text="Fit more community information on one screen." on={compact} onClick={()=>toggle(setCompact,compact,'Compact dashboard')}/>
      </section>
      <section className="settings-card"><div className="settings-title"><ShieldCheck/><div><h2>Privacy & security</h2><p>Keep your community information protected.</p></div></div>
        <SettingRow title="Private contact details" text="Show masked phone numbers in the resident directory." on={privacy} onClick={()=>toggle(setPrivacy,privacy,'Private contact details')}/>
        <div className="security-row"><span><LockKeyhole/><div><b>Login protection</b><small>Industry-standard protection is active.</small></div></span><em>Protected</em></div>
      </section>
      <section className="settings-card data-health"><div className="settings-title"><Database/><div><h2>Demo data & reliability</h2><p>Your actions are saved locally in this browser.</p></div><span className="data-live"><i/> Saved</span></div><div className="health-grid"><div><b>Local persistence</b><small>Requests, visitors, bookings and posts survive refreshes.</small></div><div><b>Failure recovery</b><small>Unexpected UI errors show a retry screen instead of a blank page.</small></div></div><button className="danger-outline" onClick={()=>{if(window.confirm('Reset all Nestly demo data?')) resetDemo();}}>Reset demo data</button></section>
      <section className="settings-card settings-shortcuts"><div className="settings-title"><Sparkles/><div><h2>Quick preferences</h2><p>Useful shortcuts for everyday community life.</p></div></div><div className="shortcut-grid"><button onClick={()=>toast('Community help center opened.')}>Help center <ArrowRight/></button><button onClick={()=>toast('Feedback form opened.')}>Send feedback <ArrowRight/></button><button onClick={()=>toast('Terms and privacy opened.')}>Privacy & terms <ArrowRight/></button><button onClick={()=>toast('Notification history opened.')}>Notification history <ArrowRight/></button></div></section>
    </div>
  </div>
}

function SettingRow({title,text,on,onClick}:any){return <div className="setting-row"><div><b>{title}</b><small>{text}</small></div><button className={`toggle ${on?'on':''}`} onClick={onClick} aria-label={title}><span/></button></div>}

function InfoCard({icon:Icon,title,sub}:any){
  return (
    <div className="info-card">
      <Icon/>
      <div>
        <b>{title}</b>
        <small>{sub}</small>
      </div>
    </div>
  );
}
function EmergencyContacts({toast}:any){
  const contacts=[
    ['Security Desk','24/7 gate & emergency assistance','+91 90000 11001',ShieldCheck],
    ['Ambulance','Medical emergency response','108',Plus],
    ['Fire & Rescue','Fire and rescue services','101',Sparkles],
    ['Police','Police emergency assistance','100',ShieldCheck],
  ];
  return <div className="content inner emergency-page"><PageHead eyebrow="SAFETY FIRST" title="Emergency contacts" sub="Reach the right help quickly when every second matters." action={<button className="primary" onClick={()=>toast('Emergency guide opened.') }><ShieldCheck size={17}/> Safety guide</button>}/><div className="emergency-banner"><div><span className="community-chip">24 / 7 SUPPORT</span><h2>Need urgent help?</h2><p>Use the contacts below for immediate assistance. Security is available around the clock.</p></div><div className="sos-orb">SOS</div></div><div className="emergency-grid">{contacts.map(([name,desc,phone,Icon]:any)=><article className="emergency-card" key={name}><span className="emergency-icon"><Icon size={22}/></span><div><h2>{name}</h2><p>{desc}</p><strong>{phone}</strong></div><button onClick={()=>toast(`Calling ${name}: ${phone}`)}><Phone size={17}/> Call</button></article>)}</div><div className="safety-note"><ShieldCheck/><div><b>Safety tip</b><p>For a community emergency, call the appropriate emergency service first, then inform the security desk so the gate team can assist.</p></div></div></div>}

function Modal({title,close,toast,onSave}:any){
  const [form,setForm]=useState({
    name:title.startsWith('Facility booking:')
      ? title.replace('Facility booking: ','')
      : '',
    phone:'',
    category:'Plumbing',
    priority:'Medium',
    date:'',
    time:'',
    description:'',
    email:'',
    amount:'18,450'
  });

  const [error,setError]=useState('');
  const [saving,setSaving]=useState(false);

  const update=(key:string,value:string)=>{
    setForm((f:any)=>({...f,[key]:value}));
  };

  const isProfile=title==='My Profile';
  const isRequest=title.includes('service request');
  const isVisitor=title.includes('visitor pass');
  const isBooking=title.includes('booking');
  const isNotice=title.includes('notice');
  const isMarket=title.includes('List an item');
  const isPayment=title==='Pay maintenance';
  const isPost=title.includes('community post');

  function renderFields(){

    if(isProfile){
      return (
        <>
          <label>
            Full name
            <input
              value={form.name}
              onChange={e=>update('name',e.target.value)}
              placeholder="Alex Resident"
            />
          </label>

          <label>
            Email
            <input
              value={form.email}
              onChange={e=>update('email',e.target.value)}
              placeholder="alex@example.com"
            />
          </label>

          <label>
            Phone
            <input
              value={form.phone}
              onChange={e=>update('phone',e.target.value)}
              placeholder="+91 98••• 2214"
            />
          </label>
        </>
      );
    }

    if(isVisitor){
      return (
        <>
          <label>
            Visitor name
            <input
              value={form.name}
              onChange={e=>update('name',e.target.value)}
              placeholder="Enter visitor name"
            />
          </label>

          <div className="modal-two">
            <label>
              Date
              <input
                type="date"
                value={form.date}
                onChange={e=>update('date',e.target.value)}
              />
            </label>

            <label>
              Time
              <input
                type="time"
                value={form.time}
                onChange={e=>update('time',e.target.value)}
              />
            </label>
          </div>

          <label>
            Purpose
            <select
              value={form.category}
              onChange={e=>update('category',e.target.value)}
            >
              <option>Guest</option>
              <option>Delivery</option>
              <option>Service staff</option>
            </select>
          </label>
        </>
      );
    }

    if(isRequest){
      return (
        <>
          <label>
            Issue title
            <input
              value={form.name}
              onChange={e=>update('name',e.target.value)}
              placeholder="e.g. Bathroom tap leakage"
            />
          </label>

          <div className="modal-two">
            <label>
              Category
              <select
                value={form.category}
                onChange={e=>update('category',e.target.value)}
              >
                <option>Plumbing</option>
                <option>Electrical</option>
                <option>Facility</option>
                <option>Security</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              Priority
              <select
                value={form.priority}
                onChange={e=>update('priority',e.target.value)}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
          </div>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={e=>update('description',e.target.value)}
              placeholder="Describe the issue..."
            />
          </label>
        </>
      );
    }

    if(isBooking){
      return (
        <>
          <label>
            Facility
            <input
              value={form.name}
              onChange={e=>update('name',e.target.value)}
              placeholder="Gym / Pool / Clubhouse"
            />
          </label>

          <div className="modal-two">
            <label>
              Date
              <input
                type="date"
                value={form.date}
                onChange={e=>update('date',e.target.value)}
              />
            </label>

            <label>
              Time
              <input
                type="time"
                value={form.time}
                onChange={e=>update('time',e.target.value)}
              />
            </label>
          </div>
        </>
      );
    }

    if(isPayment){
      return (
        <div className="payment-confirm">
          <b>September maintenance</b>
          <strong>₹18,450</strong>
          <small>Demo payment · no real money will be charged.</small>
        </div>
      );
    }

    if(isPost){
      return (
        <label>
          Post content
          <textarea
            value={form.description}
            onChange={e=>update('description',e.target.value)}
            placeholder="Share an update, question or helpful tip..."
          />
        </label>
      );
    }

    if(isMarket){
      return (
        <>
          <label>
            Item / property name
            <input
              value={form.name}
              onChange={e=>update('name',e.target.value)}
              placeholder="What are you listing?"
            />
          </label>

          <div className="modal-two">
            <label>
              Price
              <input
                value={form.amount}
                onChange={e=>update('amount',e.target.value)}
                placeholder="₹ 2,500"
              />
            </label>

            <label>
              Category
              <select
                value={form.category}
                onChange={e=>update('category',e.target.value)}
              >
                <option>Furniture</option>
                <option>Sports</option>
                <option>Rent</option>
                <option>Electronics</option>
              </select>
            </label>
          </div>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={e=>update('description',e.target.value)}
              placeholder="Add item details..."
            />
          </label>
        </>
      );
    }

    return (
      <>
        <label>
          Title
          <input
            value={form.name}
            onChange={e=>update('name',e.target.value)}
            placeholder={isNotice ? 'Announcement title' : 'Enter details'}
          />
        </label>

        <label>
          Description
          <textarea
            value={form.description}
            onChange={e=>update('description',e.target.value)}
            placeholder="Add a short description..."
          />
        </label>
      </>
    );
  }

  async function save(){

    if(
      !isProfile &&
      !isPayment &&
      !isPost &&
      !form.name.trim() &&
      !isNotice
    ){
      setError('Please complete the main field before saving.');
      return;
    }

    setError('');
    setSaving(true);

    try{
      await onSave(form);
      close();

      toast(
        isProfile
          ? 'Profile updated successfully.'
          : `${title} saved successfully.`
      );

    }catch(e:any){
      setError(
        e.message || 'Could not save. Please try again.'
      );

    }finally{
      setSaving(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onClick={close}
    >
      <div
        className="modal modal-rich"
        onClick={e=>e.stopPropagation()}
      >
        <button
          className="modal-x"
          onClick={close}
        >
          <X/>
        </button>

        <span className="modal-mark">
          <Sparkles/>
        </span>

        <h2>{title}</h2>

        <p>
          {isProfile
            ? 'Update your community profile details.'
            : 'Complete the details and save this action to the local demo state.'
          }
        </p>

        {renderFields()}

        {error && (
          <div className="modal-error">
            {error}
          </div>
        )}

        <div className="modal-actions">

          <button
            className="secondary"
            onClick={close}
          >
            Cancel
          </button>

          <button
            className="primary"
            onClick={save}
            disabled={saving}
          >
            {saving ? (
              <>
                <RefreshCw
                  size={17}
                  className="spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Check size={17}/>
                Save
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}

export default App
