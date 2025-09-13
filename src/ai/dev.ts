import {config} from 'dotenv';
config();

import {dev} from 'genkit';
import {categorizeImageFlow} from './flows/categorize-uploaded-images';

dev({
  flows: [
    {
      name: categorizeImageFlow,
      response: {
        referencia: 'REF123',
        marca: 'Marca Exemplo',
        category: 'Exemplo',
      },
    },
  ],
});
