import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';

interface WardSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const WardSelector: React.FC<WardSelectorProps> = ({ value, onChange }) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="ward-select">{t('dashboard.ward')}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="ward-select" className="bg-background">
          <SelectValue placeholder={t('dashboard.selectWard')} />
        </SelectTrigger>
        <SelectContent className="bg-background border border-border z-50">
          <SelectItem value="all">{t('ward.allWards')}</SelectItem>
          <SelectItem value="1">{t('ward.ward1')}</SelectItem>
          <SelectItem value="2">{t('ward.ward2')}</SelectItem>
          <SelectItem value="3">{t('ward.ward3')}</SelectItem>
          <SelectItem value="4">{t('ward.ward4')}</SelectItem>
          <SelectItem value="5">{t('ward.ward5')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default WardSelector;