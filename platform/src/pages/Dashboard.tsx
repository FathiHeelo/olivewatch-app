// "Home": the Stitch "Farmer Web Dashboard". The grove (name, area, trees, health) comes live from Firebase.
import { useHome } from '../data/farm';
import { useLang } from '../i18n';
import Activity from './dashboard/Activity';
import Hero from './dashboard/Hero';
import Metrics from './dashboard/Metrics';
import Toolkit from './dashboard/Toolkit';

export default function Dashboard() {
  const { home, status } = useHome();
  const { t } = useLang();
  if (status === 'loading') return <div className="state" role="status">{t('Loading…')}</div>;
  return (
    <>
      <Hero farm={home.farm} />
      <Metrics />
      <Toolkit />
      <Activity />
    </>
  );
}
