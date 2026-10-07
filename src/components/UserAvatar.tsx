export default function UserAvatar({
  name,
  image,
}: {
  name: string;
  image?: string | null;
}) {
  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-orange-700"
    >
      {image ? (
        // biome-ignore lint/performance/noImgElement: Uses the same local uploads as recipe images.
        <img src={image} alt="" className="size-full object-cover" />
      ) : (
        name.trim().charAt(0).toLocaleUpperCase() || "👤"
      )}
    </span>
  );
}
