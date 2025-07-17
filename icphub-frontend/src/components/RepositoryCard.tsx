'use client';

import Link from 'next/link';

export default function RepositoryCard({ repo }: { repo: any }) {
  return (
    <Link href={`/repository/${repo.id}`}>
      <div className="border p-4 rounded shadow hover:shadow-lg transition cursor-pointer">
        <h3 className="text-xl font-semibold">{repo.name}</h3>
        <p className="text-sm text-gray-500">
          {repo.isPrivate ? '🔒 Private' : '🌍 Public'} · {new Date(Number(repo.createdAt) / 1_000_000).toLocaleString()}
        </p>
        {repo.description && <p className="mt-2 text-gray-700">{repo.description}</p>}
      </div>
    </Link>
  );
}
