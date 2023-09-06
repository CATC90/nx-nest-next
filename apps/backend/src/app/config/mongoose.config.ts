import assert from 'assert';

export default () => {
  const { DB_CLIENT, DB_PORT, DB_HOST, DB_USER, DB_PASS, DB_NAME } =
    process.env;

  assert(DB_CLIENT, 'DB_CLIENT not specified');
  assert(DB_PORT, 'DB_PORT not specified');
  assert(DB_HOST, 'DB_HOST not specified');
  assert(DB_USER, 'DB_USER not specified');
  assert(DB_PASS, 'DB_PASS not specified');
  assert(DB_NAME, 'DB_NAME not specified');

  return {
    DB_URI: `${DB_CLIENT}://${DB_USER}:${DB_PASS}@${DB_HOST}/?retryWrites=true&w=majority`,
    DB_USER,
    DB_PASS,
  };
};
