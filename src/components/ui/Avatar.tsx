interface AvatarProps {
    name: string;
    src?: string | null;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export default function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    const sizeClass = {
        sm: 'avatar-sm',
        md: '',
        lg: 'avatar-lg',
        xl: 'avatar-xl',
    }[size];

    return (
        <div className={`avatar ${sizeClass} ${className}`}>
            {src ? (
                <img src={src} alt={name} />
            ) : (
                initials
            )}
        </div>
    );
}
