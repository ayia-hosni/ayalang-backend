import { DataSource } from 'typeorm';

export async function clearDatabase(dataSource: DataSource): Promise<void> {
  const tables = dataSource.entityMetadatas
    .map((entity) => `"${entity.tableName}"`)
    .join(', ');
  if (!tables) return;
  await dataSource.query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
}
