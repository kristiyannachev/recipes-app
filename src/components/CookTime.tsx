interface CookTimeProps {
  minutes: number;
  label: string;
  className: string;
  iconClassName: string;
}

export default function CookTime({
  minutes,
  label,
  className,
  iconClassName,
}: CookTimeProps) {
  return (
    <div className={className}>
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        className={iconClassName}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>
        {minutes} {label}
      </span>
    </div>
  );
}
