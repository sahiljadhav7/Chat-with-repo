exports.up = (pgm) => {
  pgm.sql(`CREATE EXTENSION IF NOT EXISTS vector;`);
  pgm.sql(`
    CREATE TABLE chunks (
      id SERIAL PRIMARY KEY,
      file_path TEXT NOT NULL,
      content TEXT NOT NULL,
      start_line INT,
      end_line INT,
      embedding vector(384) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE chunks;`);
};
