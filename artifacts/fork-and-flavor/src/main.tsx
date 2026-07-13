import { createRoot } from 'react-dom/client';

import App from './App';
import { loadAdSenseScript } from '@/lib/adsense';

import './index.css';

loadAdSenseScript();

createRoot(document.getElementById('root')!).render(<App />);
