import React from 'react';
import { Text, TextProps } from 'react-native';

export type AppTextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'body-sm' | 'caption' | 'label';
export type AppTextWeight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
  weight?: AppTextWeight;
  className?: string;
  children: React.ReactNode;
}

/**
 * A reusable Text component that defaults to the Outfit font family.
 * Supports various variants and weights as defined in the typography system.
 */
export const AppText = ({ 
  variant = 'body', 
  weight, 
  className = '', 
  children, 
  ...props 
}: AppTextProps) => {
  
  const getVariantClass = () => {
    switch (variant) {
      case 'h1': return 'text-4xl font-outfit-bold';
      case 'h2': return 'text-3xl font-outfit-semibold';
      case 'h3': return 'text-2xl font-outfit-semibold';
      case 'h4': return 'text-xl font-outfit-medium';
      case 'body': return 'text-base font-outfit';
      case 'body-sm': return 'text-sm font-outfit';
      case 'caption': return 'text-xs font-outfit';
      case 'label': return 'text-xs font-outfit-medium uppercase tracking-wider text-gray-400';
      default: return 'text-base font-outfit';
    }
  };

  const getWeightClass = () => {
    if (!weight) return ''; // Use variant default if weight not specified
    switch (weight) {
      case 'light': return 'font-outfit-light';
      case 'regular': return 'font-outfit';
      case 'medium': return 'font-outfit-medium';
      case 'semibold': return 'font-outfit-semibold';
      case 'bold': return 'font-outfit-bold';
      case 'extrabold': return 'font-outfit-extrabold';
      default: return 'font-outfit';
    }
  };

  const combinedClassName = `${getVariantClass()} ${getWeightClass()} ${className}`.trim();

  return (
    <Text 
      className={combinedClassName} 
      {...props}
    >
      {children}
    </Text>
  );
};
