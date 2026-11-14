// This test intentionally uses an in-memory implementation of session advisory
// locking; it never accesses DEV/PROD databases or starts background workers.
import { describe, expect, it, vi } from 'vitest';
import { EventEmitter } from 'node:events';

const state = vi.hoisted(() => ({ owner: null as number | null, nextId: 0, holdConnect: false, releaseConnect: null as null | (() => void), holdQuery: false, releaseQuery: null as null | (() => void) }));
vi.mock('../server/db.mjs', async () => {
  const { EventEmitter } = await import('node:events');
  class AdvisoryClient extends EventEmitter {
    id = ++state.nextId;
    async connect() {if(state.holdConnect) await new Promise<void>(resolve=>{state.releaseConnect=resolve;});}
    async query(sql: string) {
      if (sql.includes('pg_try_advisory_lock')) {
        if (state.holdQuery) await new Promise<void>(resolve=>{state.releaseQuery=resolve;});
        if (state.owner === null) state.owner = this.id;
        return {rows:[{ acquired: state.owner === this.id }]};
      }
      if (sql.includes('pg_advisory_unlock')) {
        const released=state.owner === this.id;
        if (released) state.owner = null;
        return {rows:[{pg_advisory_unlock:released}]};
      }
      throw new Error('Unexpected database query');
    }
    removeAllListeners(event?: string) {super.removeAllListeners(event);return this;}
    async end() {if(state.owner === this.id) state.owner = null;}
  }
  return {createDedicatedDatabaseClient:()=>new AdvisoryClient()};
});

describe('Customer Portal single-leader isolation with two independent module instances', () => {
  it('enforces exclusivity, fails over on leader stop, and releases on shutdown', async () => {
    vi.resetModules();
    state.owner=null;
    state.nextId=0;
    const A=await import('../server/background-leader.mjs');
    vi.resetModules();
    const B=await import('../server/background-leader.mjs');
    expect(A.backgroundLeadershipSnapshot().instanceId).not.toBe(B.backgroundLeadershipSnapshot().instanceId);
    let acquiredA=0, acquiredB=0, lostA=0, lostB=0;
    const sleep=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
    const wait=async(fn:()=>boolean,ms=25000)=>{
      const end=Date.now()+ms;
      while(Date.now()<end){if(fn())return;await sleep(50);}
      throw Error('Timed out waiting for leadership');
    };
    try {
      A.startBackgroundLeadership({onAcquired:()=>{acquiredA++;},onLost:()=>{lostA++;}});
      await wait(()=>A.backgroundLeadershipSnapshot().leader);
      B.startBackgroundLeadership({onAcquired:()=>{acquiredB++;},onLost:()=>{lostB++;}});
      await sleep(150);
      expect(A.backgroundLeadershipSnapshot().leader).toBe(true);
      expect(B.backgroundLeadershipSnapshot().leader).toBe(false);
      expect(acquiredA).toBe(1);
      expect(acquiredB).toBe(0);
      await A.stopBackgroundLeadership();
      await wait(()=>B.backgroundLeadershipSnapshot().leader);
      expect(acquiredA).toBe(1);
      expect(acquiredB).toBe(1);
      expect(lostA).toBe(1);
      await B.stopBackgroundLeadership();
      expect(lostB).toBe(1);
      expect(state.owner).toBe(null);
    } finally {
      await A.stopBackgroundLeadership();
      await B.stopBackgroundLeadership();
    }
  }, 30000);
  it('never acquires leadership after shutdown during a delayed database connect', async () => {
    vi.resetModules();
    state.owner=null;
    state.holdConnect=true;
    state.releaseConnect=null;
    const instance=await import('../server/background-leader.mjs');
    let acquired=0;
    try {
      instance.startBackgroundLeadership({onAcquired:()=>{acquired++;}});
      expect(state.releaseConnect).toBeTypeOf('function');
      await instance.stopBackgroundLeadership();
      state.holdConnect=false;
      state.releaseConnect?.();
      await new Promise(resolve=>setTimeout(resolve,80));
      expect(instance.backgroundLeadershipSnapshot().leader).toBe(false);
      expect(acquired).toBe(0);
      expect(state.owner).toBe(null);
    } finally {
      state.holdConnect=false;
      state.releaseConnect?.();
      await instance.stopBackgroundLeadership();
    }
  });

  it('releases a lock obtained from a delayed advisory query after shutdown', async () => {
    vi.resetModules();
    state.owner=null;
    state.holdQuery=true;
    state.releaseQuery=null;
    const instance=await import('../server/background-leader.mjs');
    let acquired=0;
    try {
      instance.startBackgroundLeadership({onAcquired:()=>{acquired++;}});
      for (let i=0; i<30 && !state.releaseQuery; i++) await new Promise(resolve=>setTimeout(resolve,10));
      expect(state.releaseQuery).toBeTypeOf('function');
      await instance.stopBackgroundLeadership();
      state.holdQuery=false;
      state.releaseQuery?.();
      await new Promise(resolve=>setTimeout(resolve,80));
      expect(instance.backgroundLeadershipSnapshot().leader).toBe(false);
      expect(acquired).toBe(0);
      expect(state.owner).toBe(null);
    } finally {
      state.holdQuery=false;
      state.releaseQuery?.();
      await instance.stopBackgroundLeadership();
    }
  });

});
