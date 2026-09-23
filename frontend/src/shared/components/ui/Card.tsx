import React from 'react';
import { Card as AntCard } from 'antd';
import type { CardProps as AntCardProps } from 'antd';

export interface CardProps extends AntCardProps {
  children?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> & {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Description: typeof CardDescription;
  Content: typeof CardContent;
  Footer: typeof CardFooter;
  Meta: typeof AntCard.Meta;
  Grid: typeof AntCard.Grid;
} = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <AntCard
      className={`rounded-2xl border-stay-border shadow-card bg-stay-card-bg transition-all overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </AntCard>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`p-5 sm:p-6 border-b border-stay-border flex items-center justify-between gap-3 ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <h3 className={`text-base sm:text-lg font-bold text-stay-text tracking-tight ${className}`}>{children}</h3>;
};

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <p className={`text-xs text-slate-500 mt-0.5 ${className}`}>{children}</p>;
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`p-5 sm:p-6 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`p-4 bg-stay-bg-app border-t border-stay-border flex items-center justify-between gap-3 ${className}`}>
      {children}
    </div>
  );
};

// Attach subcomponents
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;
Card.Meta = AntCard.Meta;
Card.Grid = AntCard.Grid;

export default Card;
