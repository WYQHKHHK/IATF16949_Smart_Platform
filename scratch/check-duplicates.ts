import { iatfData } from '../src/data/iatfData';

const ids = new Set();
const duplicates = [];

function checkNodes(nodes) {
  for (const node of nodes) {
    if (ids.has(node.id)) {
      duplicates.push(node.id);
    }
    ids.add(node.id);
    if (node.subClauses) {
      checkNodes(node.subClauses);
    }
  }
}

checkNodes(iatfData);

if (duplicates.length > 0) {
  console.log('Duplicate IDs found:', duplicates);
} else {
  console.log('No duplicate IDs found.');
}
