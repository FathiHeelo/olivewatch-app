// The old UV oil analyzer route. UV screening now lives at /uv (Zaytoun Vision); old links and deep links land there.
import { Redirect } from 'expo-router';

export default function OilRedirect() {
  return <Redirect href="/uv" />;
}
