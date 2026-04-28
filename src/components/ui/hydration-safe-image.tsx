import NextImage from "next/image";
import type { ComponentProps } from "react";

type HydrationSafeImageProps = ComponentProps<typeof NextImage>;

export default function HydrationSafeImage(props: HydrationSafeImageProps) {
  return <NextImage {...props} suppressHydrationWarning />;
}
