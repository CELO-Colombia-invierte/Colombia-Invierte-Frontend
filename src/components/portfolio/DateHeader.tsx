import React from 'react';
import './DateHeader.css';

interface DateHeaderProps {
  date?: Date;
  title?: string;
}

export const DateHeader: React.FC<DateHeaderProps> = ({
  date = new Date(),
  title = 'Mi Portafolio de inversión'
}) => {
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long'
    };
    return date.toLocaleDateString('es-ES', options);
  };

  return (
    <div className="date-header">
      <p className="date-header-date">{formatDate(date)}</p>
      {title && <h1 className="date-header-title">{title}</h1>}
    </div>
  );
};

export default DateHeader;
