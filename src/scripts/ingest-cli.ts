import { ingestFolder } from "../services/ingest";

const folder = process.argv[2];
if (!folder) {
  console.error("Please provide a folder path to ingest");
  process.exit(1);
}

ingestFolder(folder).then(() => process.exit(0));
