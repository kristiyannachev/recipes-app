interface RecipeImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  placeholderClassName?: string;
}

export default function RecipeImage({
  src,
  alt,
  className = "",
  imageClassName = "",
  placeholderClassName = "text-6xl",
}: RecipeImageProps) {
  return (
    <div
      className={`aspect-square w-full overflow-hidden bg-stone-100 ${className}`}
    >
      {src ? (
        // biome-ignore lint/performance/noImgElement: Also renders local blob URLs for upload previews.
        <img
          src={src}
          alt={alt}
          className={`object-cover w-full h-full ${imageClassName}`}
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center text-stone-300 ${placeholderClassName}`}
        >
          🍽️
        </div>
      )}
    </div>
  );
}
