import { HttpAgent, Actor } from "@dfinity/agent";
import { idlFactory as backendIDL } from "../../../declarations/icphub_backend_backend";
import { canisterId as backendCanisterId } from "../../../declarations/icphub_backend_backend";

const agent = new HttpAgent({ host: "http://127.0.0.1:4943" });

export const backendActor = Actor.createActor(backendIDL, {
  agent,
  canisterId: backendCanisterId,
});
