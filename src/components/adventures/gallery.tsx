import Image from "next/image"

import type { MediaRef } from "@/lib/types"
import { cn } from "@/lib/utils"

/** Galerie en grille, filets fins. Sans image, rien ne s'affiche. */
export function Gallery({ images, className }: { images: MediaRef[]; className?: string }) {
  if (images.length === 0) return null
  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-3",
        className,
      )}
    >
      {images.map((image, i) => (
        <li
          key={image.url}
          className={cn("relative aspect-[4/3] bg-background", i === 0 && "col-span-2 row-span-2 md:aspect-auto")}
        >
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes={i === 0 ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 50vw"}
            className="object-cover grayscale"
          />
        </li>
      ))}
    </ul>
  )
}
