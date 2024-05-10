import { HttpAgent, Identity, Agent, ActorSubclass } from "/home/formazione/Desktop/testICP/icrc7/node_modules/@dfinity/agent";
import { AuthClient } from "/home/formazione/Desktop/testICP/icrc7/node_modules/@dfinity/auth-client";
import { createActor as createBackendActor, marketplace_backend } from "../../declarations/marketplace_backend";
import { createActor as createIcrcActor} from "../../declarations/icrc7";
import { _SERVICE } from "../../declarations/icrc7/icrc7.did";
import { isSafari } from 'react-device-detect';

function App() {

  let identity: Identity;
  let agent: Agent;
  let actorBackend = marketplace_backend;
  let actorsIcrc7 = new Map<string, ActorSubclass<_SERVICE>>();

  const local_ii_url = isSafari ? 
    `http://127.0.0.1:4943/?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}`: 
    `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943/`;


  const iiUrl = process.env.DFX_NETWORK === "ic" ?
    `https://${process.env.CANISTER_ID_INTERNET_IDENTITY}.ic0.app`: 
    local_ii_url;

  async function handleLogin() {

      const authClient = await AuthClient.create();

      const iiUrl = document.querySelector<HTMLInputElement>("#iiUrl")!.value;
      const canisterBackendId = process.env.CANISTER_ID_MARKETPLACE_BACKEND;

      await new Promise<void>((resolve, reject) => {
        authClient.login({
          identityProvider: iiUrl,
          onSuccess: resolve,
          onError: reject,
        });
      });

      identity = authClient.getIdentity()

      agent = new HttpAgent({ identity: identity as unknown as Identity });

      actorBackend = createBackendActor(canisterBackendId as string, {
        agent
      });

      let canisters = await actorBackend.get_canister_ids([]);

      if ("Ok" in canisters) {
        canisters.Ok.forEach(x => {
          actorsIcrc7.set(x, createIcrcActor(x, {
            agent,
          }));
        })
      }
  }

  async function display_canister() {
    console.log(await actorBackend.get_canister_ids([]))
  }
  
  async function mint() {
    let canisters = await actorBackend.get_canister_ids([]);
    let canisterId = "";
    if ("Ok" in canisters) {
      canisterId = canisters.Ok[1]
    }
    await actorsIcrc7.get(canisterId)?.icrc7_mint({
      to: { owner: identity!.getPrincipal(), subaccount: [] }, token_id: BigInt(400), memo: [],
      from_subaccount: [], token_description: [], token_logo: [], token_name: [],
      token_privilege_code: []
    }, [])
  }

  async function createCanister() {
    let result = await actorBackend.create_collection_nfts({
      canister_arg: {
        icrc7_symbol: "c",
        icrc7_name: "aasd",
        icrc7_description: [],
        icrc7_logo: [],
        icrc7_supply_cap: BigInt(50),
        icrc7_max_query_batch_size: [],
        icrc7_max_update_batch_size: [],
        icrc7_max_take_value: [],
        icrc7_default_take_value: [],
        icrc7_max_memo_size: [],
        icrc7_atomic_batch_transfers: [],
        tx_window: [],
        permitted_drift: []
      },
      nfts: [{
        token_description: "standard ticket",
        quantity: 30n,
        token_logo: "logo standard",
        token_name: "standard",
        token_privilege_code: 1
      },
      {
        token_description: "premium ticket",
        quantity: 20n,
        token_logo: "logo",
        token_name: "premium",
        token_privilege_code: 2
      }]
    });
    console.log(result)

    if ("Ok" in result) {
      actorsIcrc7.set(result.Ok, createIcrcActor(result.Ok, {
        agent,
      }));
    }

  }
  
  function lesgo() {

  }

  async function symbol() {
    const canisterIcircId = document.querySelector<HTMLInputElement>("#canisterIDforSymbol")!.value
    //console.log(await actorBackend.collection_symbol(canisterIcircId))
  }

  return (
    <main>
      <h1>Internet Identity Demo Webapp</h1>
      <section>
        <label htmlFor="iiUrl">Internet Identity URL:</label>
        <input size={50} id="iiUrl" type="text" value={iiUrl} readOnly/>
      </section>
      <section>
        <button onClick={handleLogin}>Login with Internet Identity</button><br/><br/>
        <button onClick={createCanister}>create canister</button><br/><br/>
        <button onClick={display_canister}>display all your canisters</button><br/><br/>
        <button >get all nfts</button><br/><br/>
        <button >show token metadata</button><br/><br/>
        <button >minting authority</button><br/><br/>
        <button >supply cap</button><br/><br/>
        <button >total supply</button><br/><br/>
        <button >transfer</button><br/><br/>
        <button >supported standard</button><br/><br/>
        <button >burn</button><br/><br/>
        <button >balance of</button><br/><br/>
        <button >logo</button><br/><br/>
        <button >name</button><br/><br/>
        <input id="canisterIDforSymbol" type="text"/><br/>
        <button onClick={symbol}>symbol</button><br/><br/>
        <button onClick={mint}>mint</button><br/><br/>
        <button >name</button><br/><br/>
        <button >set minting authority</button><br/><br/>
        <button >owner of</button><br/><br/>
        <button >approve</button><br/><br/>
        <input id="canisterID" type="text"/><br/>
        <button >set collection</button><br/><br/>


      </section>
      <section id="loginStatus">
        <p>Not logged in</p>
      </section>
    </main>
  );
}

export default App;
