export function MoonIcon({
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
                d="M21.752 15.002A9 9 0 1111.998 2.25a7.5 7.5 0 009.754 12.752z"
            />
        </svg>
    );
}