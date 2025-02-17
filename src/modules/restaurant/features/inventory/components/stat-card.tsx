interface StatCardProps {
    title: string;
    value: string;
    subtitle: string;
    color: string;
    secondaryValue?: string;
    secondarySubtitle?: string;
  }
  
  const StatCard = ({
    title,
    color,
    value,
    subtitle,
    secondaryValue,
    secondarySubtitle,
  }: StatCardProps) => {
    return (
      <div className="py-2 px-4 transition-transform duration-200 hover:scale-105">
        <h3 className={`${color} text-sm font-medium`}>{title}</h3>
        <div className="mt-2 flex justify-between items-end">
          <div>
            <p className="text-2xl font-semibold text-gray-700">{value}</p>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
          {secondaryValue && (
            <div className="text-right">
              <p className="text-lg font-medium">{secondaryValue}</p>
              <p className="text-sm text-gray-500">{secondarySubtitle}</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default StatCard;