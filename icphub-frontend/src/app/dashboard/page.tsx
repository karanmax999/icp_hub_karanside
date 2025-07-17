'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { HttpAgent, Actor } from "@dfinity/agent";
import { idlFactory, canisterId } from "@/declarations/icphub_backend_backend";

type Repository = {
  id: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  owner: string;
  updatedAt: bigint;
};

export default function DashboardPage() {
  const [backend, setBackend] = useState<any>(null);
  const [ownedRepos, setOwnedRepos] = useState<Repository[]>([]);
  const [collabRepos, setCollabRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const agent = new HttpAgent({ host: "http://127.0.0.1:4943" });
      if (process.env.NODE_ENV === "development") {
        await agent.fetchRootKey();
      }
      const actor = Actor.createActor(idlFactory, {
        agent,
        canisterId,
      });
      setBackend(actor);
    };

    init();
  }, []);

  useEffect(() => {
    if (backend) {
      loadRepos();
    }
  }, [backend]);

  const loadRepos = async () => {
    setLoading(true);
    try {
      const owned = await backend.getUserRepositories();
      const collab = await backend.getCollaboratorRepositories();
      setOwnedRepos(owned);
      setCollabRepos(collab);
    } catch (err) {
      console.error("Failed to load repos", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp)).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">📂 Your Repositories</h1>

      {loading ? (
        <p>Loading repositories...</p>
      ) : (
        <>
          
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-2">🛠️ Owned</h2>
            {ownedRepos.length === 0 ? (
              <p className="text-gray-400">No repositories created yet.</p>
            ) : (
              <ul className="space-y-3">
                {ownedRepos.map((repo) => (
                  <li
                    key={repo.id}
                    className="bg-[#1a1a1a] border border-gray-700 p-4 rounded hover:bg-[#222]"
                  >
                    <Link href={`/repository/${repo.id}`} className="block">
                      <div className="text-lg font-semibold">{repo.name}</div>
                      <div className="text-sm text-gray-400">
                        {repo.description ?? "No description"}
                        {" • "}
                        Updated: {formatDate(repo.updatedAt)}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">🤝 Collaborating On</h2>
            {collabRepos.length === 0 ? (
              <p className="text-gray-400">Not a collaborator in any repo.</p>
            ) : (
              <ul className="space-y-3">
                {collabRepos.map((repo) => (
                  <li
                    key={repo.id}
                    className="bg-[#1a1a1a] border border-gray-700 p-4 rounded hover:bg-[#222]"
                  >
                    <Link href={`/repository/${repo.id}`} className="block">
                      <div className="text-lg font-semibold">{repo.name}</div>
                      <div className="text-sm text-gray-400">
                        {repo.description ?? "No description"}
                        {" • "}
                        Updated: {formatDate(repo.updatedAt)}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
