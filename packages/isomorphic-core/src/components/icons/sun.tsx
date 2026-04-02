export function SunIcon({
    strokeWidth,
    ...props
}: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={strokeWidth ?? 1.5}
            stroke="currentColor"
            {...props}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5V3m0 18v-1.5m7.5-7.5H21M3 12h1.5m12.364 6.364l1.061 1.061M4.575 4.575l1.061 1.061m12.728 0l-1.061 1.061M4.575 19.425l1.061-1.061M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z"
            />
        </svg>
    );
}