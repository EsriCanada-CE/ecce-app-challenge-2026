import type { ThemeComponentStyleOptions } from 'jimu-theme'

export const CssBaseline: ThemeComponentStyleOptions['CssBaseline'] = {
  root: () => ({
    .jimu-alert-severity-warning {
  visibility: hidden !important; 
  display: none !important;}
  })
}
