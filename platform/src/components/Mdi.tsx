// Material Design Icons (same family the mobile app uses) drawn from @mdi/js paths.
export default function Mdi({ path, size = 20, className }: { path: string; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}
