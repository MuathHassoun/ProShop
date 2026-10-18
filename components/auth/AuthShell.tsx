// components/auth/AuthShell.tsx
import { mulish } from '@/lib/fonts';

interface Props {
  title: string;
  subtitle: string;
  illustration: React.ReactNode;
  children: React.ReactNode;
  subtitleWidth?: string;
}

export default function AuthShell({
  title,
  subtitle,
  illustration,
  children,
  subtitleWidth = 'max-w-[290px]',
}: Props) {
  return (
    <div
      className={`${mulish.className} mx-auto grid w-full max-w-[1200px] items-center gap-10 px-6 py-10 sm:px-10 lg:min-h-[640px] lg:grid-cols-[360px_1fr] lg:gap-8 lg:px-[85px] lg:py-12`}
    >
      <section className="w-full max-w-[340px] justify-self-center lg:justify-self-start">
        <h1 className="text-[44px] font-extrabold leading-none tracking-tight text-[#252525]">
          {title}
        </h1>
        <p className={`mt-4 ${subtitleWidth} text-[21px] font-normal leading-[1.25] text-[#9a9a9a]`}>
          {subtitle}
        </p>
        <div className="mt-10">{children}</div>
      </section>

      <div aria-hidden="true" className="hidden lg:block">
        {illustration}
      </div>
    </div>
  );
}
