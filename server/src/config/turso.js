import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const url = (process.env.TURSO_DATABASE_URL || 'libsql://zyntra-manan1127.aws-ap-south-1.turso.io').trim().replace(/^["']|["']$/g, '');
const authToken = (process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTE0NTcwOTYsImlkIjoiMDFhMTFiMjktNWEwMS03MzhhLWE0ZGEtNWEzYTZiNGIzODk2Iiwia2lkIjoiZTM4WGhIRTlzSEk3bGlLYUNpVVBLNzNSbGpLelRxeUZDbTlmVWpabm1mOCIsInJpZCI6IjFlMWM0ZGYwLTc3NjQtNGQwYS1hNGE5LThiMzEyN2ZjMjE5MCJ9.4tFpzk8dyzBaJc0BlzRWgPoOWweMQfzWRuywjqREWBBS9EiFbjqMUZF-aRpOnLauwCisPbzkrgCb35P-0S3RDQ').trim().replace(/^["']|["']$/g, '');

export const db = createClient({
  url,
  authToken,
});
