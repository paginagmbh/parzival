import { path } from './util'
import del from 'del'

del([
  path('htdocs/'),
  path('transcripts', 'conversion', '*.xml')
])
