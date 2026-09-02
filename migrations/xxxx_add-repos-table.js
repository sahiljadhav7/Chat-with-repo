exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE repos (
      id SERIAL PRIMARY KEY,
      github_url TEXT NOT NULL UNIQUE,
      last_indexed_commit_sha TEXT,
      last_indexed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  pgm.sql(`ALTER TABLE chunks ADD COLUMN repo_id INT REFERENCES repos(id);`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE chunks DROP COLUMN repo_id;`);
  pgm.sql(`DROP TABLE repos;`);
};
