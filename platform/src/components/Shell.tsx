// App shell: sidebar on the RIGHT (RTL start), 64px top bar with search and, at the left end, the mill switcher.
// On phone widths the sidebar becomes a bottom bar.
import { ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useMillData } from '../data/DataProvider';
import { IconBatches, IconClimate, IconOverview, IconSamples, IconSearch, IconSuppliers, IconTrace } from './Icons';

const nav = [
  { to: '/', label: 'نظرة عامة', short: 'نظرة عامة', icon: <IconOverview />, end: true },
  { to: '/batches', label: 'الدفعات', short: 'الدفعات', icon: <IconBatches /> },
  { to: '/suppliers', label: 'الموردون', short: 'الموردون', icon: <IconSuppliers /> },
  { to: '/samples', label: 'فحص العينات', short: 'العينات', icon: <IconSamples /> },
  { to: '/climate', label: 'المناخ والأقمار الصناعية', short: 'المناخ', icon: <IconClimate /> },
  { to: '/traceability', label: 'التتبع والتقارير', short: 'التتبع', icon: <IconTrace /> },
];

function Banner({ children }: { children: ReactNode }) {
  return (
    <div className="banner" role="alert">
      {children}
    </div>
  );
}

export default function Shell() {
  const { mill, status } = useMillData();
  const navigate = useNavigate();
  const millName = mill?.name ?? 'معصرة النصر — نابلس';

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="wordmark">أوليف ووتش</div>
        <nav aria-label="التنقل الرئيسي">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `nav-row press${isActive ? ' active' : ''}`}>
              {n.icon}
              <span className="nav-label">{n.label}</span>
              <span className="nav-short">{n.short}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main-col">
        <header className="topbar">
          <span className="topbar-mark">أوليف ووتش</span>
          <form
            className="search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get('q');
              navigate(`/batches?q=${encodeURIComponent(String(q ?? ''))}`);
            }}
          >
            <IconSearch />
            <input name="q" type="search" placeholder="ابحث برقم الدفعة أو القرية" aria-label="بحث" />
          </form>
          <span className="demo-note">بيانات تجريبية</span>
          <button type="button" className="mill-switch press" aria-label="تبديل المعصرة">
            <span>{millName}</span>
            <span aria-hidden="true">▾</span>
          </button>
        </header>

        {status === 'fallback' && <Banner>قاعدة البيانات غير متصلة — تُعرض بيانات تجريبية محلية، ولن تُحفظ أي تغييرات.</Banner>}

        <main className="content fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
