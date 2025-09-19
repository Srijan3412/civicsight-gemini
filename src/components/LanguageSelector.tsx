import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useLanguage, LANGUAGES, Language } from '@/contexts/LanguageContext';

const LanguageSelector: React.FC = () => {
  const { currentLanguage, setLanguage } = useLanguage();

  return (
    <Select value={currentLanguage} onValueChange={(value: Language) => setLanguage(value)}>
      <SelectTrigger className="w-auto min-w-[140px] bg-background border-border hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-background border-border z-50">
        {LANGUAGES.map((language) => (
          <SelectItem 
            key={language.code} 
            value={language.code}
            className="cursor-pointer hover:bg-accent/50 focus:bg-accent"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{language.nativeName}</span>
              <span className="text-xs text-muted-foreground">({language.name})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;