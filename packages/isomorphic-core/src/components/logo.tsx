import Image from "next/image";
import { siteConfig } from '@/config/site.config';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  iconOnly?: boolean;
}

export default function Logo({ iconOnly = false, ...props }: IconProps) {
  return (
    <Image
      src={siteConfig.logo}
      alt={siteConfig.title}
      className="w-[80px]"
      width={80}
      priority
    />
  );
}
