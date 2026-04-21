import type { ThemeComponentStyleOptions } from 'jimu-theme'

export const CssBaseline: ThemeComponentStyleOptions['CssBaseline'] = {
  root: () => ({
    html: {
      .jimu-alert-severity-warning {
  visibility: hidden !important; 
  display: none !important;}
    }
  })
}
