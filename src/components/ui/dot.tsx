interface DotProps {
    size?: number;
    color?: string
    className?: string;
    style?: any
}

const Dot = ({ size = 90, color = 'white', className = '', style }: DotProps) => {
    return (
        <div
            {...style}
            className={`w-[${size}px] h-[${size}px] mt-[5px] bg-${color} rounded-full mx-1 ${className}`}
        ></div>
    );
};

export default Dot;
