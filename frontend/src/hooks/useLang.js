import { useSelector } from 'react-redux';
import { translations } from '../i18n/translations';
export const useLang = () => {
  const { lang } = useSelector(s => s.lang);
  const t = (key) => translations[lang]?.[key] || translations['en'][key] || key;
  return { t, lang };
};
