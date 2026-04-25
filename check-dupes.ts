import { flatIatfData } from './src/data/iatfData';

const ids = flatIatfData.map(c => c.id);
const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index);
console.log('Duplicates:', duplicates);
