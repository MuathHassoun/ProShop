// components/profile/Avatar.tsx
interface Props {
  name: string;
  src?: string | null;
  className?: string;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export default function Avatar({
  name,
  src,
  className = 'size-24',
}: Props) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${name}'s profile photo`}
        className={`${className} rounded-full object-cover`}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={`${name}'s avatar`}
      className={`${className} grid place-items-center rounded-full bg-[#fdde0b] font-bold text-[#252525]`}
    >
      <span aria-hidden="true" className="text-[1em]">
        {getInitials(name) || '?'}
      </span>
    </span>
  );
}
