
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 dark:bg-gray-300">
      <h1 className="text-2xl font-bold dark:text-black">ProShop</h1>
      <p className="dark:text-black">Database connection test</p>
      <a
        href="/api/db-test"
        className="rounded-lg bg-black px-5 py-3 text-white"
      >
        Test Database Connection
      </a>
    </main>
  );
}
