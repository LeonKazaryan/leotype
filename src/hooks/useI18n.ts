import { useTypingStore } from '../store/useTypingStore'
import { getTranslations } from '../config/i18n'

export const useI18n = () => {
  const language = useTypingStore((state) => state.settings.language)
  return getTranslations(language)
}
