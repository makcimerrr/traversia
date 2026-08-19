import { cn } from "@/lib/utils"
import { DIFFICULTY_LABELS, type Difficulty } from "@/lib/types"

/** Cinq carrés pleins/vides : une échelle qui se lit sans couleur. */
export function DifficultyMeter({
  value,
  showLabel = true,
  className,
}: {
  value: Difficulty
  showLabel?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="flex items-center gap-[3px]"
        role="img"
        aria-label={`Difficulté ${value} sur 5 : ${DIFFICULTY_LABELS[value]}`}
      >
        {[1, 2, 3, 4, 5].map((step) => (
          <span
            key={step}
            className={cn(
              "size-[7px] border border-foreground",
              step <= value ? "bg-foreground" : "bg-transparent",
            )}
          />
        ))}
      </div>
      {showLabel && (
        <span className="label-sm text-muted-foreground">
          {DIFFICULTY_LABELS[value]}
        </span>
      )}
    </div>
  )
}
